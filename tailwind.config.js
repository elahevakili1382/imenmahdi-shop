/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0C0E12',
        graphite: '#171B21',
        ink: '#1C1916',
        ember: '#C45C26',
        copper: '#C4A484',
        stone: '#F4EFE7',
        bone: '#FBFAF7',
        sand: '#E8E0D4',
        steel: '#6B6560',
        success: '#2F6F5E',
        danger: '#B42318',
      },
      fontFamily: {
        sans: ['Vazirmatn Variable', 'Vazirmatn', 'Tahoma', 'sans-serif'],
        display: ['"Markazi Text"', 'Vazirmatn Variable', 'Tahoma', 'serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(12, 14, 18, 0.07)',
        lift: '0 24px 60px rgba(12, 14, 18, 0.16)',
      },
    },
  },
  plugins: [],
}
