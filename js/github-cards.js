/**
 * GitHub Card Data & Rendering Logic
 * Centralizes the definition and styling of repository cards.
 */

const githubCardData = {
    // --- COMPLEX CARDS (Split-Panel Architecture) ---
    'gen0-excel': {
        type: 'complex',
        title: 'Gen 0: The Excel Monolith',
        subtitle: 'The "Data Starvation" Era',
        tags: ['Excel', 'VBA', 'Manual Process'],
        challenge: {
            icon: 'alert-triangle',
            title: 'The Challenge',
            text: 'Before custom apps, the project relied on a massive, calculation-heavy Excel workbook. It was fragile, required a specific high-power computer ("The Beast"), and faced extinction when the data source (Qualtrics Offline App) was deprecated.'
        },
        solution: {
            icon: 'file-spreadsheet',
            title: 'The Solution: "The Beast"',
            text: 'A monolithic "Source of Truth" workbook that aggregated data via manual CSV imports. It was the only way to track progress, but it was slow and prone to crashes.'
        },
        features: [
            { icon: 'database', color: 'text-green-400', text: '<strong>Manual Aggregation:</strong> Relied on human operators to merge CSVs.' },
            { icon: 'alert-octagon', color: 'text-red-400', text: '<strong>Fragile Macros:</strong> VBA scripts that broke under heavy load.' },
            { icon: 'server-off', color: 'text-slate-400', text: '<strong>Offline Dependency:</strong> Completely dependent on the now-defunct Qualtrics App.' }
        ],
        valuation: {
            total: 'HKD $180,000',
            note: 'AI-Audited • Claude Sonnet 4.5 • Deprecated',
            rationale: 'Manual Excel monolith that kept a 10,000+ assessment project alive before custom apps existed. Labor-intensive, fragile, but irreplaceable at the time—proved the need for automation.',
            items: [
                { name: 'Excel Architecture', price: '$80,000', desc: 'Multi-sheet data model, complex VBA macros, cross-reference formulas.' },
                { name: 'Manual Process Design', price: '$50,000', desc: 'CSV import protocols, data validation rules, error correction workflows.' },
                { name: 'Maintenance & Training', price: '$50,000', desc: 'Staff training, ongoing macro debugging, system documentation.' }
            ]
        },
        award: 'Deprecated Foundation',
        awardTier: 'iron'
    },
    'gen1-pwa': {
        type: 'complex',
        title: 'Gen 1: The PWA Bundle',
        subtitle: 'Offline-First Web App',
        tags: ['JavaScript', 'PWA', 'AES-256', 'IndexedDB'],
        challenge: {
            icon: 'wifi-off',
            title: 'The Challenge',
            text: 'We needed a way to collect data offline on low-end tablets. The solution had to be robust, secure, and capable of complex logic (auto-termination) without a server connection.'
        },
        solution: {
            icon: 'globe',
            title: 'The Solution: "Sneakernet" PWA',
            text: 'A feature-rich Progressive Web App. It included a built-in <strong>Admin Panel</strong> (`data-dashboard.js`) for status monitoring and an <strong>AES-256 Encrypted Export</strong> (`export.js`) for secure peer-to-peer file sharing.'
        },
        features: [
            { icon: 'shield', color: 'text-green-400', text: '<strong>AES-256 Sharing:</strong> Secure "Sneakernet" transfer between devices.' },
            { icon: 'activity', color: 'text-blue-400', text: '<strong>Status Lights:</strong> Real-time dashboard for teachers.' },
            { icon: 'stop-circle', color: 'text-red-400', text: '<strong>Auto-Termination:</strong> Complex logic to stop tests automatically.' }
        ],
        valuation: {
            total: 'HKD $520,000',
            note: 'AI-Audited • Claude Sonnet 4.5 • Banned',
            rationale: 'Feature-complete PWA with AES-256 encryption, offline-first architecture, and real-time dashboards—technically ahead of its time but politically rejected. Its "lost features" (admin panel, auto-termination) would be reinvented in Gen 3.',
            items: [
                { name: 'Offline PWA Core', price: '$200,000', desc: 'Service Workers, IndexedDB storage, offline sync logic, PWA manifest.' },
                { name: 'Security & Encryption', price: '$150,000', desc: 'AES-256-GCM implementation, PBKDF2 key derivation, password-protected exports.' },
                { name: 'Admin Dashboard', price: '$100,000', desc: 'Real-time status lights, test-of-tests validation, sync monitoring UI.' },
                { name: 'Auto-Termination Logic', price: '$70,000', desc: 'Complex business rules engine, adaptive testing algorithms, scoring thresholds.' }
            ]
        },
        award: 'Banned Prototype',
        awardTier: 'iron'
    },
    'gen2-desktop': {
        type: 'complex',
        title: 'Gen 2: Desktop Companion',
        subtitle: 'The "Safety" Pivot',
        tags: ['Python', 'Tkinter', 'Process Hooking'],
        challenge: {
            icon: 'file-text',
            title: 'The Challenge',
            text: 'Forced back to "dumb" PDF forms, we needed a way to extract data and prevent data loss during crashes. The <strong>Qualtrics API</strong> was also "horrible"—slow and synchronous.'
        },
        solution: {
            icon: 'monitor',
            title: 'The Solution: The "Ghost" Monitor',
            text: 'A Python/Tkinter tool (`data_tool`) with a <strong>Live Monitor</strong> (`pdf_tools.py`) that hooked into the PDF viewer process to autosave data in real-time.'
        },
        features: [
            { icon: 'eye', color: 'text-purple-400', text: '<strong>Live Monitor:</strong> Hooked into PDF process to capture data.' },
            { icon: 'save', color: 'text-blue-400', text: '<strong>Crash Recovery:</strong> `autosave.py` restored data after crashes.' },
            { icon: 'alert-triangle', color: 'text-yellow-400', text: '<strong>API Bottleneck:</strong> Crippled by synchronous Qualtrics polling.' }
        ],
        valuation: {
            total: 'HKD $380,000',
            note: 'AI-Audited • Claude Sonnet 4.5 • Legacy',
            rationale: 'Python/Tkinter bridge between "dumb" PDF forms and modern data pipelines. Pioneered the "Live Monitor" and crash recovery but was crippled by synchronous Qualtrics API polling—proving the need for Gen 3\'s async architecture.',
            items: [
                { name: 'Desktop GUI (Tkinter)', price: '$120,000', desc: 'Multi-window interface, file browser, batch processing controls, progress indicators.' },
                { name: 'PDF Parser & Monitor', price: '$150,000', desc: 'Live process hooking, field extraction, Qualtrics mapping, crash detection.' },
                { name: 'Auto-Save & Recovery', price: '$60,000', desc: 'JSON snapshot system, conflict resolution, data merge dialog, rollback logic.' },
                { name: 'API Integration (Fragile)', price: '$50,000', desc: 'Qualtrics polling loop, error handling, rate limiting, retry mechanisms.' }
            ]
        },
        award: 'Transitional Bridge',
        awardTier: 'iron'
    },
    'gen3-server': {
        type: 'complex',
        title: 'Gen 3: Hybrid Server',
        subtitle: 'The "Perfected" Infrastructure',
        tags: ['PowerShell', 'Supabase', 'Python', 'Async'],
        challenge: {
            icon: 'server',
            title: 'The Challenge',
            text: 'The <strong>Qualtrics API</strong> was a bottleneck (1-second polling per record), locking the Gen 2 UI. We needed a way to handle massive uploads asynchronously and validate data instantly.'
        },
        solution: {
            icon: 'cpu',
            title: 'The Solution: 4Set-Server',
            text: 'A hybrid cloud/local infrastructure. A <strong>PowerShell Daemon</strong> watches for files, triggers Python parsers, and uploads to Supabase/Qualtrics in the background, decoupling the UI from the slow API.'
        },
        features: [
            { icon: 'zap', color: 'text-yellow-400', text: '<strong>Async Pipeline:</strong> Background uploads bypass API limits.' },
            { icon: 'check-circle', color: 'text-green-400', text: '<strong>Real-Time Validation:</strong> Instant "Traffic Light" feedback.' },
            { icon: 'database', color: 'text-blue-400', text: '<strong>Supabase Sync:</strong> Live telemetry and logging.' }
        ],
        valuation: {
            total: 'HKD $1.85M+',
            note: 'AI-Audited • Gemini 3',
            rationale: 'The final form. A distributed nervous system that handles 10,000+ assessments with enterprise-grade resilience.',
            items: [
                { name: 'Core Infrastructure', price: '$600,000', desc: 'Supabase Log Mirror, PowerShell Processor Agent.' },
                { name: 'Automated QA', price: '$450,000', desc: '"Traffic Light" Checking System.' },
                { name: 'Data Security', price: '$400,000', desc: 'Quarantine System, Overwrite Protection.' }
            ]
        },
        award: 'Production System',
        awardTier: 'gold'
    },
    'video-tagger': {
        type: 'complex',
        title: 'Video-Tagger',
        subtitle: 'High-Performance Annotation Engine',
        tags: ['C++', 'Python', 'FFmpeg', 'Computer Vision'],
        challenge: {
            icon: 'alert-triangle',
            title: 'The Challenge',
            text: 'Training computer vision models requires massive amounts of labeled video data. Manual frame-by-frame annotation is excruciatingly slow, and existing tools often choke on high-resolution footage or lack automation capabilities.'
        },
        solution: {
            icon: 'cpu',
            title: 'The Solution: Hybrid Architecture',
            text: 'A hybrid engine combining the raw speed of <strong>C++</strong> with the flexibility of <strong>Python</strong>. The core engine (C++17) handles real-time rendering and FFmpeg decoding, while the embedded Python interpreter allows researchers to write custom scripts.'
        },
        features: [
            { icon: 'zap', color: 'text-yellow-400', text: '<strong>Hybrid Core:</strong> C++ for performance, Python for logic.' },
            { icon: 'crosshair', color: 'text-red-400', text: '<strong>Frame-Accurate:</strong> Direct FFmpeg integration for precise seeking.' },
            { icon: 'code', color: 'text-blue-400', text: '<strong>Scriptable:</strong> Automate repetitive tagging tasks via Python API.' }
        ],
        valuation: {
            total: '$15,000',
            note: 'AI-Audited • Claude Sonnet 4.5',
            rationale: 'C++17 rendering core fused with an embedded Python interpreter so labs keep FFmpeg-grade precision while scripting entire labeling passes—solving the “speed vs. flexibility” tradeoff that normally forces teams into custom toolchains.',
            items: [
                { name: 'Core Engine (C++)', price: '$8,000', desc: 'FFmpeg Integration, Memory Management, Real-time Rendering Pipeline.' },
                { name: 'Python API', price: '$4,000', desc: 'Embedded Interpreter, Custom Scripting Interface, Auto-Labeling Hooks.' },
                { name: 'UI/UX & Tools', price: '$3,000', desc: 'Timeline Controls, Keyframe Navigation, Cross-Platform Build System.' }
            ]
        }
    },
    'ks-qrcode': {
        type: 'complex',
        title: 'KeySteps QR Portal',
        subtitle: 'Centralized Intervention Access Hub',
        tags: ['Web Portal', 'User Experience', 'Accessibility', 'Mobile-First'],
        challenge: {
            icon: 'alert-triangle',
            title: 'The Challenge',
            text: 'Distributing hundreds of survey links via paper was chaotic. Teachers and parents often lost QR codes or used outdated versions. The program needed a <strong>foolproof, single entry point</strong> that would work on any phone without technical support.'
        },
        solution: {
            icon: 'cpu',
            title: 'The Solution: "Unbreakable" Portal',
            text: 'I built a streamlined, <strong>Zero-Friction Website</strong> that acts as the central directory. It organizes resources by year and category, works instantly on any device (no app install), and automatically guides users to the correct, up-to-date survey.'
        },
        features: [
            { icon: 'smartphone', color: 'text-blue-400', text: '<strong>Universal Access:</strong> Works perfectly on any device, from old Androids to the latest iPhones.' },
            { icon: 'shield-check', color: 'text-green-400', text: '<strong>Mistake-Proof:</strong> Clear navigation prevents users from accessing outdated or incorrect surveys.' },
            { icon: 'eye', color: 'text-yellow-400', text: '<strong>Inclusive Design:</strong> High contrast and large touch targets ensure usability for all age groups.' }
        ],
        valuation: {
            total: 'HKD $22,500',
            note: 'AI-Audited • Claude Sonnet 4.5',
            rationale: 'Zero-friction QR directory that collapses dozens of rotating survey URLs into one maintained entry point, tuned for any phone and backed by inclusive UI patterns so parents stop juggling outdated printouts.',
            items: [
                { name: 'Portal Development', price: '$10,000', desc: 'Responsive layout, mobile optimization, and fast loading speed.' },
                { name: 'UX/UI Design', price: '$7,500', desc: 'Intuitive navigation structure and brand-aligned visual design.' },
                { name: 'Accessibility Audit', price: '$5,000', desc: 'Ensuring the site is usable by people with visual or motor impairments.' }
            ]
        }
    },
    'ks-retreat': {
        type: 'complex',
        title: 'Teacher Retreat System',
        subtitle: 'Event Logistics & Inventory Manager',
        tags: ['Inventory System', 'Role-Based Schedule', 'Live Registration', 'Data Export', 'Stock Taking'],
        challenge: {
            icon: 'package',
            title: 'The Challenge',
            text: 'Managing a 2-day retreat required tracking <strong>69+ unique inventory items</strong> across 16 boxes and coordinating complex schedules for different roles (Facilitators vs. Logistics). Paper lists and static PDFs were causing "inventory drift" and schedule confusion. <em>Worse</em>: When asked to run the retreat again, the team faced starting from scratch.'
        },
        solution: {
            icon: 'layout',
            title: 'The Solution: Reusable Ops Platform',
            text: 'I built a comprehensive <strong>Operations Platform</strong> that combines a <strong>Role-Based Schedule</strong> (filtering tasks for specific staff like "Herman" or "May") with a full-scale <strong>Inventory System</strong>. It handles "Pack and Go" workflows, stock-taking via CSV, and real-time registration tracking. <strong>Most importantly</strong>: When we ran the retreat a second time, we did <em>almost zero prep work</em>—just CSV import, participant outreach, and go. The system paid for itself.'
        },
        features: [
            { icon: 'clipboard-list', color: 'text-purple-400', text: '<strong>Inventory Engine:</strong> Full CRUD system for 69+ items with "Check-in/Check-out" logic and CSV sync.' },
            { icon: 'calendar-clock', color: 'text-blue-400', text: '<strong>Role-Based Rundown:</strong> Dynamic schedule that filters views for specific staff (e.g., Logistics vs. MC).' },
            { icon: 'radio', color: 'text-red-400', text: '<strong>Live Ops Feed:</strong> Real-time registration dashboard + instant data export for on-site reporting.' }
        ],
        valuation: {
            total: 'HKD $78,000',
            note: 'AI-Audited • Claude Sonnet 4.5',
            rationale: 'A reusable logistics platform where a 69-item inventory engine, RBAC rundown, and export suite live in one client-side stack—so the second retreat boots from CSV imports instead of rewriting lists from scratch.',
            items: [
                { name: 'Inventory Core Engine', price: '$38,000', desc: 'Dual CSV parsers (simple + production-grade), 3-way quantity reconciliation, 4-file state management, client-side ORM architecture.' },
                { name: 'Role-Based Schedule System', price: '$18,000', desc: 'RBAC + dynamic filtering (Herman/May/Bonnie/Logistics/MC), real-time rundown rendering.' },
                { name: 'Advanced Export & Reporting', price: '$12,000', desc: 'Multi-sheet Excel export (3 views: All/Box/Zone), auto-filters, XLSX library integration, UTF-8 BOM handling.' },
                { name: 'Integration & UX', price: '$10,000', desc: 'Client-side "database" without backend, localStorage sync, inline editing, mobile-first design.' }
            ]
        }
    },

    // --- SIMPLE CARDS (Legacy / Platform) ---
    'eocp': {
        type: 'simple',
        title: 'EOCP Platform',
        subtitle: 'EdUHK Online Classes & Resource Hub',
        award: 'University-Wide Adoption',
        tags: ['Full-Stack', 'System Design', 'PHP', 'MySQL', 'Video Streaming'],
        htmlContent: `
            <p class="mb-4">The official <strong>EdUHK Online Classes Platform</strong> (EOCP), serving as a centralized digital backbone for the university's online teaching initiatives. As the <strong>First Developer & Designer</strong>, I built the foundation that hosts a vast repository of educational resources and facilitates the <strong>Community of Practice (CoP)</strong>.</p>
            
            <h4 class="text-cyber-400 font-bold mb-2">Key Features:</h4>
            <ul class="list-disc list-inside text-slate-400 space-y-1 mb-4">
                <li><strong>Resource Repository:</strong> Hosting hundreds of video tutorials and teaching materials across multiple disciplines.</li>
                <li><strong>Community Hub:</strong> Facilitating "Online Teaching Support Series" and CoP events for faculty collaboration.</li>
                <li><strong>Scalable Architecture:</strong> Supporting thousands of academic stakeholders with seamless video streaming and content management.</li>
            </ul>
            
            <div class="mt-6">
                <a href="https://eocp2.eduhk.hk/" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-cyber-600 hover:bg-cyber-500 text-white rounded-lg text-sm font-medium transition-colors">
                    <i data-lucide="external-link" class="w-4 h-4"></i> Visit Platform
                </a>
            </div>
        `
    },
    'imaze': {
        type: 'simple',
        title: 'i-Maze (i世代之記憶迷宮)',
        subtitle: 'Gamified Cognitive Training for SEN Students',
        award: 'Silver Medal (iCAN 2020)',
        tags: ['Swift', 'Gamification', 'EdTech', 'Special Education', 'Research-Backed'],
        htmlContent: `
            <p class="mb-4">An award-winning electronic training application designed to enhance working memory for children with Special Educational Needs (SEN). Developed in collaboration with <strong>Dr. Kean Poon Kei-yan</strong> (EdUHK/UNSW), this app transforms cognitive training into an engaging adventure.</p>
            
            <h4 class="text-cyber-400 font-bold mb-2">Awards & Impact:</h4>
            <ul class="list-disc list-inside text-slate-400 space-y-1 mb-4">
                <li><strong>Silver Medal:</strong> 5th International Invention Innovation Competition in Canada (iCAN 2020).</li>
                <li><strong>Special Award:</strong> Toronto International Society of Innovation & Advanced Skills (2020).</li>
                <li><strong>Real-World Impact:</strong> Deployed to 500+ students in Hong Kong to improve executive function.</li>
            </ul>

            <div class="mt-6 flex flex-wrap gap-3">
                <a href="https://apps.apple.com/hk/app/i%E4%B8%96%E4%BB%A3%E4%B9%8B%E8%A8%98%E6%86%B6%E8%BF%B7%E5%AE%AE/id1227218844?l=en-GB" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-600">
                    <i data-lucide="apple" class="w-4 h-4"></i> App Store
                </a>
                <a href="https://www.eduhk.hk/zht/features/fun-filled-gaming-app-enhances-learning-effectiveness-for-sen-children" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-cyber-600/20 hover:bg-cyber-600/40 text-cyber-300 rounded-lg text-sm font-medium transition-colors border border-cyber-500/30">
                    <i data-lucide="file-text" class="w-4 h-4"></i> Read Research
                </a>
            </div>
        `
    },
    'project-masterlist': {
        type: 'complex',
        title: 'Project Masterlist (AIO System)',
        subtitle: 'Enterprise Relational Application',
        award: 'Blueprint for $3M Tendered Platform',
        tags: ['Power Query', 'Data Modeling', 'Dynamic Arrays', 'ETL', 'No-Code'],
        challenge: {
            icon: 'database',
            title: 'The Challenge',
            text: 'Managing a large-scale educational research project involving multiple stakeholders (Schools, Teachers, Students, Parents) required tracking <strong>10,000+ records</strong> across 40+ disparate sources. The project faced "Data Silos" where consent forms, survey returns, and event attendance were trapped in separate files, making real-time reporting impossible.'
        },
        solution: {
            icon: 'cpu',
            title: 'The Solution: No-Code ERP',
            text: 'I architected a <strong>20MB Relational Application</strong> within Excel that pushes the software to its absolute limit. It acted as the <strong>official backbone and structural blueprint</strong> for a later tendered ICT platform valued at <strong>HKD $3 Million</strong>. Using a sophisticated <strong>Power Query ETL pipeline</strong>, it ingested, cleaned, and normalized raw data into a coherent schema without a single line of code.'
        },
        features: [
            { icon: 'git-merge', color: 'text-purple-400', text: '<strong>Power Query ETL:</strong> 17 automated queries ingest and normalize raw data from CSV and Web sources.' },
            { icon: 'layers', color: 'text-blue-400', text: '<strong>Data Model Architecture:</strong> Uses Power Pivot relationships and DAX measures to handle complex "Many-to-Many" logic.' },
            { icon: 'zap', color: 'text-yellow-400', text: '<strong>Reactive Dashboards:</strong> Heavily utilizes `LET`, `LAMBDA`, and Dynamic Arrays (`FILTER`, `UNIQUE`) for instant updates.' }
        ],
        valuation: {
            total: 'HKD $300,000',
            note: 'AI-Audited • GPT 5.1 Codex',
            rationale: 'Excel stretched into a no-code ERP: Power Query ETL, Power Pivot relationships, and Dynamic Arrays keep 10,000+ stakeholder records synchronized across 40+ sources, and the exact schema later drove a $3M tender—proof the architecture carries enterprise weight.',
            items: [
                { name: 'System Architecture Blueprint', price: '$150,000', desc: 'Defined the entire data schema and logic flow adopted by the $3M tendered platform.' },
                { name: 'ETL Pipeline Architecture', price: '$80,000', desc: 'Automated ingestion of 40+ raw files, error handling, and data normalization.' },
                { name: 'Operational Dashboards', price: '$70,000', desc: 'Real-time "Overview" sheets for Consent, Engagement, and Logistics (Coupons/Events).' }
            ]
        }
    },
    'autosuite': {
        type: 'simple',
        title: 'Auto-Suite',
        subtitle: 'Algorithmic Workflow Automation',
        tags: ['Python', 'VBA', 'Automation', 'Efficiency'],
        htmlContent: `
            <p class="mb-4">A suite of custom scripts and tools designed to eliminate repetitive administrative tasks. Transformed operations from manual drudgery to high-velocity automated workflows.</p>
            <h4 class="text-cyber-400 font-bold mb-2">Impact:</h4>
            <ul class="list-disc list-inside text-slate-400 space-y-1 mb-4">
                <li>Reduced data processing time from 60 minutes to 10 minutes (98% gain).</li>
                <li>Eliminated human error in report generation.</li>
                <li>Standardized output formats across departments.</li>
            </ul>
        `
    },
    'ai-tier-list': {
        type: 'complex',
        title: 'AI Tier List Resources',
        subtitle: 'Research-Grade AI Tool Knowledge Base',
        tags: ['JavaScript', 'Bilingual', 'Data Architecture', 'Interactive UI', 'Vanilla JS'],
        challenge: {
            icon: 'alert-triangle',
            title: 'The Challenge',
            text: 'The AI tool landscape is overwhelming—100+ tools with conflicting claims, scattered documentation, and no standardized comparison framework. Developers and researchers need a <strong>centralized, research-backed resource</strong> to make informed decisions, but existing "tier lists" are superficial clickbait with no depth or methodology.'
        },
        solution: {
            icon: 'cpu',
            title: 'The Solution: A Comprehensive Knowledge Base',
            text: 'I built a <strong>research-grade knowledge platform</strong> that combines deep technical analysis with interactive tier ranking. Each of the 100+ tools is evaluated across <strong>17 standardized features</strong>, with bilingual documentation (EN/CN) and exportable data for collaboration.'
        },
        features: [
            { icon: 'database', color: 'text-purple-400', text: '<strong>Research Depth:</strong> 100+ tools with extensive descriptions (some 1000+ characters), technical analysis, metadata, and feature scores (0-100 across 17 dimensions).' },
            { icon: 'globe', color: 'text-blue-400', text: '<strong>Bilingual Architecture:</strong> Full EN/CN support via translation system—UI, tool names, descriptions, and documentation all localized.' },
            { icon: 'layers', color: 'text-yellow-400', text: '<strong>Interactive Tier System:</strong> Drag-and-drop S/A/B/C/D/G ranking, modal views, state persistence (localStorage + shareable URLs), and multi-format export (Image/CSV/JSON).' }
        ],
        valuation: {
            total: '$27,000',
            note: 'AI-Audited • GPT 5.1 Codex',
            rationale: 'Part research lab, part product: 100+ AI tools codified across 17 scoring dimensions, localized EN/CN copy, and an interactive drag-and-drop UI with export hooks—turning scattered anecdotes into a structured knowledge base teams can actually act on.',
            items: [
                { name: 'Data Architecture & Research', price: '$12,000', desc: '100+ tools researched, 17-feature comparison framework, JSON data modeling, bilingual content curation.' },
                { name: 'Bilingual System', price: '$6,000', desc: 'Translation architecture, EN/CN UI implementation, locale-aware rendering, content management.' },
                { name: 'Interactive UI Engine', price: '$5,000', desc: 'Vanilla JS SPA, drag-and-drop tier management, modal system, state persistence (localStorage + URL sharing).' },
                { name: 'Export Ecosystem', price: '$4,000', desc: 'Image export (canvas rendering), CSV generation, JSON export, shareable link system.' }
            ]
        }
    },
    'shoppingcart925': {
        type: 'complex',
        title: '925 Shopping Cart System',
        subtitle: 'Tri-Lingual Offline Shopping Planner',
        tags: ['Vanilla JS', 'SheetJS', 'Offline-First', 'Localization', 'Excel/Google Sheets'],
        challenge: {
            icon: 'alert-triangle',
            title: 'The Challenge',
            text: 'Tai Po households juggle wet markets, chain stores, and helpers who work in English, Traditional Chinese, or Bahasa Indonesia. Off-the-shelf apps need servers or only support one language—they needed a <strong>zero-infrastructure stack</strong> that loads Excel/Sheets data, stays offline, and prints bilingual lists for real errands.'
        },
        solution: {
            icon: 'cpu',
            title: 'The Solution: Three-File Offline Stack',
            text: 'I engineered a <strong>fully client-side shopping cart</strong> built from just three static files (index.html, styles.css, sample generator). It uses SheetJS, FileReader, LocalStorage, and Fetch APIs to import spreadsheets, validate a strict 10-column schema, power a trilingual UI, and produce print-ready bilingual manifests grouped by store.'
        },
        features: [
            { icon: 'file-spreadsheet', color: 'text-cyan-400', text: '<strong>Multi-Source Data Ingestion:</strong> Excel (.xlsx/.xls), Google Sheets via corsproxy.io, and a built-in sample database generator all flow through the same validation pipeline.' },
            { icon: 'languages', color: 'text-purple-400', text: '<strong>Tri-Lingual UX:</strong> 30+ localized UI strings plus `_en/_cn/_id` columns drive instant language switching, bilingual rendering, and culturally accurate addresses.' },
            { icon: 'shopping-cart', color: 'text-green-400', text: '<strong>Offline Cart Engine:</strong> Dual persistence (localStorage + JSON save/load), grouped cart views, and bilingual print layouts with date stamping.' }
        ],
        valuation: {
            total: '$27,000',
            note: 'AI-Audited • Claude Sonnet 4.5',
            rationale: 'A three-file offline stack that ingests spreadsheets, validates a strict 10-column schema, localizes every string in EN/CN/ID, and still prints grouped manifests—answering the “multi-language without servers” constraint typical SaaS carts can’t touch.',
            items: [
                { name: 'Data Integration & Validation', price: '$9,000', desc: 'SheetJS pipeline, Google Sheets ingestion via corsproxy.io, 10-column schema enforcement, and user-facing error reporting.' },
                { name: 'Localization System', price: '$7,000', desc: 'translations object, localized helpers (`getLocalizedText*`), and bilingual print/export workflows covering English, Traditional Chinese, and Bahasa Indonesia.' },
                { name: 'Offline Cart & Persistence', price: '$6,000', desc: 'Cart management functions (add/update/remove), grouped store rendering, localStorage sync, and JSON save/load utilities.' },
                { name: 'Print & Sample Toolkit', price: '$5,000', desc: 'Two-language print modal, language pairing workflow, Tai Po sample dataset, and sample Excel generator utility.' }
            ]
        }
    },
    'quick-dish-wizard': {
        type: 'complex',
        title: 'Quick Dish AI Wizard',
        subtitle: 'Constraint-Aware AI Recipe Generator',
        tags: ['React 18', 'TypeScript', 'Vite', 'shadcn/ui', 'OpenRouter'],
        challenge: {
            icon: 'alert-triangle',
            title: 'The Challenge',
            text: '“What can I cook with what I have?” is a messy constraint puzzle—limited pantry items, picky dietary rules, mismatched cookware, and rising API costs. Most AI recipe bots ignore inventory, have no filters, and burn through tokens. I needed a <strong>lazy-cooking co-pilot</strong> that respects real-world constraints and runs economically.'
        },
        solution: {
            icon: 'cpu',
            title: 'The Solution: Tri-Panel React Orchestrator',
            text: 'Built a <strong>React + TypeScript SPA</strong> with a three-column layout: filter console, searchable ingredient inventory, and AI recipe output. A shared processing box feeds OpenRouter prompts, backed by a smart 30-minute cache, PDF export, and developer tooling (prompt preview, raw response inspector).' 
        },
        features: [
            { icon: 'sliders', color: 'text-cyan-400', text: '<strong>Constraint Engine:</strong> 5 filter categories (tools, time, cuisine, effort, diet) shape the prompt before every run.' },
            { icon: 'shopping-cart', color: 'text-green-400', text: '<strong>Dual Processing Box:</strong> Drag ingredients from a 60+ item catalog, adjust quantities, and sync between floating cart and sidebar sheet.' },
            { icon: 'brain', color: 'text-purple-400', text: '<strong>Efficient AI Pipeline:</strong> OpenRouter integration with prompt templating, JSON parsing guards, and a 10-entry LIFO cache to cap token spend.' }
        ],
        valuation: {
            total: '$30,000',
            note: 'AI-Audited • ChatGPT o1-preview',
            rationale: 'React + TypeScript orchestrator where constraint sliders, ingredient inventory, and AI output live in the same event loop; OpenRouter prompts are templated, cached, and inspected so the assistant respects cookware, diet, and token budgets simultaneously.',
            items: [
                { name: 'AI Prompt & Cache Layer', price: '$9,000', desc: 'OpenRouter client, model selector, prompt generator, cache TTL enforcement, and JSON extraction safeguards.' },
                { name: 'Constraint & Filter Suite', price: '$8,000', desc: 'FilterPanel UX, validation logic, derived state wiring, and persisted API/model settings.' },
                { name: 'Ingredient UX System', price: '$7,000', desc: 'Inventory search, drag-and-drop flows, dual ProcessingBox/CartButton interface, and quantity bookkeeping.' },
                { name: 'Recipe Output & Export', price: '$6,000', desc: 'Multi-recipe cards with alternates, PDF/export hooks, and developer-facing prompt/debug dialogs.' }
            ]
        }
    },
    'teacher-survey-ece-2025': {
        type: 'complex',
        title: 'Teacher Survey ECE 2025',
        subtitle: 'Six-Stage Measurement Quality Pipeline',
        award: 'Featured in SCMP, HK01 & NowTV',
        tags: ['Python', 'Pandas', 'Tkinter', 'semopy', 'factor_analyzer', 'StatsModels'],
        challenge: {
            icon: 'alert-triangle',
            title: 'The Challenge: Beyond Simple Surveys',
            text: 'Investigating the well-being landscape of the entire Hong Kong kindergarten sector required more than just a survey tool. We needed to ask complex questions about professional development, retention, and well-being across diverse roles (Principals vs. Teachers). Traditional tools like SPSS were insufficient for the sheer scale of iterative testing required to validate these constructs. We needed a <strong>stage-by-stage analysis</strong> to move from basic diagnostics to elevated exploratory territories that standard toolkits could not reach.'
        },
        solution: {
            icon: 'cpu',
            title: 'The Solution: An Elevated Exploratory Journey',
            text: 'I engineered a <strong>Six-Stage Python Pipeline</strong> that transforms raw data into rigorous academic evidence. This isn\'t just data processing; it\'s a structured journey from <strong>Stage 1 (Diagnostics)</strong> to <strong>Stage 6 (Policy Synthesis)</strong>. The findings were so significant they were featured in a <strong>face-to-face press conference</strong> with SCMP, HK01, and HKET, plus live interviews on NowTV. As the lead writer and data handler working alongside <strong>Prof. Eva Lau</strong>, I ensured the tech drove the narrative.'
        },
        features: [
            { icon: 'layers', color: 'text-purple-400', text: '<strong>Stage 1-2 (Validation Engine):</strong> From item auditing to "Stage 2.4 Invariance Tests," ensuring the survey measures the same constructs across all roles (fairness).' },
            { icon: 'git-branch', color: 'text-blue-400', text: '<strong>Stage 4 (Relational Deep Dive):</strong> Uncovering hidden paths via Mediation & Path Analysis, revealing how well-being truly impacts retention.' },
            { icon: 'bar-chart-2', color: 'text-green-400', text: '<strong>Stage 6 (Policy Impact):</strong> Automated HTML reporting and "Evidence-Based Policy Recommendations" that directly inform sector-wide improvements.' }
        ],
        valuation: {
            total: 'HKD $75,000',
            note: 'AI-Audited • Claude Sonnet 4.5',
            rationale: 'Six-stage Python pipeline (EFA → CFA → SEM → policy reporting) that let the kindergarten sector run real psychometric validation in-house; automation plus Tkinter tooling carried the study to SCMP/HK01/NowTV press briefings alongside Prof. Eva Lau.',
            items: [
                { name: 'Psychometric Pipeline', price: '$35,000', desc: 'Iterative EFA/CFA (Stage 2.1), Split-Half Reliability (Stage 2.2), and Scalar Invariance (Stage 2.5) automation.' },
                { name: 'Advanced Modeling', price: '$25,000', desc: '`semopy` integration for Structural Equation Modeling, Mediation Analysis, and Random Forest predictive models.' },
                { name: 'Reproducible Reporting', price: '$15,000', desc: 'Automated generation of APA-style Markdown reports and HTML dashboards for policy stakeholders.' }
            ]
        }
    },
    'sheet-sync-combine': {
        type: 'complex',
        title: 'Sheet Sync Combine',
        subtitle: 'Client-Side Excel ETL Engine',
        tags: ['React', 'TypeScript', 'SheetJS', 'Tailwind CSS', 'Client-Side ETL'],
        challenge: {
            icon: 'alert-triangle',
            title: 'The Challenge: Data Fragmentation',
            text: 'Project partners sent quarterly spreadsheets that looked right at first glance but never matched the template. Headers moved, worksheets appeared with new names, and nobody agreed on how the “student ID” column should be written. The project lead lost weeks fixing files before the data was safe to share.'
        },
        solution: {
            icon: 'cpu',
            title: 'The Solution: "Map the Unmappable"',
            text: 'Sheet Sync Combine is a five-step browser helper built with React and TypeScript. Staff drop in their Excel files, walk through worksheet and column checks, then the `ExcelProcessor` quietly merges everything on the laptop—honoring key columns when they exist, logging every decision, and exporting a clean CSV without ever touching a server.'
        },
        features: [
            { icon: 'list-checks', color: 'text-cyan-400', text: '<strong>Plain-Language Wizard:</strong> Files, sheets, and columns are reviewed in order so each partner fixes issues before pressing "combine."' },
            { icon: 'git-merge', color: 'text-purple-400', text: '<strong>Smart Matching:</strong> If teams pick a key column (e.g., Student ID), ExcelProcessor lines up rows with it; if not, it still pairs rows neatly by position.' },
            { icon: 'shield-alert', color: 'text-red-400', text: '<strong>Receipts for Audits:</strong> Duplicate summaries, unmapped-column notes, and a cell-by-cell merge log explain every value in the final sheet.' }
        ],
        valuation: {
            total: '$18,000',
            note: 'AI-Audited • Claude Sonnet 4.5',
            rationale: 'Five-step React/SJS wizard that forces every partner through plain-language file, sheet, and column checks before any merge—so mismatched templates get fixed on the laptop, no server ever touches PHI, and audit receipts explain every combined cell.',
            items: [
                { name: 'Wizard UI Architecture', price: '$6,000', desc: 'Five-step orchestration with React 18, TypeScript state accumulation, Radix UI components, and Zod-validated forms.' },
                { name: 'ExcelProcessor Engine', price: '$8,000', desc: 'Dual merge modes (key-based + position-based), conflict tracking, column normalization, and SheetJS integration.' },
                { name: 'Audit & Trust Layer', price: '$4,000', desc: 'Cell-level merge logs, duplicate detection, unmapped-column reports, and type-safe data models.' }
            ]
        }
    },
    'sec-osp': {
        type: 'complex',
        title: 'SEC Departmental OSP',
        subtitle: 'The "Department Operating System"',
        award: 'Smart Work Practice Award (2018/19)',
        tags: ['VBA (540KB+)', 'Power Query', 'Payroll Automation', 'UserForms', 'Legacy Monolith'],
        challenge: {
            icon: 'server-crash',
            title: 'The Challenge',
            text: 'Running a university department involves chaotic logistics: hundreds of guest speakers, complex part-time payrolls, and room bookings. The administrative load was crushing, with staff drowning in manual contract generation and conflict checking.'
        },
        solution: {
            icon: 'cpu',
            title: 'The Solution: A VBA Monolith',
            text: 'I built a massive <strong>540KB+ VBA Application</strong> that serves as the department\'s central nervous system. It automates the entire lifecycle of academic operations—from ingesting JotForm data via Power Query to generating PDF contracts and calculating payroll—turning days of paperwork into single-click operations.'
        },
        features: [
            { icon: 'code', color: 'text-yellow-400', text: '<strong>Massive Codebase:</strong> 540KB of VBA code handling complex UserForms, event triggers, and document generation.' },
            { icon: 'dollar-sign', color: 'text-green-400', text: '<strong>Payroll Engine:</strong> Automates hour calculations for part-time staff across semesters, handling complex university pay rules.' },
            { icon: 'award', color: 'text-purple-400', text: '<strong>Award-Winning:</strong> Recognized for "designing systems that improve university operations" (Smart Work Practice Award).' }
        ],
        valuation: {
            total: 'HKD $120,000',
            note: 'AI-Audited • Gemini 3',
            rationale: 'A 540KB VBA nervous system with Power Query feeds, payroll math, and conflict-aware dashboards that lets one department run guest speakers, contracts, and timetables without extra hires—validated by the Smart Work Practice Award.',
            items: [
                { name: 'VBA Core Architecture', price: '$60,000', desc: '500KB+ of modular VBA: Class modules for staff objects, UserForms for data entry, and error handling frameworks.' },
                { name: 'Payroll & Contract System', price: '$40,000', desc: 'Automated logic for calculating hours, generating PDF contracts, and reconciling "i-PartTime" records.' },
                { name: 'Operations Dashboard', price: '$20,000', desc: 'Centralized view of Guest Speakers, Room Bookings, and Course Timetables with conflict detection.' }
            ]
        }
    },
    'publication-records': {
        type: 'complex',
        title: 'Publication Records System',
        subtitle: 'Automated Research Impact Calculator',
        award: 'Smart Work Award (Invited Judge)',
        tags: ['Excel', 'JCR/SJR Integration', 'Scoring Algorithms', 'Academic Ops'],
        challenge: {
            icon: 'book-open',
            title: 'The Challenge',
            text: 'Faculty tenure and funding depend on "Research Output Scores," calculated against constantly changing journal rankings (JCR/SJR). Manually cross-referencing hundreds of papers against these massive datasets was slow, error-prone, and stressful for administrators.'
        },
        solution: {
            icon: 'calculator',
            title: 'The Solution: Intelligent Scoring Engine',
            text: 'I developed an <strong>Automated Scoring System</strong> for the Department of Special Education & Counselling that integrates historical JCR/SJR ranking databases. It instantly maps new publications to their respective impact factors and quartiles (Q1/Q2). The system was so effective that I was invited to serve as a <strong>Judge for the Smart Work Award</strong> (2nd year) instead of competing, as the technology was deemed a benchmark for the Faculty.'
        },
        features: [
            { icon: 'database', color: 'text-purple-400', text: '<strong>Ranking Database:</strong> Built-in lookup tables for JCR and SJR rankings across multiple years (2015-2023).' },
            { icon: 'function-square', color: 'text-cyan-400', text: '<strong>Auto-Scoring Logic:</strong> Complex formula chains determine points based on publication type, journal tier, and author order.' },
            { icon: 'file-bar-chart', color: 'text-green-400', text: '<strong>Staff Reporting:</strong> Generates individual "Research Output Profiles" for performance reviews with a single click.' }
        ],
        valuation: {
            total: 'HKD $45,000',
            note: 'AI-Audited • Gemini 3',
            rationale: 'Automated scoring assistant that keeps historical JCR/SJR tables beside complex Excel formulas, so tenure committees get instant Q-tier lookups and staff reports—good enough that the organizers asked me to judge Smart Work instead of compete.',
            items: [
                { name: 'Scoring Algorithm', price: '$20,000', desc: 'Logic engine that handles edge cases (e.g., co-authorship weighting, journal tier changes over years).' },
                { name: 'Database Integration', price: '$15,000', desc: 'Cleaned and indexed JCR/SJR datasets optimized for fast XLOOKUP/Index-Match retrieval.' },
                { name: 'Reporting Module', price: '$10,000', desc: 'Dynamic dashboard generating per-staff summaries and department-wide impact analysis.' }
            ]
        }
    },
    'masterlist-osp': {
        type: 'complex',
        title: 'ISSHK Masterlist One-Stop Portal',
        subtitle: 'The "CORE" Departmental Operating System',
        award: 'ISSHK Platinum Adoption',
        awardTier: 'platinum',
        tags: ['VBA', 'SQL', 'Mail Merge', 'Excel', 'Legacy Systems'],
        challenge: {
            icon: 'alert-triangle',
            title: 'The Reality Check',
            text: 'My <strong>first-ever project</strong> was supposed to be “just a spreadsheet.” Instead I inherited the nervous system of ISSHK—37 sheets, Word mail merges, AutoHotkey robots, and NRCIS web updates that kept 100,000+ records alive. There was no safety net, no staging server, and the entire welfare lifecycle depended on it staying online.'
        },
        solution: {
            icon: 'cpu',
            title: 'The Solution: Mastery & Stabilization',
            text: 'I reverse-engineered every intake form, SQL injection, and PDF generator, then rewired them into a <strong>linear six-phase lifecycle</strong>: Intake PDF → MIS Core → Contract Renewal → Field Kits → NRCIS Sync → Transfer/Finance. Over <strong>10,000 lines of VBA</strong> were hardened, documented, and shipped back to ISSHK, who adopted the build <strong>in full, unchanged</strong> for live operations.'
        },
        features: [
            { icon: 'workflow', color: 'text-cyan-400', text: '<strong>End-to-End Orchestration:</strong> Encodes the entire case journey (Phases 1-6) so every intake, renewal, CAIF, and transfer flows through one command center.' },
            { icon: 'database', color: 'text-blue-400', text: '<strong>Runtime SQL Engine:</strong> Dynamic ADODB + Mail Merge injections (DistrictMM) pull curated slices without ever storing static connections, keeping 37 sheets perfectly synchronized.' },
            { icon: 'cpu', color: 'text-green-400', text: '<strong>Last-Mile Automation:</strong> AHK launchers (CR GUI → CR Testing) push the same data into NRCIS, Roster, and Food Systems, eliminating re-entry risk.' },
            { icon: 'shield', color: 'text-purple-400', text: '<strong>Platinum Hardening:</strong> Registry patches, error recovery, and transfer checklists meant ISSHK could run the system untouched for years.' }
        ],
        valuation: {
            total: 'HKD $2.2M+',
            note: 'AI-Audited • Claude Sonnet 4.5',
            rationale: 'Tamed the 37-sheet ISSHK nerve center by encoding the entire intake → renewal → NRCIS handoff inside hardened VBA, SQL, and AHK launchers—giving the charity a platinum-grade operating system instead of buying Salesforce or rebuilding every phase manually.',
            items: [
                { name: 'Pre-AI Labor Premium', price: '$900,000', desc: '6-month solo build in 2015-2016 (VBA/SQL/AHK) with zero modern tooling = 18 months equivalent modern dev time. No Stack Overflow autocomplete, GitHub Copilot, or ChatGPT.' },
                { name: 'Avoided Enterprise Procurement', price: '$800,000', desc: 'ISSHK saved $2M+ by not purchasing case management systems (Salesforce, Dynamics 365). Captured 40% of avoided cost as delivered value.' },
                { name: 'Operational Criticality Premium', price: '$500,000', desc: 'Sole backbone for 100,000+ welfare records. Zero downtime tolerance + multi-year unchanged production use + complete lifecycle documentation = mission-critical risk mitigation.' }
            ]
        }
    }
};

