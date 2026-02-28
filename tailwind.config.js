/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                void: '#050505',
                'neon-cyan': '#00f3ff',
                'neon-purple': '#bc13fe',
                surface: 'rgba(20, 20, 20, 0.6)',
                'surface-solid': '#141414',
                worked: '#00f3ff', // neon-cyan
                leave: '#EF4444', // keep red for leave
                overtime: '#bc13fe', // neon-purple
            },
            backgroundImage: {
                'gradient-cyan-purple': 'linear-gradient(135deg, #00f3ff 0%, #bc13fe 100%)',
            },
        },
    },
    plugins: [],
}
