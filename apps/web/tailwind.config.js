/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0e11',
        foreground: '#ffffff',
        card: {
          DEFAULT: '#1e2329',
          foreground: '#ffffff',
        },
        popover: {
          DEFAULT: '#1e2329',
          foreground: '#ffffff',
        },
        primary: {
          DEFAULT: '#f0b90b',
          foreground: '#000000',
        },
        secondary: {
          DEFAULT: '#2b3139',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#2b3139',
          foreground: '#848e9c',
        },
        accent: {
          DEFAULT: '#2b3139',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#f84960',
          foreground: '#ffffff',
        },
        border: '#2b3139',
        input: '#2b3139',
        ring: '#f0b90b',
        success: '#02c076',
        warning: '#f0b90b',
        error: '#f84960',
        info: '#1890ff',
        // Additional colors for better coverage
        yellow: {
          400: '#fbbf24',
        },
        green: {
          400: '#4ade80',
        },
        red: {
          500: '#ef4444',
        },
        blue: {
          500: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Add missing utilities
      backdropBlur: {
        'md': '10px',
      },
      backgroundImage: {
        'gradient-to-br': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
      },
      gradientColorStops: {
        'primary': '#f0b90b',
        'yellow-400': '#fbbf24',
      },
    },
  },
  plugins: [],
};
