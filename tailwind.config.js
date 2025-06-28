module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#0f172a',
        border: '#e2e8f0',
        muted: '#f8fafc',
        'muted-foreground': '#64748b',
        primary: '#0f172a',
        'primary-foreground': '#f8fafc',
        secondary: '#f1f5f9',
        'secondary-foreground': '#0f172a',
        accent: '#f1f5f9',
        'accent-foreground': '#0f172a',
        destructive: '#ef4444',
        'destructive-foreground': '#fef2f2',
        ring: '#94a3b8',
        input: '#e2e8f0',
        card: '#ffffff',
        'card-foreground': '#0f172a',
        popover: '#ffffff',
        'popover-foreground': '#0f172a'
      }
    },
  },
  plugins: [],
}