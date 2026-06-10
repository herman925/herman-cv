tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                mono: ['Space Grotesk', 'monospace'],
                display: ['Fraunces', 'Georgia', 'serif'],
            },
            colors: {
                // Custom Emerald Palette (Education)
                emerald: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    900: '#064e3b',
                    950: '#022c22',
                },
                // Custom Sky Palette (Counselling)
                sky: {
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    900: '#0c4a6e',
                },
                // Custom Slate Palette (Dark Mode Base)
                slate: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                },
                // Theme Specific Colors
                void: '#0f172a', // Dark background
                cream: '#fffbeb', // Light background (legacy/alternative)
                
                // Custom Cyber Palette (Technology/Index)
                cyber: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    300: '#5eead4', // Added for hover states
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                    900: '#134e4a',
                    950: '#042f2e',
                },

                // ===== SPINE design system (additive — never rename/remap above) =====
                paper: { DEFAULT: '#FAF7F2', soft: '#F1ECE3' },
                inkbase: { DEFAULT: '#16161A', soft: '#4A4A52' },
                // CH 01 Counselling
                sienna: { DEFAULT: '#C2571B', deep: '#9C4514', 100: '#F7E4D6', 400: '#D9763B', 500: '#C2571B', 600: '#9C4514', 800: '#7A3610', 900: '#5E2A0D' },
                // CH 02 Technology
                tealink: { DEFAULT: '#0F766E', deep: '#0B5953', 100: '#D8ECEA', 400: '#14998F', 500: '#0F766E', 600: '#0B5953', 800: '#08433E', 900: '#063330' },
                // CH 03 Project Management
                oxblood: { DEFAULT: '#9F1F45', deep: '#7E1836', 100: '#F5DDE5', 400: '#C04568', 500: '#9F1F45', 600: '#7E1836', 800: '#621229', 900: '#4A0E1F' },
                // CH 04 Education & Culture
                moss: { DEFAULT: '#2F6B4F', deep: '#24533D', 100: '#DFEBE4', 400: '#4C8A6C', 500: '#2F6B4F', 600: '#24533D', 800: '#1B402F', 900: '#143123' },
                // Cover/index only
                gold: { DEFAULT: '#B8965A', bright: '#D4B274', 100: '#F3EBDC', 400: '#D4B274', 500: '#B8965A', 600: '#96793F', 800: '#6E5527', 900: '#54401D' },
            }
        }
    }
}