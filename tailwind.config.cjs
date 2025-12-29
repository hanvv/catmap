/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{html,js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                rounded: ['"M PLUS Rounded 1c"', 'sans-serif'], // Example, might need font loading in Taro
            },
            boxShadow: {
                'soft-orange': '0 4px 20px -2px rgba(255, 159, 67, 0.3)',
                'float': '0 10px 30px -5px rgba(93, 64, 55, 0.15)',
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
            }
        },
    },
    plugins: [],
    corePlugins: {
        preflight: false, // Taro handles base styles usually
    }
}
