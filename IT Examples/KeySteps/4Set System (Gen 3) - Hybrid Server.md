# 4Set-Server: The Hybrid Infrastructure (Gen 3)

> **Role:** Full Stack Architect & DevOps Engineer
> **Stack:** PowerShell 7 (Daemon), Python (Parsing), Vanilla JS (Frontend), IndexedDB (Caching), Supabase (Logs)

## 1. Background: The Evolution of the Stack

In 2025, **Qualtrics deprecated their Windows Offline App**, forcing us to build our own offline data collection stack. This journey evolved through four distinct generations:

*   **Gen 0 (`K3 Checking System`): The Excel Monolith.**
    *   A massive, calculation-heavy Excel workbook that acted as the original "Source of Truth."
    *   **The Flaw:** It was fragile, required a specific high-power computer ("The Beast"), and faced extinction when Qualtrics killed the **Offline App**, cutting off its data supply.

*   **Gen 1 (`4Set-GUI`): The Holistic Bundle.**
    *   A massive "All-in-One" desktop application that bundled a custom PWA for test-taking, a Python controller for monitoring, and a fully functional (but overlooked) checking system.
    *   **The Fate:** Despite its sophistication, it was **banned from deployment**. Management feared that a browser-based app was a "Single Point of Failure" and mandated a return to PDF forms. The checking system was ignored because the need for validation wasn't yet understood.

*   **Gen 2 (`BackendProcessor`): The "Safety" Pivot.**
    *   A **Desktop GUI Tool** built to bridge the gap between the "safe" PDF forms and our modern data pipeline.
    *   **The Role:** It allowed office staff to batch-convert thousands of "dumb" PDFs into structured JSON, encrypt sensitive ID mappings, and upload data to the cloud.
    *   **The Flaw:** It was a "batch" system—users had to wait until they returned to the office to run the tool. It lacked real-time feedback. **Crucially, it was crippled by the Qualtrics API**, which required slow, single-record polling that locked the UI for minutes at a time.

*   **Gen 3 (`4Set-Server`): The "Perfected" Hybrid Infrastructure.**
    *   **The Synthesis:** We combined the best of both worlds.
    *   **The Catalyst:** The "Horrible" Qualtrics API. Gen 2's upload logic was forced to be synchronous and fragile (1-second polling per record) due to API limitations. This bottleneck made the desktop tool sluggish and unreliable for large batches.
    *   **The Upgrade:**
        1.  **Hands-Off Pipeline:** Replaced manual, blocking uploads with an invisible background watcher that could handle long-running API jobs asynchronously.
        2.  **Real-Time Validation:** The "Checking System" now runs instantly upon upload, streaming results back to the dashboard via Supabase.
        3.  **Rapid Iteration:** Logic lives on the server/dashboard, allowing instant updates without touching the client machines.

---

## 2. Executive Summary: The "Hybrid-Local" Paradigm

The **4Set-Server** is not a traditional web server. It is a **distributed, hybrid-local infrastructure** designed to operate within a strict enterprise environment where cloud deployment was restricted. It acts as the "nervous system" for a large-scale child assessment project, bridging the gap between:

1. **Legacy On-Premise Data:** Excel rosters, PDF score sheets, and restricted network drives.
2. **Modern Cloud APIs:** JotForm (Data Collection), Qualtrics (Survey Data), and Supabase (Telemetry).

It functions as a **PowerShell Daemon** that watches local directories for changes, triggers **Python** parsers, and synchronizes data to the cloud, while serving a **static, client-side rendered** dashboard to end-users.

---

## 3. Security Architecture: The "Fort Knox" Standard

Security was not an afterthought; it was the foundational constraint. The system handles sensitive PII (Student IDs, Names) and must operate on shared workstations without compromising credentials.

### 3.1. Encryption at Rest (AES-256-GCM)

All sensitive assets—API keys, student ID mappings, and configuration files—are encrypted using **AES-256-GCM**.

* **Key Derivation:** Keys are derived from a "System Password" using **PBKDF2** (SHA-256, 100,000 iterations) with a unique 16-byte salt per file.
* **Ciphertext Layout:** The `.enc` file format is strictly defined: `Salt (16B) + IV (12B) + Ciphertext (N) + Auth Tag (16B)`.
* **Runtime Decryption:** The frontend (`secure-credentials.js`) prompts the user for the password *once* per session, decrypts the payload in memory using the **Web Crypto API**, and never writes the plaintext back to disk.

