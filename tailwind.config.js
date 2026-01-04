module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#ffffff',     // replace with your actual color
        foreground: '#1f2937',     // replace with your actual color
        ring: '#3b82f6',           // optional: used in your .btn class
      },
    },
  },
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'], // ensure all files using Tailwind classes are included
  plugins: [],
};