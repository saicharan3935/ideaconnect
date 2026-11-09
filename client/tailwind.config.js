/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B1220',
          darker: '#060B14',
          card: '#111C2E',
          cardHover: '#16253D',
          border: '#1E2F4D',
          borderLight: '#2D4468',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          yellow: '#FBBF24',
          green: '#10B981',
          cyan: '#38BDF8',
          violet: '#A855F7',
          gray: '#94A3B8',
          light: '#F8FAFC'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #38BDF8 0%, #8B5CF6 50%, #A855F7 100%)',
        'spark-gradient': 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
        'hero-gradient': 'radial-gradient(ellipse at top, rgba(56, 189, 248, 0.15), rgba(139, 92, 246, 0.1) 40%, rgba(11, 18, 32, 0) 80%)',
        'card-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%)'
      }
    },
  },
  plugins: [],
}