### 2.2. The "No Hardcoding" Rule

* **Zero Secrets in Code:** The repository contains **zero** API keys or passwords. Even the `credentials.json` file is git-ignored and exists only on secure production volumes.
* **Credential Rotation:** A dedicated "Rotation Runbook" allows security engineers to re-encrypt all assets with a new system password in minutes, invalidating old access without code changes.

---

## 3. The Checking System: A 5-Level Drill-Down Engine

The core value proposition is the **Checking System**, a massive data visualization engine that tracks the completion status of thousands of students across 4 assessment "Sets".

### 3.1. The Hierarchy

The system allows administrators to drill down from a macro view to a micro view instantly:

1. **District Level:** Aggregated stats for "Kowloon City", "Sham Shui Po", etc.
2. **Group Level:** Organizational groupings of schools.
3. **School Level:** Completion dashboards for individual principals.
4. **Class Level:** Teacher-centric views with "Traffic Light" status.
5. **Student Level:** The atomic unit—a detailed breakdown of every single question answered.

### 3.2. The "Traffic Light" Logic & Guardrails

The system doesn't just count answers; it **validates** them against complex psychometric rules.

* 🟢 **Green (Complete):** All required questions answered OR valid termination triggered.
* 🟡 **Yellow (Warning):** "Post-Termination Data" detected. (e.g., A student "failed" Stage 1 but continued to answer Stage 2 questions. This indicates a protocol violation).
* 🔴 **Red (Incomplete):** Missing data or invalid termination.
* ⚪ **Grey (Not Started):** No data found.

### 3.3. The "Ignored Questions" Principle

To calculate accurate statistics, the system implements a strict **exclusion logic**:

> *If a student terminates a task at Question 10, Questions 11-50 are marked as **"Ignored"** and removed from the denominator.*

* **Without this:** A student answering 10/10 questions correctly (and terminating) would show `10/50 = 20%` completion.
* **With this:** They show `10/10 = 100%` completion.

---

## 4. Data Pipelines & Workflows

The system orchestrates a complex flow of data from multiple sources into a unified "Source of Truth".

### 4.1. The Ingestion Pipeline

1. **File Watcher:** The PowerShell daemon monitors a specific OneDrive folder for new PDF uploads.
2. **Lock Detection:** It waits for the file handle to be released (solving the "Excel Lock" issue).
3. **Python Parsing:** `parse_pdf_cli.py` extracts form data using `pypdf`.
4. **Upsert Strategy:** Data is pushed to JotForm. If a submission exists, it updates it; otherwise, it creates a new one.

### 4.2. The Integration Workflow (JotForm + Qualtrics)

We needed to merge data from two different platforms (JotForm for assessments, Qualtrics for field tests) into a single student record.

* **Challenge:** Cross-Grade Contamination. A student might have K2 data in Qualtrics and K3 data in JotForm.
* **Solution:** A **Composite Key Strategy** (`{CoreID}_{Grade}`). The system detects the grade level from the `sessionkey` or `recordedDate` and creates separate, isolated records for K2 and K3, preventing data corruption.
* **Conflict Resolution:** "Earliest Non-Empty Wins". If both platforms have data for the same field, the system prioritizes the one with the earliest timestamp, ensuring historical accuracy.

### 4.3. Data Provenance Tooltips

To build trust, every data point on the frontend has a "Provenance Tooltip". Hovering over an answer reveals:

* **Source:** "JotForm Submission #123" or "Qualtrics Response #ABC".
* **Timestamp:** When the data was captured.
* **Conflict Status:** If two sources disagreed, which one "won" and why.

### 4.4. Smart Separated Caching Architecture

To balance **security** (protecting decrypted IDs) with **performance** (handling massive datasets), the system uses a split-brain caching strategy:

* **SessionStorage for Identity (Config):** Sensitive, decrypted ID mappings (`schoolid.enc`, `coreid.enc`) are stored in `SessionStorage`.
  * *Why:* It is fast, synchronous, and **ephemeral**. Data is automatically purged when the tab closes, minimizing the attack surface for PII.
* **IndexedDB for Assessment Data (Content):** The massive volume of student submissions (10,000+ records) is stored in `IndexedDB`.
  * *Why:* It is asynchronous and persistent. It allows the dashboard to perform complex queries (e.g., "Find all K3 students in District A") without blocking the UI thread, and enables **offline functionality**.

