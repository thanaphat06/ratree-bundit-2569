/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: '#E8501C',
        orangeDeep: '#C2410C',
        gold: '#E9A93A',
        cream: '#FBF6EC',
        sky: '#EAF2F7',
        stone: '#8A6E52',
        ink: '#1F1A17',
      },
      fontFamily: {
        display: ['Fredoka', 'Prompt', 'sans-serif'],
        thai: ['Prompt', 'Kanit', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 10px 30px -10px rgba(194,65,12,0.35)',
      },
    },
  },
  plugins: [],
}
