# 4Set-GUI: The Holistic Bundle (Gen 1)

> **Role:** Sole Full-Stack Developer
> **Stack:** Python (Tkinter/PyWin32), Vanilla JS (PWA), LocalForage, AES-256-GCM
> **Status:** Legacy (Replaced by Gen 2: BackendProcessor)

## 1. Executive Summary: The "All-in-One" Replacement

When Qualtrics deprecated their Windows Offline App in 2025, the project faced an existential crisis. **4Set-GUI (Gen 1)** was the immediate, holistic response. It wasn't just a desktop app; it was a **bundled ecosystem** that completely replaced the Qualtrics stack.

It was designed to replace **Gen 0 (The Excel Monolith)** not just because Gen 0 was fragile, but because the **data supply chain was broken**. With the Qualtrics App gone, Gen 0 had no fuel. Gen 1 had to build the *entire* pipeline: from data collection (the App) to validation (the Checking System).

It combined three distinct components into a single installable `.exe`:
1.  **The Test-Taking System:** A fully custom Offline Web App (PWA) for administering the assessment.
2.  **The Desktop Controller:** A Python wrapper for launching, monitoring, and securing the browser.
3.  **The "Invisible" Checking System:** A cloud-connected validation tool designed to replace the manual Excel workflow.

---

## 2. Component 1: The Offline Web Interface

At its core, 4Set-GUI bundled a **Progressive Web Application (PWA)** that served as the actual assessment interface.

*   **Offline-First:** Built with Vanilla JS and Service Workers, it ran 100% offline inside a controlled WebView.
*   **Complex Logic:** Replicated the entire psychometric rule set (skip logic, ceiling rules) in JavaScript (`terminations.js`), ensuring the assessment behaved exactly like the online version.
*   **Local Persistence:** Used `LocalForage` (IndexedDB) to save every keystroke, preventing data loss even if the laptop crashed.

## 3. Component 2: The Desktop Controller (Live Monitoring)

The Python wrapper didn't just launch the web app; it actively supervised it.

*   **Live Monitoring:** It "peeked" into the running assessment, scraping data in real-time to populate a local dashboard for the assessor.
*   **Security:** It handled the **AES-256-GCM** encryption of student data, ensuring that PII was never exposed in plain text on the file system.
*   **Universal Sync:** It managed the upload pipeline, pushing data to Qualtrics, JotForm, and Supabase when internet was available.

## 4. The "Lost" Web App Features

The PWA wasn't just a form; it was a feature-rich application that anticipated many of Gen 3's innovations.

### 4.1. The Admin Panel & Status Lights
Long before Gen 3's dashboard, Gen 1 had a built-in **Admin Panel** (`data-dashboard.js`).
*   **Traffic Lights:** It featured a primitive version of the "Red/Green" status lights, tracking completion rates and missing tasks in real-time.
*   **Dashboard Views:** It supported multiple views (`responses`, `completion`, `collection`) with dynamic column visibility, allowing supervisors to toggle between student-level data and school-level aggregates.
*   **Smart Parsing:** It included logic to fuzzy-match student IDs and names across different platforms (Qualtrics, JotForm) using arrays of potential field names (e.g., `['student-id', 'core-id', 'jotformsubmissionid']`).

### 4.2. Intelligent Logic
*   **Automatic Termination Engine:** The app included a complex **Termination Engine** (`terminations.js`) that automatically stopped specific sub-tests to prevent fatigue.
    *   **ERV (English Vocabulary):** Had 3 distinct termination points (e.g., `ERV_Ter1` checked Q1-Q12; if score < 5, the section ended).
    *   **CM (Cognitive):** Enforced 5 different termination rules with specific score thresholds.
    *   **Chinese Word Reading:** Implemented a "10 Consecutive Incorrect" rule (`CWR_10Incorrect`).
*   **Interactive Guidance:** A **Tutorial System** (`tutorial.js`) provided context-sensitive help overlays for new assessors.
    *   **Task Guides:** Each sub-test (e.g., `SYM`, `TheoryofMind`) had a dedicated HTML guide explaining the "Question Type", "Notes", and "Termination Rules".
    *   **Dynamic Alerts:** For timed tasks like `SYM`, it warned users about the 120-second countdown.

### 4.3. Test of Tests (Debug Mode)
A dedicated **Debug Mode** (`debug.js`) allowed developers to test the testing system itself.
*   **Password Protection:** Access was secured via a system password check (`getSystemPassword`).
*   **Connection Testing:** It included built-in utilities to verify connectivity with **Qualtrics**, **Supabase**, and **JotForm** independently.
*   **Timer Manipulation:** Developers could `pause`, `resume`, or `finish` timers instantly to speed-run through the assessment during testing.

### 4.4. Embedded Sync
*   **Direct Upload:** The app didn't just save locally; it had an **Embedded Upload System** (`jotform-upload.js`) that could push data directly to the cloud.
*   **Dynamic Mapping:** It fetched live question definitions from the JotForm API (`fetchLiveJotformQuestions`) to ensure that local data always mapped correctly to the latest cloud schema, even if the form changed.

### 4.5. Offline Peer-to-Peer Sharing
To solve the "Data Starvation" issue in schools with no internet, the app included a secure **Offline File Sharing** system (`export.js`, `import-ui.js`).
*   **Encrypted Export:** Assessors could export completed tests as **AES-256 Encrypted CSVs** (`.enc` files).
*   **Password Protection:** A dedicated modal (`showPasswordModal`) forced users to set a password before export, ensuring student data remained secure during transfer.
*   **Physical Transfer:** These files could be moved via USB or AirDrop to a "Master Laptop" (Gen 2) for batch processing, effectively creating a "Sneakernet" mesh network.

## 5. Component 3: The "Invisible" Checking System

Gen 1 actually included a sophisticated, cloud-connected validation tool, but it went largely unnoticed.

*   **Cloud-Connected:** Contrary to later assumptions, this system *was* connected to Supabase and Qualtrics. It could validate data against the cloud backend when internet was available.
*   **The Perception Gap:** At this early stage, management did not yet realize the *necessity* of a dedicated checking system. They viewed data collection as a simple "Input -> Save" process.
*   **The "Bad" Label:** It wasn't "bad" technically; it was "bad" strategically because it was **undervalued**. It was buried inside the "Test-Taking App" and ignored until the operational chaos of Gen 2 proved why it was needed.

---

## 6. The "Ban" and the Fall of Gen 1

Despite its sophistication, Gen 1 was ultimately **rejected for deployment** by project leadership.

### 5.1. The "Final Straw" Argument
Management argued that a purely digital, browser-based system introduced a **Single Point of Failure** at the frontline.
*   **The Fear:** If the Web App crashed, the battery died, or the browser cache cleared unexpectedly, the data would be gone forever.
*   **The Verdict:** They deemed it "impossible to maintain" in a high-stakes environment. They demanded a **"Paper Trail"**—a format that could be saved, copied, and printed if necessary.

### 5.2. The Pivot to PDF
This decision forced a hard pivot. We were ordered to:
1.  **Abandon** the Web App for test-taking.
2.  **Fallback** to standard PDF forms (which felt "safer" to management).
3.  **Develop** a backend system to process these PDFs.

This political and operational constraint is what birthed **Gen 2 (BackendProcessor)**.
