/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#13131a',
        border: '#1e1e2e',
        accent: '#3B8BD4',
        'accent-hover': '#2d7bc4',
        muted: '#6b7280',
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['Figtree', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
