/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        github: {
          dark: '#24292f',
          light: '#ffffff',
          border: '#d0d7de',
          accent: '#0969da',
          hover: '#0550ae',
          success: '#1a7f37',
          error: '#cf222e',
          muted: '#656d76'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo', 'Consolas', 'Liberation Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
