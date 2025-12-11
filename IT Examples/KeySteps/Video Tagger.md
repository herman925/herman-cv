# Video Tagger Application

## 1. Project Context & Objectives
**Project:** KeySteps@JC (Child Language Development Study)
**Role:** Full Stack Developer (Frontend Architecture)
**Origin Story:** The project was born out of a critical operational bottleneck: budget constraints precluded purchasing commercial licenses (e.g., NVivo) for the large team of coders. We needed a bespoke, zero-cost solution to supplement this gap, sparking the initiative to build an in-house tool tailored specifically to our workflow.
**Objective:** To build a browser-native, zero-dependency workstation for researchers to tag and annotate long-form video/audio recordings with millisecond precision.
**Core Challenge:** Creating a unified, frame-accurate control interface that abstracts the differences between **local HTML5 media** and **YouTube Streams**, while ensuring data safety during multi-hour transcription sessions.

## 2. Technical Architecture & Workflow

The application is a **Static Single Page Application (SPA)** built with Vanilla ES6+, utilizing a modular namespace architecture (`VideoTagger.core`, `VideoTagger.player`, `VideoTagger.tagging`) without a build step.

### Unified Media Abstraction Layer
*   **The Problem:** Researchers needed to code both offline files (sensitive interviews) and online streams (classroom observations). HTML5 `<video>` and the YouTube IFrame API have completely different event models and timing behaviors.
*   **The Solution:** Developed a **Polymorphic Player Controller** (`js/player/controller.js`) that wraps both APIs.
    *   **Unified API:** A single `seekTo()`, `play()`, `pause()` interface controls whichever backend is active.
    *   **Event Normalization:** Maps YouTube's `onStateChange` and HTML5's `timeupdate` to a single internal event stream, driving the UI progress bar and timeline.

### Timeline Visualization Engine
*   **Canvas-Free Rendering:** Uses CSS Grid and absolute positioning to render the timeline.
*   **Dynamic Scaling:** `drawTimelineRuler()` calculates tick intervals dynamically based on media duration to maintain readability (preventing tick crowding on 2-hour videos).
*   **Context-Aware Interaction:** Implements a custom **Context Menu** for overlapping tags, allowing users to select specific intervals in dense data regions without Z-index fighting.

## 3. Data Engineering & Thoughtful Considerations

### A. "Audio-First" Cognitive Design
*   **Insight:** Transcribers found moving video distracting when focusing on speech patterns.
*   **Implementation:** The app defaults to **Audio Mode**, where the video player is visually hidden (`opacity: 0.001`) but remains in the DOM to maintain audio playback.
*   **Safeguard:** Switching to Video Mode is **Password-Gated** (`ADMIN_PASSWORD = 'ks2.0'`). This prevents accidental mode flips that could bias the coding process by revealing visual cues prematurely.

### B. Robust Data Handling
*   **Sentinel Values:** Exports use `'9999'` for missing labels or remarks.
    *   *Why?* Downstream statistical tools (SPSS, R) often choke on empty strings or nulls. Explicit sentinels ensure robust ingestion.
*   **UTF-8 BOM Injection:** The CSV exporter (`js/tagging/export.js`) prepends `\uFEFF` to the file stream.
    *   *Why?* This forces Microsoft Excel to recognize the file as UTF-8, preventing "Mojibake" (garbled characters) when exporting Chinese tags (Cantonese/Mandarin).

### C. Memory Management
*   **Object URL Hygiene:** When loading local files, the app explicitly calls `URL.revokeObjectURL()` on the previous file.
    *   *Impact:* Prevents browser memory leaks (bloat) during "marathon" coding sessions where users might load dozens of large video files in sequence.

## 4. Safeguards & Validation Strategies

### Operational Resilience
*   **"Dirty State" Tracking:** The app monitors `_timelineTags` mutations. If a user tries to close the tab or reload with unsaved changes, a `beforeunload` handler intercepts the action.
*   **YouTube API Fallback:** If the YouTube IFrame API fails to load (e.g., network block), the app detects the timeout and keeps the UI functional for Local File mode, logging diagnostics to the console instead of crashing.

### Input Validation
*   **Logic Gates:** The "Mark End" button is disabled until "Mark Start" is clicked.
*   **Chronological Integrity:** If a user manually inputs an End Time < Start Time, the system rejects the tag and alerts the user, preventing negative-duration data corruption.

## 5. Key Artifacts & Evidence

| Artifact | Function | Technical Insight |
| :--- | :--- | :--- |
| `js/player/controller.js` | The "Brain" | Orchestrates the polymorphic media control, routing inputs to either Plyr (HTML5) or YouTube. |
| `js/tagging/export.js` | Data Serializer | Handles the CSV generation logic, including BOM injection and sentinel value mapping. |
| `js/player/timeline.js` | Visualization | Renders the interactive timeline strip and manages the collision detection for overlapping tags. |
| `README.md` | Documentation | A comprehensive technical manual detailing the architecture, fallback strategies, and module map. |