// Keyword Lore Dictionary (for clickable tags)
const keywordLore = {
    'VBA (540KB+)': {
        title: 'VBA (540KB+)',
        body: [
            'A dense legacy codebase of Visual Basic for Applications that runs mission-critical workflows without a modern backend.',
            'It combines user forms, class modules, and macros to automate contracts, timetables, and payroll inside Excel.'
        ]
    },
    'Power Query': {
        title: 'Power Query',
        body: [
            'Excel\'s ETL engine for ingesting, cleaning, and reshaping messy CSVs and web sources into structured tables.',
            'Used here to pull JotForm data, normalize it, and keep downstream dashboards consistent.'
        ]
    },
    'Payroll Automation': {
        title: 'Payroll Automation',
        body: [
            'Logic that calculates complex part-time pay rules, consolidates semester schedules, and generates ready-to-sign PDFs.',
            'Removes manual cross-checks and prevents conflict errors during peak admin periods.'
        ]
    },
    'UserForms': {
        title: 'UserForms',
        body: [
            'VBA-driven dialog windows that collect inputs, validate data, and trigger the underlying macros safely.',
            'They provide a guided UI so non-technical staff can run heavy automations without touching the code.'
        ]
    },
    'Legacy Monolith': {
        title: 'Legacy Monolith',
        body: [
            'A single, tightly coupled application that predates modular services but still powers daily operations.',
            'Stable, battle-tested, and optimized for environments where introducing new cloud stacks is not an option.'
        ]
    }
};

