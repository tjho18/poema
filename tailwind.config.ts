import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Legacy ink tokens — remapped to the new palette so existing pages
        // (auth, dashboard, profile) inherit the parchment look automatically.
        ink: {
          bg:     '#FAF6EE',   // parchment
          paper:  '#F4EEE0',   // parchmentLo
          text:   '#1B1A2E',   // poem-ink
          accent: '#1B1A2E',
          muted:  '#A89F8C',   // whisper
        },

        // New design system — parchment/dusk palette
        parchment:     '#FAF6EE',
        parchmentLo:   '#F4EEE0',
        mist:          '#F0E8D5',
        dusk:          '#0C0B1A',
        duskHi:        '#15142A',

        // Text tokens
        'poem-ink':    '#1B1A2E',   // primary text on parchment
        inkSoft:       '#2C2A40',   // poem body on parchment
        whisper:       '#A89F8C',   // attributions, hints
        cream:         '#EADFC5',   // primary text on dusk
        // creamSoft is rgba — handled inline

        // Accent — three places only
        terracotta:    '#B97A55',
        terracottaInk: '#9A6243',
      },
      fontFamily: {
        // Legacy
        display: ['var(--font-garamond)', 'Georgia', 'serif'],
        body:    ['var(--font-garamond)', 'Georgia', 'serif'],
        // New
        serif: ['var(--font-garamond)', 'Georgia', 'serif'],
        sans:  ['var(--font-geist)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Perfect fourth scale (1.333) for poems
        'poem-xs':   ['10px', { lineHeight: '14px' }],
        'poem-sm':   ['12px', { lineHeight: '18px' }],
        'poem-base': ['15px', { lineHeight: '27.75px' }],   // 1.85
        'poem-md':   ['18px', { lineHeight: '26px' }],
        'poem-lg':   ['22px', { lineHeight: '30px' }],
        'poem-xl':   ['28px', { lineHeight: '34px' }],
      },
      maxWidth: {
        poem: '28rem',
      },
      animation: {
        'fade-in':     'fadeIn 0.7s ease forwards',
        'caret-pulse': 'caretPulse 1.2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        caretPulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
      },
      transitionTimingFunction: {
        settle: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [],
}
export default config
