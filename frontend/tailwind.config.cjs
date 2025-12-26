/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,html}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1B3560',
        'page-bg': '#F3F4F6',
        'text-primary': '#0F172A',
        'text-secondary': '#4B5563',
        'light-text': '#E5E7EB',
        'btn-bg': '#1B3560',
        'btn-hover': '#102445',
        'input-border': '#CBD5F5',
        'card-bg': '#ffffff'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: [],
}