/**
 * Renders the HTML for a complex split-panel card.
 * @param {Object} data - The card data object.
 * @returns {string} - The generated HTML string.
 */
function renderComplexCard(data) {
    const featuresHtml = data.features.map(f => `
        <li class="flex items-start gap-3">
            <i data-lucide="${f.icon}" class="w-5 h-5 ${f.color} mt-0.5"></i>
            <span>${f.text}</span>
        </li>
    `).join('');

    const valuationItemsHtml = data.valuation.items.map(item => `
        <div class="group">
            <div class="flex justify-between items-baseline mb-2">
                <span class="text-sm font-bold text-slate-300 uppercase tracking-wide">${item.name}</span>
                <span class="text-lg font-mono font-bold text-green-400">${item.price}</span>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed border-l-2 border-slate-800 pl-3 group-hover:border-green-500/50 transition-colors">
                ${item.desc}
            </p>
        </div>
    `).join('');

    return `
        <div id="modal-wrapper" class="flex flex-col lg:flex-row gap-10">
            <!-- LEFT PANEL: Main Content -->
            <div id="main-panel" class="flex-1 space-y-6 min-w-0">
                
                <!-- The Story Card -->
                <div class="bg-slate-800/50 rounded-lg p-6 border-l-4 border-red-500">
                    <h4 class="text-red-400 font-bold text-base uppercase tracking-wider mb-3 flex items-center gap-2">
                        <i data-lucide="${data.challenge.icon}" class="w-5 h-5"></i> ${data.challenge.title}
                    </h4>
                    <p class="text-slate-300 text-base leading-relaxed">
                        ${data.challenge.text}
                    </p>
                </div>

                <!-- The Engineering Response -->
                <div>
                    <h4 class="text-cyber-400 font-bold text-lg mb-3 flex items-center gap-2">
                        <i data-lucide="${data.solution.icon}" class="w-5 h-5"></i> ${data.solution.title}
                    </h4>
                    <p class="text-slate-400 text-base mb-4">
                        ${data.solution.text}
                    </p>
                    <ul class="space-y-3 text-base text-slate-300">
                        ${featuresHtml}
                    </ul>
                </div>

            </div>

            <!-- RIGHT PANEL: Valuation (Hidden by default) -->
            <div id="valuation-panel" class="hidden opacity-0 translate-x-10 flex-col w-full lg:w-[450px] bg-slate-950 border border-slate-800 rounded-xl p-8 shadow-2xl transition-all duration-500 ease-out relative overflow-hidden">
                <!-- Decorative Background -->
                <div class="absolute top-0 right-0 w-40 h-40 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <!-- Header -->
                <div class="flex items-center justify-between mb-8 border-b border-slate-800 pb-5">
                    <div>
                        <h3 class="text-xl font-bold text-white font-mono">VALUATION_LOG</h3>
                        <div class="flex items-center gap-2 mt-1.5">
                            <span class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span class="text-xs text-slate-500 uppercase tracking-wider">${data.valuation.note}</span>
                        </div>
                    </div>
                    <i data-lucide="calculator" class="w-8 h-8 text-slate-600"></i>
                </div>

                <!-- Scrollable Content -->
                <div class="flex-1 overflow-y-auto space-y-6 pr-2">
                    ${valuationItemsHtml}
                </div>

                <!-- Total Footer -->
                <div class="mt-8 pt-6 border-t-2 border-dashed border-slate-800">
                    <div class="flex justify-between items-center mb-2">
                        <div class="flex items-center gap-2">
                            <span class="text-sm text-slate-500 uppercase tracking-widest">Total Est. Value</span>
                            ${data.valuation.rationale ? `
                            <div class="group/tooltip relative">
                                <i data-lucide="info" class="w-4 h-4 text-cyan-400/60 hover:text-cyan-400 cursor-help transition-colors"></i>
                                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 bg-slate-950 border border-cyan-500/30 rounded-lg p-4 shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none z-50">
                                    <div class="text-xs text-cyan-400 font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                        <i data-lucide="shield-check" class="w-3 h-3"></i>
                                        Valuation Rationale
                                    </div>
                                    <p class="text-xs text-slate-300 leading-relaxed">${data.valuation.rationale}</p>
                                    <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-cyan-500/30"></div>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                        <span class="text-2xl font-bold text-green-400 font-mono">${data.valuation.total}</span>
                    </div>
                    <div class="text-xs text-slate-600 text-right italic">
                        *Based on enterprise dev standards
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Keeps body scroll locked if any modal is open
 */
function syncBodyScrollLock() {
    const projectModal = document.getElementById('project-modal');
    const keywordModal = document.getElementById('keyword-modal');
    const projectOpen = projectModal && !projectModal.classList.contains('hidden');
    const keywordOpen = keywordModal && !keywordModal.classList.contains('hidden');
    document.body.style.overflow = (projectOpen || keywordOpen) ? 'hidden' : '';
}

/**
 * Opens the keyword/lore modal with contextual text
 */
function openKeywordModal(term) {
    const modal = document.getElementById('keyword-modal');
    const titleEl = document.getElementById('keyword-modal-title');
    const bodyEl = document.getElementById('keyword-modal-body');
    if (!modal || !titleEl || !bodyEl) return;

    const entry = keywordLore[term] || { title: term, body: ['Entry coming soon.'] };
    titleEl.textContent = entry.title;
    bodyEl.innerHTML = entry.body.map(p => `<p>${p}</p>`).join('');

    modal.classList.remove('hidden');
    syncBodyScrollLock();
}

function closeKeywordModal() {
    const modal = document.getElementById('keyword-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    syncBodyScrollLock();
}

// Global click handler for keyword chips (works for dynamic content)
document.addEventListener('click', (event) => {
    const chip = event.target.closest('.keyword-chip');
    if (chip) {
        const term = chip.dataset.keyword || chip.textContent.trim();
        openKeywordModal(term);
    }
});

/**
 * Animation Logic for the Valuation Panel (CRT Glitch Effect)
 */
function toggleValuation() {
    const wrapper = document.getElementById('modal-wrapper');
    const valuationPanel = document.getElementById('valuation-panel');
    const btnText = document.getElementById('valuation-btn-text');
    const btnIcon = document.getElementById('valuation-btn-icon');

    if (!wrapper || !valuationPanel || !btnText || !btnIcon) return;

    const isExpanding = valuationPanel.classList.contains('hidden');

    wrapper.classList.add('crt-active');

    setTimeout(() => {
        if (isExpanding) {
            wrapper.classList.remove('lg:max-w-4xl');
            wrapper.classList.add('lg:max-w-6xl');
            valuationPanel.classList.remove('hidden', 'opacity-0', 'translate-x-10');
            valuationPanel.classList.add('flex', 'opacity-100', 'translate-x-0');
            btnText.innerText = 'Hide Valuation';
            btnIcon.classList.add('rotate-180');
        } else {
            wrapper.classList.remove('lg:max-w-6xl');
            wrapper.classList.add('lg:max-w-4xl');
            valuationPanel.classList.add('hidden', 'opacity-0', 'translate-x-10');
            valuationPanel.classList.remove('flex', 'opacity-100', 'translate-x-0');
            btnText.innerText = 'Project Valuation';
            btnIcon.classList.remove('rotate-180');
        }
    }, 150);

    setTimeout(() => {
        wrapper.classList.remove('crt-active');
    }, 400);
}

/**
 * Opens the modal with the specified card data.
 * @param {string} id - The ID of the card to open.
 */
function openModal(id) {
    const data = githubCardData[id];
    if (!data) return;

    const modal = document.getElementById('project-modal');
    const content = document.getElementById('modal-content');
    
    // Generate HTML based on type
    let bodyHtml = '';
    if (data.type === 'complex') {
        bodyHtml = renderComplexCard(data);
    } else {
        bodyHtml = data.htmlContent;
    }

    // Award Banner Logic
    const awardBanner = data.award ? `
        <div class="mb-6 relative overflow-hidden rounded-lg bg-gradient-to-r from-yellow-500/20 to-transparent border border-yellow-500/30 p-4 flex items-center gap-4">
            <div class="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-yellow-500/20 blur-2xl rounded-full"></div>
            <div class="bg-yellow-500/20 p-2 rounded-full border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                <i data-lucide="trophy" class="w-6 h-6 text-yellow-400"></i>
            </div>
            <div>
                <div class="text-yellow-500 text-[10px] font-bold uppercase tracking-widest mb-0.5">Distinction</div>
                <div class="text-yellow-200 font-bold text-lg">${data.award}</div>
            </div>
        </div>
    ` : '';

    const valuationButton = data.type === 'complex' ? `
        <button type="button" onclick="toggleValuation()" class="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyber-500/60 text-green-300 font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-400/60">
            <i data-lucide="panel-right-open" class="w-4 h-4"></i>
            <span id="valuation-btn-text">Project Valuation</span>
            <i id="valuation-btn-icon" data-lucide="chevron-right" class="w-4 h-4 text-green-300 transition-transform"></i>
        </button>
    ` : '';

    content.innerHTML = `
        ${awardBanner}
        <div class="flex items-start justify-between mb-4">
            <div>
                <h2 class="text-2xl font-bold text-white mb-1">${data.title}</h2>
                <p class="text-cyber-400 font-mono text-sm">${data.subtitle}</p>
                ${valuationButton}
            </div>
        </div>
        
        <div class="flex flex-wrap gap-2 mb-6">
            ${data.tags.map(tag => `<button type="button" class="keyword-chip px-2 py-1 rounded bg-slate-800 text-xs text-slate-200 border border-slate-700 hover:border-cyber-500/60 hover:text-cyber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-400/60 transition-colors" data-keyword="${tag}">${tag}</button>`).join('')}
        </div>
        
        <div class="text-slate-300 text-sm leading-relaxed">
            ${bodyHtml}
        </div>
    `;
    
    modal.classList.remove('hidden');
    syncBodyScrollLock(); // Prevent scrolling when any modal is open
    
    // Re-initialize icons
    if (window.lucide) lucide.createIcons();
}

/**
 * Closes the modal.
 */
function closeModal() {
    const modal = document.getElementById('project-modal');
    const wrapper = document.getElementById('modal-wrapper');
    const valuationPanel = document.getElementById('valuation-panel');
    const btnText = document.getElementById('valuation-btn-text');
    const btnIcon = document.getElementById('valuation-btn-icon');
    
    // Reset to collapsed state before closing
    if (wrapper && valuationPanel) {
        wrapper.classList.remove('lg:max-w-6xl');
        wrapper.classList.add('lg:max-w-4xl');
        valuationPanel.classList.add('hidden', 'opacity-0', 'translate-x-10');
        valuationPanel.classList.remove('flex', 'opacity-100', 'translate-x-0');
        
        if (btnText) btnText.innerText = 'Project Valuation';
        if (btnIcon) btnIcon.classList.remove('rotate-180');
    }
    
    modal.classList.add('hidden');
    syncBodyScrollLock(); // Restore scrolling if no other modal is open
}

// Event Listeners
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        const keywordModal = document.getElementById('keyword-modal');
        const keywordOpen = keywordModal && !keywordModal.classList.contains('hidden');
        if (keywordOpen) {
            closeKeywordModal();
        } else {
            closeModal();
        }
    }
});
