# Randomized Controlled Trial (RCT) Allocation System

## 1. Project Context & Objectives
**Project:** KeySteps@JC Phase 2 (School Recruitment)
**Role:** Technical Lead & Data Analyst
**Objective:** To allocate ~100 kindergartens into 4 intervention groups (plus controls) for a longitudinal study.
**Core Challenge:** Balancing **statistical rigor** (homogeneity across groups) with **operational feasibility** (equal student numbers for resource allocation), while handling "dirty" real-world data (missing tuition info, extreme outliers in school size).

## 2. Technical Architecture & Workflow

The solution implements a **Two-Stage Hybrid Pipeline**, decoupling statistical clustering from operational balancing.

### Stage I: Statistical Randomization (R Environment)
*   **Library:** `blockTools` (v0.6.4)
*   **Algorithm:** `optGreedy` (Optimal Greedy Algorithm).
*   **Mechanism:**
    1.  **Distance Metric:** Uses **Mahalanobis Distance** instead of Euclidean.
        *   *Why?* To account for correlations between covariates (e.g., Tuition Fee and School Sponsoring Body might be correlated).
    2.  **Blocking Logic:**
        *   Identifies the "best match" pair of schools (smallest distance).
        *   Adds a third school that minimizes the aggregate distance to the existing pair.
        *   Adds a fourth school to complete the block.
    *   *Result:* Creates "Blocks" of 4 schools that are statistically interchangeable.

### Stage II: Operational Optimization (Python & Custom GUI)
*   **Tool:** `intra_block_balancing.py` (Custom Tkinter Application).
*   **The Problem:** R's randomization is "blind" to school size. It might assign the largest school in every block to Group 1, resulting in Group 1 having 500 students and Group 2 having 200. This breaks the logistics for the intervention teams.
*   **The Solution (Intra-Block Swapping):**
    *   **Constraint:** Swaps are *only* allowed between schools within the same R-generated block.
    *   **Objective Function:** Minimize the variance of `Total_Student_Count` across Groups 1-4.
    *   **Safeguard:** Since schools in a block are statistically similar (by Mahalanobis distance), swapping them does **not** degrade the statistical balance of the trial, but it **drastically** improves operational balance.

## 3. Data Engineering & Thoughtful Considerations

### A. Handling Imperfect Data (Covariates)
*   **Tuition Fee (SES Proxy):**
    *   *Issue:* Inconsistent data between Full-Day and Half-Day fees.
    *   *Decision:* Rejected Half-Day fees due to lack of correlation data.
    *   *Logic:* Used **Median Full-Day Tuition ($9,136.5)** as a binary cutoff (Low/High) + a "Free" category. This robust binning reduced the impact of minor fee fluctuations.
*   **Teacher Qualifications (Capacity Index):**
    *   *Issue:* How to compare a school with 1 PhD vs. a school with 10 Bachelors?
    *   *Logic:* Developed a **Reversed Weighted Score**:
        *   $Score = \sum (Weight_i \times \%Staff_i)$
        *   Weights: PhD=1, Master=2, Bachelor=3, Diploma=4.
        *   *Implication:* Lower score = Higher qualification. This single scalar allowed the distance algorithm to process complex staffing data.

### B. Managing Outliers & Special Populations
*   **The "Big 4" Schools:**
    *   *Observation:* 4 schools represented ~18.9% of the total student population.
    *   *Risk:* If clustered, they would skew the results.
    *   *Handling:* Treated as a specific stratum to ensure they were distributed 1-per-group.
*   **Ethnic Minority (EM) Concentration:**
    *   *Observation:* 3 schools had >50% EM students.
    *   *Safeguard:* Included "EM Concentration" as a blocking variable to prevent all EM-heavy schools from landing in the Control group, which would invalidate findings on EM support.

## 4. Safeguards & Validation Strategies

### Sensitivity Analysis (Simulation)
Before the final run, the team performed extensive simulations (documented in `Original assignment with different strategies.xlsx`) to test robustness:
*   **Scenario A (Drop & Combine):** What if we exclude schools with <15 students?
*   **Scenario B (Class Type Merging):** What if we treat "Full-Day" and "Mixed" schools as the same category?
*   **Outcome:** These simulations ensured the final model wasn't over-fitted to a specific subset of schools.

### Operational Safeguards
*   **Quota Checks:** The final Excel output includes a `Quota Check for Student Number` column to flag any group exceeding intervention capacity.
*   **Resource Stress Testing:** The `KPI Summary` sheet calculates "KG:Teacher ratio" under different scenarios (1:2 vs 1:3).
    *   *Why?* To ensure the intervention is viable even if schools provide the minimum required staffing (1:2), protecting the project against resource shortages.

## 5. Key Artifacts & Evidence

| Artifact | Function | Technical Insight |
| :--- | :--- | :--- |
| `intra_block_balancing.py` | Optimization Engine | Implements the variance-minimization swap algorithm with a GUI for human-in-the-loop verification. |
| `Inter-block Balanced Output.xlsx` | Master Record | Contains the "KPI Summary" proving the final balance (Groups have ~25 schools each, student counts balanced). |
| `Design on Randomisation.docx` | Methodology | Documents the "Group 5" logic (non-scheme schools) and the specific median cutoffs used for recoding. |
| `101 School Trials/` | Audit Trail | Contains HTML reports (`_balanced.html`) visualizing the covariate distribution for every trial run. |