### 4.5. Deep API Integrations & Telemetry

The system goes beyond simple REST calls, implementing deep, native integrations to overcome platform limitations:

* **JotForm (The `q3:matches` Breakthrough):** Standard API filters failed at our scale. We discovered and implemented the undocumented `q3:matches` operator, allowing us to filter submissions by `sessionkey` instantly (milliseconds vs. seconds), bypassing the platform's standard rate limits and payload restrictions.
* **Supabase (Real-Time Telemetry):** The PowerShell daemon isn't just a script; it's a connected client. It streams **structured logs**, error stacks, and heartbeat signals directly to a Supabase PostgreSQL instance. This creates a live "Mission Control" dashboard, allowing us to monitor the health of distributed agents across the territory in real-time.

---

## 5. Operational Resilience: Solving "Pain Points"

The architecture is defined by the specific, painful problems it solved.

### 5.1. The Six-Strategy Path Resolution Algorithm

**Problem:** The server runs on different machines (laptops, desktops, VMs) where the "OneDrive" folder path varies wildly.
**Solution:** A heuristic algorithm that tries 6 different strategies to find the root directory:

1. **Environment Variable:** `OneDriveConsumer` / `OneDriveCommercial`.
2. **Registry Lookup:** `HKCU\Software\Microsoft\OneDrive`.
3. **Standard Paths:** `C:\Users\%USERNAME%\OneDrive`.
4. **Relative Paths:** Walking up the directory tree.
   *Result:* The code runs on *any* machine without configuration.

### 5.2. The Parallel Processing Paradox

**Problem:** We initially used `ForEach-Object -Parallel` to speed up API uploads.
**Impact:** It triggered JotForm's DDoS protection, causing 429 (Too Many Requests) errors and silent data loss.
**Fix:** Switched to **Sequential Processing**.

* *Counter-intuitive:* It is "slower" in theory but **faster** in practice because it eliminates retry loops and timeout backoffs. Reliability > Raw Speed.

### 5.3. Adaptive Batch Sizing

**Problem:** JotForm's API silently truncates JSON payloads larger than ~4MB.
**Fix:** The `jotform-cache.js` module implements **Adaptive Batching**.

* It starts with a batch size of 1000.
* If a request fails or times out, it **halves** the batch size (500 -> 250 -> 125).
* It automatically "heals" the connection by finding the safe throughput limit dynamically.

### 5.4. The "File Locking" Race Condition

**Problem:** When a user saves an Excel file, Excel keeps a "Read Lock" on it. The parser would crash when trying to read it.
**Fix:** Implemented `System.IO.FileShare.ReadWrite` in PowerShell.

* Instead of standard `Get-Content`, we use .NET file streams to open the file in "Shared" mode, allowing the parser to read the data *even while the user has it open in Excel*.

---

## 6. Configurable Guardrails: Flexibility by Design

The system is not a "black box"; it features granular feature flags (managed via `config/agent.json`) that allow operators to toggle critical behaviors without code changes.

### 6.1. Data Overwrite Protection (The "Safety Net")

* **Flag:** `dataProtection.enableDataOverwriteProtection` (Default: `true`)
* **Behavior:** When enabled, the agent performs a "Diff Check" before uploading. It **rejects** any update that would overwrite an existing, non-empty assessment score with a different value.
* **Why:** This prevents accidental data loss if a teacher re-uploads an older, incomplete version of a form over a newer, complete one.
* **Flexibility:** Can be toggled to `false` by admins to force-push corrections when necessary.

### 6.2. Computer Number Enforcement (The "Audit Trail")

* **Flag:** `validation.requireComputerNumber` (Default: `false`)
* **Behavior:** Enforces that every PDF must be traceable to a specific physical device (e.g., `KS095`).
* **Why:** In high-security modes, this ensures strict chain-of-custody logging.
* **Flexibility:** Disabled by default to allow processing on Docker containers or unmanaged dev laptops where the hostname doesn't match the inventory schema.

### 6.3. Adaptive UI Configuration

The frontend is equally flexible via `checking_system_config.json`:

* **Cache TTL:** Controls how long the 10k+ student records stay in IndexedDB (0 for dev, 24h for production).
* **Animation Toggles:** Background animations can be disabled for low-power devices.
* **Default View States:** Administrators can set the default "Expanded/Collapsed" state of the class dashboard based on user feedback.

