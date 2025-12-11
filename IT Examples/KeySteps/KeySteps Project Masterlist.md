# KeySteps Project Masterlist Analysis

## 1. System Overview

The **KeySteps Project Masterlist** is a high-density **Operational Command Center** built in Excel, designed to manage the logistics of a large-scale longitudinal study ("KeySteps" / 賽馬會童亮計劃). Unlike the VBA-heavy OSP system, this tool relies on **Modern Excel** features (Power Query, Pivot Tables, Slicers) to handle data integration and reporting without macros.

**File:** `KeySteps Project Masterlist.xlsx`
**Role:** Project Logistics & Data Operations Hub
**Tech Stack:** Excel Power Query (Get & Transform), Pivot Tables, Slicers, Structured Tables

## 2. Architecture & Modules

The system acts as a bridge between field operations (surveys, coupons) and strategic planning (school selection).

### Core Modules

| Module | Sheets | Function |
| :--- | :--- | :--- |
| **Survey Operations** | `Parent Survey Combined Overview` | The central registry tracking thousands of survey returns, consent forms, and dropout intentions. |
| **Incentive Management** | `Coupon Assignment`, `Coupon Waiting List` | Manages the distribution of incentives (Coupons) to participants, ensuring audit trails. |
| **Fieldwork Logistics** | `Coupon Distribution Forms K1/K2`, `Contact Points` | Generates printable forms for site visits and tracks logistics hubs. |
| **School Intelligence** | `EDB School List` | A massive, enriched database of Hong Kong kindergartens, likely used for sampling and recruitment. |
| **Quality Assurance** | `LSM`, `Document Checklist for School` | Tracks data validation steps by partner universities (CityU, EdU, HKU). |

## 3. Technical Deep Dive

### A. The "Modern Excel" Approach (No-Code/Low-Code)

Unlike the legacy OSP system which used VBA for everything, this system demonstrates a modern approach:

*   **Power Query Integration:** The presence of multiple `queryTable*.xml` files indicates that data is likely being pulled and transformed from external sources (CSVs or other workbooks) automatically.
*   **Pivot-Driven Dashboards:** With 11+ Pivot Tables and Slicers, the system allows users to "slice and dice" survey return rates by District, School, or Group without writing formulas.
*   **Structured Data:** The extensive use of **Excel Tables** (ListObjects) ensures that formulas expand automatically as new survey data flows in.

### B. The "EDB School List" Database

This sheet is a standout feature, acting as a **Market Intelligence Database**. It contains granular details for hundreds of schools:
*   **Financials:** School Fees, Teacher Salary Ratios, Government Rent.
*   **Demographics:** Student Enrollment numbers, Teacher-to-Pupil ratios.
*   **Curriculum:** Teaching approaches (Activity Approach vs. Thematic), Support for NCS students.
*   **Infrastructure:** Indoor/Outdoor playgrounds, Music rooms.

**Strategic Value:** This allows the project team to filter potential partner schools based on specific criteria (e.g., "Non-profit schools in Sham Shui Po with >100 students and high NCS support").

### C. Complex Logic: The Coupon Algorithm

The `Coupon Assignment` sheet reveals a complex logic flow for incentive management:
1.  **Eligibility Check:** Checks `Coupon Waiting List` to see who needs a coupon.
2.  **Assignment:** Assigns specific `Coupon No.` to `Survey ID`.
3.  **Audit:** Tracks `Distribution Status`, `Date of Reception`, and `Scanned` status to prevent fraud or loss.
4.  **Developer Notes:** Explicit instructions ("Add Survey ID first, and then fill in the Coupon No") guide the operational staff.

## 4. The "Reality Check" Narrative

This system represents the **"Project Management"** facet of the portfolio, specifically **Large-Scale Operations**.

*   **Scale:** It manages a multi-district project involving 3 universities and hundreds of schools.
*   **Modernity:** It showcases proficiency in modern data tools (Power Query) over legacy scripting (VBA).
*   **Detail-Oriented:** From tracking a single parent's signature to analyzing district-wide school facilities, the system covers both micro and macro levels.

## 5. File Manifest (Backend)

*   `KeySteps Project Masterlist.xlsx`: The core application.
*   `xl/queryTables/`: Evidence of Power Query data connections.
*   `xl/pivotTables/`: 11+ Pivot definitions for dynamic reporting.
*   `xl/slicers/`: Interactive UI elements for filtering data.
*   `xl/connections.xml`: Defines how the workbook connects to external data sources.

## 6. Workflow Analysis

1.  **Recruitment:** The team uses `EDB School List` to identify target schools.
2.  **Data Collection:** Surveys are sent out; returns are logged in `Parent Survey Combined Overview`.
3.  **Incentivization:** Eligible parents are identified in `Coupon Waiting List`.
4.  **Distribution:** `Coupon Assignment` allocates specific vouchers, and `Distribution Forms` are printed for the site visit.
5.  **Validation:** `LSM` tracks which university partner (CityU/EdU/HKU) has verified the data.
