import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0a0906',
          soft: '#111009',
          muted: '#1a1814',
        },
        gold: {
          DEFAULT: '#c9a96e',
          light: '#e2c99a',
          dim: '#8a7049',
        },
        parchment: {
          DEFAULT: '#e8e0d0',
          muted: '#a89880',
          dim: '#6b5e4e',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-lora)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in-out forwards',
        'fade-up': 'fadeUp 0.9s ease-out forwards',
        'drift': 'drift 20s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '33%': { transform: 'translateY(-15px) translateX(10px)' },
          '66%': { transform: 'translateY(8px) translateX(-8px)' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#e8e0d0',
            lineHeight: '2',
          },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

export default config
