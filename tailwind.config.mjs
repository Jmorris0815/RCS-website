/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#D72027',
          'primary-hover': '#B81A1F',
          dark: '#1F1F1F',
          accent: '#0E2C4D',
          light: '#FFF5F5',
          cream: '#FAF7F2',
        },
        accent: {
          success: '#1F7A4D',
          warning: '#E0A100',
          danger: '#A4191F',
        },
        ink: {
          primary: '#171717',
          muted: '#4A5560',
          subtle: '#7A8492',
        },
        line: {
          DEFAULT: '#E8E1DD',
          dark: '#C9C0BB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.3vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.9rem + 0.4vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.5vw, 1.375rem)',
        'fluid-xl': 'clamp(1.375rem, 1.2rem + 0.7vw, 1.75rem)',
        'fluid-2xl': 'clamp(1.75rem, 1.4rem + 1.2vw, 2.5rem)',
        'fluid-3xl': 'clamp(2.25rem, 1.7rem + 2vw, 3.5rem)',
        'fluid-4xl': 'clamp(2.75rem, 2rem + 3vw, 4.5rem)',
      },
      maxWidth: {
        prose: '68ch',
        container: '1240px',
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        soft: '0 4px 16px -2px rgb(15 42 74 / 0.08)',
        card: '0 8px 24px -4px rgb(15 42 74 / 0.12)',
      },
    },
  },
  plugins: [],
};
