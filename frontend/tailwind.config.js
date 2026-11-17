/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        noctis: {
          bg: '#0B0F1A',
          card: '#131B2E',
          surface: '#334155',
          surfaceDark: '#1E293B',
          purple: '#7C3AED',
          purpleDark: '#5B21B6',
          purpleLight: '#A78BFA',
          cyan: '#22D3EE',
          cyanDark: '#0891B2',
          text: '#F5F7FF',
          muted: '#94A3B8',
          border: '#1E293B',
          borderHighlight: '#3B82F6',
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(34, 211, 238, 0.35)',
        'glow-purple': '0 0 25px -4px rgba(124, 58, 237, 0.4)',
      }
    },
  },
  plugins: [],
}
