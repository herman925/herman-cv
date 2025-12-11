# BackendProcessor: The Desktop Bridge (Gen 2)

> **Role:** Desktop Tool Developer
> **Stack:** Python (Tkinter, pypdf, Pandas), AES-256-GCM, Azure Functions
> **Status:** Legacy (Integrated into Gen 3: 4Set-Server)

## 1. Executive Summary: The "Safety First" Pivot

**Gen 2 (BackendProcessor)**, also known as the **"4Set Data Tool"**, was the technical answer to a political problem.

After **Gen 1 (4Set-GUI)** was banned due to fears of web app maintenance efforts, management mandated a new alternative to Qualtrics after its offline Windows app deprecated in summer of 2025. The only free and managable alternative, according to them, was **PDF Forms**. It was much usedas the primary data collection instrument. They viewed PDFs as a "digital paper trail" that was safer than a web app.

However, we couldn't go back to manual data entry. My solution was to build a **Desktop GUI Application** that acted as a bridge: it ingested the "safe" PDF files and converted them into the "modern" JSON format that our pipeline expected.

---

## 2. The Architecture: "Dumb" Input, "Smart" Output

The core innovation was treating the PDF not as a document, but as a **structured data container**.

### 2.1. The Desktop Tool (`data_tool`)

Instead of a server-side script, I built a user-friendly **Python/Tkinter GUI** for the office staff.

* **Batch Parsing:** Used `pypdf` to extract form field data from thousands of PDFs in seconds.
* **Normalization:** Mapped the chaotic PDF field names (e.g., `Q1_Age_Text`) to our canonical JSON schema (`data.age`).
* **Encryption (AES-256-GCM):** The tool locally stored sensitive "ID Mapping" tables (linking anonymous IDs to student names) using military-grade encryption. This allowed staff to "enrich" the data (add names/classes) without exposing the master list in plain text.

### 2.2. The Live Monitor (The "Ghost" Feature)

The most advanced feature of Gen 2 was the **Live PDF Monitor**, a background service designed to solve the "Crash Risk" of using PDF forms.

*   **Real-Time Capture:** The tool didn't just read saved files; it "hooked" into the active PDF viewer process. As assessors typed into the PDF, the monitor captured the data stream in real-time.
*   **On-the-Fly Normalization:** It used a specialized engine (`map_pdf_field_data` in `pdf_tools.py`) to instantly translate raw PDF field names into our clean JSON schema.
*   **Continuous Autosave:** Every few seconds, it generated a **JSON Snapshot** (`autosave.py`) and wrote it to a secure temporary directory.
*   **Crash Recovery:** If the PDF viewer crashed or the laptop battery died before the user hit "Save", the **Merge Dialog** (`merge_dialog.py`) could detect these orphaned snapshots and recover the session data, ensuring zero data loss.

### 2.2. The Pipeline

1. **Collection:** Field staff filled out PDF forms on laptops (offline, safe).
2. **Ingest:** Office staff used the **Data Tool** to batch-convert PDFs -> JSON.
3. **Upload:** The tool securely uploaded the sanitized JSON to **Qualtrics** and **Supabase**.
4. **Validation:** Once in the cloud, the data triggered the same validation logic we designed for Gen 1.

---

## 3. Why We Moved to Gen 3 (4Set-Server)

While the Data Tool saved the project from manual entry, it was still a **manual batch process**.

* **The Bottleneck:** Staff had to wait until they returned to the office to run the tool.
* **The Lag:** Errors in the PDFs (e.g., missing fields) weren't caught until days later.

This led to **Gen 3 (4Set-Server)**, which moved this parsing logic **to the server**. Instead of staff running a tool, the server watched a folder, instantly grabbed uploaded PDFs, and ran the parsing/validation automatically. Gen 2's logic became Gen 3's engine.
