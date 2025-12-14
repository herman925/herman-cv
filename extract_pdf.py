from __future__ import annotations

import argparse
import os
import sys

from pypdf import PdfReader


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Extract text preview and basic metadata from a PDF.",
    )
    parser.add_argument("pdf", help="Path to a PDF file")
    parser.add_argument(
        "--pages",
        type=int,
        default=1,
        help="Number of pages to preview (default: 1)",
    )
    parser.add_argument(
        "--chars",
        type=int,
        default=2000,
        help="Max characters to print per page preview (default: 2000)",
    )
    return parser


def main(argv: list[str]) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)

    file_path = os.path.expanduser(args.pdf)
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return 1

    try:
        reader = PdfReader(file_path)
    except Exception as exc:
        print(f"Error opening PDF: {exc}")
        return 2

    print(f"Analyzing: {file_path}")
    print(f"Pages: {len(reader.pages)}")

    preview_pages = max(0, min(args.pages, len(reader.pages)))
    if preview_pages:
        print("\n[Content Preview]")
        for page_index in range(preview_pages):
            try:
                text = reader.pages[page_index].extract_text() or ""
            except Exception as exc:
                text = f"<extract_text failed: {exc}>"
            snippet = text[: max(0, args.chars)]
            print(f"\n--- Page {page_index + 1} ---")
            print(snippet)

    try:
        fields = reader.get_fields() or {}
    except Exception:
        fields = {}

    if fields:
        print("\n[Form Fields Detected]")
        for field in list(fields.keys())[:25]:
            print(f" - {field}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))

