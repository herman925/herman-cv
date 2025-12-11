# SEC Publication Records System Analysis

## 1. System Overview

The **SEC Publication Records System** is a specialized **Decision Support System (DSS)** built in Excel/VBA designed to quantify academic performance. Unlike standard bibliometric tools, this system implements complex, department-specific logic to calculate "Research Output Scores" based on a hybrid of international metrics (JCR/SJR) and internal faculty standards (FEHD).

**File:** `SEC Publication Records.xlsm`
**Role:** Academic Performance Quantifier
**Tech Stack:** Excel VBA, Advanced Array Formulas, External Data Connections (JCR/SJR)

## 2. Architecture & Modules

The system operates as a **Relational Database** within Excel, linking staff profiles to publication data and external ranking indices.

### Core Modules

| Module | Sheets | Function |
| :--- | :--- | :--- |
| **Scoring Engine** | `Research Output Scores` | The interactive dashboard. Users select a staff member and date range to generate a dynamic performance report. |
| **Data Warehouse** | `Publication List` | The central repository containing detailed metadata for every publication (DOI, ISSN, Author Position). |
| **Reference Data** | `Journal List 2015/2017`, `JCR Ranking List`, `SJR Ranking List` | Lookup tables for Impact Factors, Quartiles (Q1-Q4), and Faculty Rankings (A*, A, B). |
| **Staff Directory** | `SEC Academic Staffs` | Master data for faculty members, including rank and tenure status. |

## 3. Technical Deep Dive

### A. The "Multi-Model" Scoring Algorithm

The system addresses the complexity of academic credit attribution by calculating scores using **three parallel methodologies** simultaneously:

*   **Method 1 (.15+.15+.7):** Heavily weighted towards First and Corresponding authors.
*   **Method 2 (.2+.2+.6):** A more balanced distribution.
*   **Method 3 (Even Distribution/FEHD Method):** Egalitarian scoring used for specific faculty reporting.

**Evidence:** Columns in `Publication List` explicitly track "Authorship Scoring Method 1", "Method 2", and "Method 3".

### B. Dynamic Ranking Integration

The system automates the "Prestige Lookup" process. Instead of manual entry, it cross-references ISSNs against multiple indices:

1.  **JCR (Journal Citation Reports):** Checks for Impact Factor and Quartile (Q1 is highest).
2.  **SJR (SCImago Journal Rank):** Checks for H-index and SJR Score.
3.  **Internal Lists:** Checks against `Journal List 2017` for Faculty-specific grades (A*, A, B, C).

**Logic:** The system likely uses a "Best Match" algorithm (`MAX()` logic) to award the highest possible score if a journal appears in multiple lists with different rankings.

### C. Data Integrity & Validation

*   **Staff Mapping:** The `SEC Academic Staffs` sheet acts as a foreign key table, ensuring that every publication is correctly attributed to a valid staff ID (`800xxxxx`).
*   **Deduplication:** The `Lists` sheet maintains "Unique Names with Publications" to handle name variations (e.g., "Chan, R." vs "Chan, Randolph").

## 4. The "Reality Check" Narrative

This system represents the **"Data-Driven Management"** facet of the portfolio.

*   **Complexity:** It translates abstract concepts like "Academic Prestige" into hard numbers (Scores).
*   **Granularity:** It tracks granular details like "Affiliation in Publication" (was the work done while employed here?) and "Citation Format (APA 6th)".
*   **Scale:** It manages thousands of rows of publication data, cross-referenced against global datasets (JCR/SJR).

## 5. File Manifest (Backend)

*   `SEC Publication Records.xlsm`: The application file.
*   `xl/vbaProject.bin`: Contains the automation logic for the "Total Score Calculator".
*   `xl/connections.xml`: Evidence of external data linkages, likely used to update JCR/SJR lists or link to other departmental workbooks.
*   `xl/tables/`: Extensive use of Structured Tables (ListObjects) to handle dynamic data ranges.

## 6. Workflow Analysis

1.  **Ingest:** Administrative staff input raw publication data (DOI, Title, Authors) into `Publication List`.
2.  **Enrich:** The system looks up the Journal Name/ISSN in the `JCR` and `SJR` sheets to pull the latest Impact Factors and Rankings.
3.  **Calculate:** Formulas automatically compute the "Final Score" based on the Author's position (1st, 2nd, etc.) and the Journal's Rank.
4.  **Report:** The Head of Department uses `Research Output Scores` to view a summary for "Dr. X" to determine tenure or promotion eligibility.
