tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                mono: ['Space Grotesk', 'monospace'],
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
            }
        }
    }
}