---

## 7. The "Calculation Bible": Psychometric Logic in Code

The system's most critical function is not just moving data, but **understanding** it. The `TaskValidator.js` engine implements the project's "Calculation Bible"—a strict set of psychometric rules that determine if an assessment is valid.

### 7.1. The "Ignored Questions" Exclusion Logic

A major challenge in digitizing paper assessments is handling **Termination Rules** (e.g., "Stop after 5 consecutive errors").

* **The Problem:** If a student stops at Question 10 (out of 50) because they hit the termination rule, a naive system sees 40 missing answers and flags it as "Incomplete" (20%).
* **The Solution:** The validator implements a **Dynamic Denominator**:
    > *When a termination rule is triggered, all subsequent questions are marked as `IGNORED` and removed from the total count.*
    * **Result:** A student who answers 10/10 questions correctly and terminates is marked as **100% Complete**, not 20%. This accurately reflects the *validity* of the session, not just the volume of data.

### 7.2. Complex Branching & Status Indicators

The dashboard uses a nuanced "Traffic Light" system to communicate data quality to researchers instantly:

* 🟢 **Green (Complete):** Valid termination or full completion.
* 🟡 **Yellow (Warning - "Post-Termination Data"):** A critical quality check. It flags scenarios where a student *should* have stopped (e.g., failed Stage 1) but *continued* answering. This indicates a protocol violation by the assessor.
* 🔴 **Red (Incomplete):** Missing data or invalid termination.
* ⚪ **Grey (Not Started):** No data.

### 7.3. Grade-Aware Data Merging

The system respects the longitudinal nature of the study.

* **Strict Separation:** Data from K1, K2, and K3 is **never merged**.
* **Composite Keys:** The `DataMerger.js` module uses `{CoreID}_{Grade}` keys to ensure that a student's K2 Qualtrics survey doesn't accidentally overwrite their K3 JotForm assessment, preserving the integrity of the multi-year dataset.

---

## 8. Comprehensive Logging & Telemetry

In a distributed "Hybrid-Local" environment, you can't SSH into a server to check logs. The system implements a multi-tiered logging strategy that serves two distinct audiences: the non-technical users on the ground and the engineering team at HQ.

### 8.1. User-Facing HTML Reports (The "Self-Service" Layer)
*   **The Problem:** CSV logs are intimidating for school administrators and teachers. When an upload fails, they need immediate, clear feedback in plain English.
*   **The Solution:** The agent automatically generates a `Daily_Report.html` alongside the raw logs.
*   **Mechanism:**
    *   Parses the raw CSV events into a styled, responsive HTML table.
    *   **Color-Coded Status:**
        *   ✅ **Success:** "File `Assessment_K2.pdf` uploaded and verified."
        *   ❌ **Failure:** "File `Scan_001.pdf` rejected. **Reason:** Missing Computer Number. Please rename the file and try again."
*   **Impact:** drastically reduced L1 support tickets. Users can self-diagnose 90% of "upload failures" (usually naming conventions or file corruption) without contacting IT.

### 8.2. Local CSV Logs (The "Black Box")
*   **Format:** Structured CSV files (`timestamp, level, component, message, file_id`) for deep debugging.
*   **Thread-Safety:** Uses `.NET FileShare.ReadWrite` to allow operators to open live logs in Excel without crashing the agent.
*   **Retention:** Automatically rotates and archives logs after 90 days.

### 8.3. Supabase "Mission Control" (Remote Telemetry)
*   **Real-Time Streams:** The PowerShell agent streams structured events (Heartbeats, Upload Success, Validation Failures) to a Supabase PostgreSQL database.
*   **Dashboard:** A remote web interface allows the IT team to see the status of every agent across the territory in real-time.
*   **Dead Letter Queue:** Failed files are moved to `Unsorted/` and a corresponding error event is sent to Supabase, allowing proactive troubleshooting before the user even reports an issue.

---

## 9. Impact & Metrics

* **Scale:** Manages data for **8,000+ students** across **110+ schools**.
* **Speed:** Reduced "Checking" time from **2 weeks** (manual Excel cross-referencing) to **5 minutes** (automated dashboard).
* **Accuracy:** Eliminated 100% of "human calculation errors" in termination logic.
* **Uptime:** The PowerShell daemon has run for **6+ months** continuously without a crash, handling thousands of file events.
