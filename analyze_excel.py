import argparse
import pathlib

import pandas as pd


def main() -> int:
    parser = argparse.ArgumentParser(description="Quickly inspect Excel workbook sheets and columns")
    parser.add_argument("file", nargs="?", default="Project Masterlist.xlsx", help="Path to an Excel workbook")
    parser.add_argument("--rows", type=int, default=5, help="Rows to sample per sheet")
    args = parser.parse_args()

    file_path = pathlib.Path(args.file)
    if not file_path.exists():
        print(f"Error: file not found: {file_path}")
        return 2

    try:
        xls = pd.ExcelFile(file_path)
        print(f"File: {file_path}")
        print(f"Sheet names: {xls.sheet_names}")

        for sheet_name in xls.sheet_names:
            print(f"\n--- Sheet: {sheet_name} ---")
            df = pd.read_excel(xls, sheet_name=sheet_name, nrows=max(0, args.rows))
            print(f"Columns: {list(df.columns)}")
            if len(df) > 0:
                print("Sample Data:")
                print(df.head(2).to_string())
    except Exception as e:
        print(f"Error: {e}")
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
