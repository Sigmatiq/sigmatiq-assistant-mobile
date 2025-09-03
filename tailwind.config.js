/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SIGMATIQ official brand colors
        sigmatiq: {
          teal: '#1ABC9C',       // Primary brand color
          'teal-light': '#48C9B0',
          'teal-dark': '#16A085',
          golden: '#F59E0B',     // Accent color
          // Status colors
          success: '#00C4A7',
          warning: '#FFB800',
          error: '#FF5757',
        },
        // SIGMATIQ dark theme colors
        sq: {
          dark: '#0A1414',       // Main background
          surface: '#0F1A1A',    // Card background
          'surface-2': '#1A2F2F', // Elevated elements
          border: '#2A3F3F',     // Borders
          // Text colors
          text: '#F5F5F7',
          'text-secondary': '#8FA5A5',
          'text-muted': '#6A8080',
        },
        // Market status colors
        market: {
          open: '#10B981',
          closed: '#EF4444',
          'pre-market': '#F59E0B',
          'after-hours': '#3B82F6',
        }
      },
      screens: {
        'xs': '375px',
        // Tailwind defaults: sm:640px, md:768px, lg:1024px, xl:1280px, 2xl:1536px
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}