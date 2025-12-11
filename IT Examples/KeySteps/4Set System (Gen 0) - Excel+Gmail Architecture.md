# Gen 0: The Excel Monolith Architecture

> **Role:** Data Analyst & Tool Builder
> **Stack:** Excel (Power Query, Complex Formulas), Python (Gmail Parser), Qualtrics (Legacy Email Triggers)
> **Status:** Legacy (Predecessor to 4Set-GUI)

## 1. Executive Summary: The "Works on My Machine" Era

Before the custom apps (Gen 1) or the server infrastructure (Gen 3), there was **Gen 0**: a massive, fragile, yet critical Excel-based checking architecture.

It wasn't just a single file; it was a **system design** that relied on a complex, semi-automated pipeline where Qualtrics would email hourly data dumps, a custom Python script would parse them, and giant Excel workbooks (like `K3 Checking System.xlsx`) would crunch the numbers.

**The Problem:** It was so computationally heavy and complex that it could only run on a single, specific high-performance computer ("The Beast"). When Qualtrics deprecated the email trigger feature, this system degraded into a tedious manual process, creating the urgency for Gen 1.

---

## 2. Architecture: The "Rube Goldberg" Pipeline

The system was a chain of three distinct tools working in precarious harmony.

### 2.1. The Source: Qualtrics Email Triggers

* **Mechanism:** In the early days, Qualtrics allowed setting up "Hourly Export Triggers."
* **Flow:** Every hour, Qualtrics would generate a full CSV export of the dataset and email it to a dedicated Gmail account.

### 2.2. The Bridge: `Four Set Checking System.py`

* **File:** `Four Set Checking System.py` (found in `01 - Assessment Checking System`)
* **Stack:** Python, Gmail API (OAuth2 via `credentials.json`/`token.json`).
* **Function:**
  1. Logged into Gmail using the stored OAuth tokens.
  2. Identified the latest email from Qualtrics.
  3. Downloaded the attachment.
  4. Unzipped and placed the CSV into a specific "Hot Folder" on the E: drive.
* **Maintenance:** Included `Clean GenPY.py` and `Dependency Install.bat` to manage the fragile Python environment on the host machine.

### 2.3. The Brain: The Excel Monolith Pattern

* **The Pattern:** `K1 Checking System.xlsx` (and its variants like `Four Set Checking System.xlsm`) represented a specific architectural pattern: **"The Database in a Spreadsheet."**
* **Design Philosophy:** Instead of a proper database, the system used Excel as a massive calculation engine.
  * **Power Query:** Acted as the ETL (Extract, Transform, Load) layer, ingesting raw CSVs from the "Hot Folder."
  * **Formula Engine:** Thousands of `INDEX/MATCH`, `COUNTIFS`, and Array Formulas processed the raw data against the Master Roster.
  * **Output:** Generated "Traffic Light" reports (Green = Complete, Red = Missing) for each school.
* **The Cost:** This design meant the logic was tightly coupled to the UI. You couldn't update the checking rules without updating the entire 200MB file.

---

## 3. The "Single Point of Failure"

While effective, Gen 0 suffered from extreme fragility:

1. **Hardware Dependency ("The Beast"):**
   * The Excel file was so calculation-heavy it required a specific high-performance workstation.
   * **Office Insider Dependency:** The presence of `02 - Office Insider Deployment Tool` indicates that the system relied on bleeding-edge Excel features (likely dynamic arrays or specific Power Query updates) not available in the standard stable release, further locking it to one machine.
2. **The "Qualtrics Shock" (Offline App Deprecation):**
   * Qualtrics announced the deprecation of their **Offline App**, the critical tool used by field staff to collect data in schools with poor internet.
   * This wasn't just a pipeline break; it was a **supply chain collapse**. Without the Offline App, we could not guarantee 100% data provision.
   * The Excel system (Gen 0) was technically functional, but it was about to be starved of its data source.
3. **The Forced Evolution:** We couldn't just replace the checking system; we had to replace the *entire data collection platform*. This necessity birthed **Gen 1 (4Set-GUI)**—a custom PWA that could handle offline data collection *and* checking.

---

## 4. The Legacy

Gen 0 established the **logic** of the checking system. The rules defined here (e.g., "What counts as a valid complete?") became the blueprint for:

* **Gen 1:** The "Invisible" Cloud Checking System (an attempt to web-ify this logic).
* **Gen 2:** The BackendProcessor (a server-side Python port of this logic).
* **Gen 3:** The 4Set-Server (the final, real-time evolution).
