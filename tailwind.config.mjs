import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#CF0515',
          'primary-hover': '#B00410',
          'red-deep': '#7A0309',
          dark: '#1F1F1F',
          charcoal: '#1A1A1A',
          accent: '#0E2C4D',
          light: '#FFF5F5',
          cream: '#FAF7F2',
          'warm-gray': '#6B6664',
          gold: '#C8973A',
          'gold-soft': '#E5C480',
        },
        accent: {
          success: '#1F7A4D',
          warning: '#E0A100',
          danger: '#A4191F',
        },
        ink: {
          primary: '#171717',
          muted: '#4A5560',
          subtle: '#5A6470',
        },
        line: {
          DEFAULT: '#E8E1DD',
          dark: '#C9C0BB',
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Fraunces Variable"', 'Fraunces', 'Georgia', '"Times New Roman"', 'serif'],
      },
      fontSize: {
        // Body sizes — moderate fluid scaling
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.2vw, 0.8125rem)',
        'fluid-sm': 'clamp(0.875rem, 0.82rem + 0.25vw, 0.9375rem)',
        'fluid-base': 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1.05rem + 0.4vw, 1.3125rem)',
        // Display sizes — Fraunces, big and confident
        'fluid-xl': 'clamp(1.375rem, 1.25rem + 0.6vw, 1.75rem)',
        'fluid-2xl': 'clamp(1.75rem, 1.45rem + 1.1vw, 2.5rem)',
        'fluid-3xl': 'clamp(2rem, 1.55rem + 1.8vw, 3.25rem)',
        'fluid-4xl': 'clamp(2.5rem, 1.7rem + 3vw, 4.5rem)',
        'fluid-5xl': 'clamp(3rem, 2rem + 4vw, 5.5rem)',
      },
      letterSpacing: {
        kicker: '0.18em',
      },
      maxWidth: {
        prose: '68ch',
        container: '1240px',
        'container-wide': '1440px',
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        soft: '0 2px 6px -1px rgb(15 24 40 / 0.06), 0 1px 2px -1px rgb(15 24 40 / 0.04)',
        card: '0 8px 24px -6px rgb(15 24 40 / 0.10), 0 2px 6px -2px rgb(15 24 40 / 0.06)',
        lift: '0 14px 32px -8px rgb(15 24 40 / 0.18), 0 4px 10px -4px rgb(15 24 40 / 0.08)',
        'red-cta': '0 6px 16px -4px rgb(207 5 21 / 0.45), 0 2px 4px -2px rgb(207 5 21 / 0.30)',
        'red-cta-hover': '0 12px 28px -6px rgb(207 5 21 / 0.55), 0 4px 8px -4px rgb(207 5 21 / 0.35)',
      },
      animation: {
        'underline-draw': 'underline-draw 800ms cubic-bezier(0.22, 1, 0.36, 1) 200ms both',
        'fade-up': 'fade-up 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'divider-grow': 'divider-grow 800ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      keyframes: {
        'underline-draw': {
          '0%': { transform: 'scaleX(0)', transformOrigin: '0 50%' },
          '100%': { transform: 'scaleX(1)', transformOrigin: '0 50%' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'divider-grow': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
    },
  },
  plugins: [typography],
};
