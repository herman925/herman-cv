# Qualtrics Survey Downloader

## Project Overview
**Context:** KeySteps@JC (IT Support)
**Objective:** To streamline the process of retrieving large-scale survey data from the Qualtrics platform.
**Role:** Developer
**Core Challenge:** The manual export process in Qualtrics is time-consuming for frequent data requests. The team needed a reliable, automated tool to fetch survey responses without navigating the web interface repeatedly.

## Technical Architecture

The solution is a **Desktop GUI Application** built with Python, designed to be lightweight and user-friendly for non-technical staff.

### Tech Stack
*   **Backend:** Python 3
*   **GUI Framework:** **Eel** (A library that allows building GUIs with HTML/CSS/JS while running Python logic in the background).
*   **API:** Qualtrics API v3 (HTTPS requests via `http.client`).
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript.

### Workflow
1.  **Bootstrapping (`Run App.py`):**
    *   Automatically checks for the `eel` library.
    *   Installs dependencies via `pip` if missing, ensuring a "zero-setup" experience for end-users.
2.  **User Interface:**
    *   Users select a survey from a dynamically populated list.
    *   The app fetches the survey definition to allow field selection (optional).
3.  **Export Pipeline (`app.py` & `qualtrics_api.py`):**
    *   **Initiate:** Sends a POST request to `/export-responses` to start the asynchronous export job.
    *   **Poll:** Enters a loop, checking the job status every few seconds until it reports `100%` complete.
    *   **Download & Process:** Retrieves the file (often a ZIP), automatically extracts the content in-memory, and saves the final dataset (CSV/JSON) to the local disk.

## Key Features & Safeguards

### 1. Automated Error Recovery ("Invalid Columns")
*   **Problem:** Qualtrics API sometimes fails an export if specific requested columns are invalid or deprecated.
*   **Solution:** The application parses the error response, identifies the problematic column names using Regex, removes them from the request payload, and **automatically retries** the export without user intervention.

### 2. Secure & Robust API Handling
*   **Direct HTTP Client:** Uses Python's native `http.client` for granular control over headers and request structure, minimizing external dependencies beyond Eel.
*   **Token Management:** Centralized configuration (`config.py`) for API tokens and base URLs.

### 3. User Experience (UX)
*   **Browser Detection:** The app intelligently detects the user's installed browser (Chrome preferred, falling back to Edge) to render the GUI.
*   **Visual Feedback:** The frontend provides real-time status updates (e.g., "Exporting... 45%", "Downloading...", "Complete"), replacing the "black box" experience of command-line scripts.

## Key Artifacts

| File | Description |
| :--- | :--- |
| `Run App.py` | Entry point script that handles environment setup and launches the main app. |
| `app.py` | The core controller that bridges the JavaScript frontend with the Python backend using `eel.expose`. |
| `qualtrics_api.py` | A dedicated module for all Qualtrics API interactions (List Surveys, Get Definition, Export, Download). |
| `web/index.html` | The clean, web-based interface for selecting surveys and triggering downloads. |

## Impact
This tool transformed a repetitive manual task into a single-click operation. By wrapping complex API interactions (asynchronous polling, error handling, zip extraction) in a simple GUI, it empowered the research team to access fresh data independently, reducing the dependency on the IT support team.
