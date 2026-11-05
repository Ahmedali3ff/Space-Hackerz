/** @type {import('tailwindcss').Config} */
// ASTRA design tokens — NASA-inspired mission control.
// Source of truth: docs/astra-redesign-report.md §7.1-7.3 / 7.5
// Do not change hex values without reconciling with the redesign report.

const fontFallback = ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif']

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ── Deep-space backgrounds (layered, blue-tinted, not flat gray) ──
      colors: {
        space: {
          void: '#060912',
          deep: '#0B1224',
          panel: '#121C33',
          panelRaised: '#1B2A4A',
        },
        border: {
          subtle: '#243456',
          strong: '#3A5180',
        },
        // Brand + data accents (ignition orange ↔ orbit cyan signature pair)
        accent: {
          ignition: '#FF6B35',
          orbit: '#29E6F3',
          starlight: '#EAF1FA',
        },
        // Status semantics — color is NEVER the sole signal (always icon + label)
        status: {
          good: '#46E6A0',
          warn: '#FFC93C',
          crit: '#FF5A5F',
          info: '#29E6F3',
        },
        text: {
          primary: '#EAF1FA',
          secondary: '#A9B8D4',
          muted: '#7E8DAB',
        },
        // ── Space+ light theme tokens (ages 8-12 friendly, complementary to dark theme) ──
        spaceplus: {
          white: '#FFFFFF',
          offwhite: '#F8FAFF',
          surface: '#EEF2FB',
          card: '#FFFFFF',
          accent: {
            teal: '#00BCD4',
            tealDark: '#0097A7',
            tealLight: '#B2EBF2',
            amber: '#FFB300',
            amberLight: '#FFF8E1',
            coral: '#FF6F61',
            purple: '#7C4DFF',
            green: '#43A047',
          },
          text: {
            heading: '#0D1B4B',
            body: '#1E2D5A',
            secondary: '#5C6B9A',
            muted: '#9BA8C9',
          },
          border: {
            light: '#DCE4F7',
            medium: '#B8C4E2',
          },
          status: {
            success: '#2E7D32',
            successBg: '#E8F5E9',
            warning: '#E65100',
            warningBg: '#FFF3E0',
            error: '#C62828',
            errorBg: '#FFEBEE',
            info: '#0277BD',
            infoBg: '#E1F5FE',
          },
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', ...fontFallback],
        display2: ['"Nunito"', ...fontFallback],
        body: ['"Lexend"', ...fontFallback],
        mono: ['"Space Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace', ...fontFallback],
      },
      // Rounded but premium: cards 12px, hero panels 16px
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        // Soft console-panel lift — reads as "lit panel," not Material card
        panel: '0 2px 10px rgba(6, 9, 18, 0.5), 0 0 0 1px rgba(36, 52, 86, 0.4)',
        glow: {
          ignition: '0 0 18px rgba(255, 107, 53, 0.45)',
          orbit: '0 0 18px rgba(41, 230, 243, 0.40)',
        },
        // Space+ card shadows
        card: '0 4px 24px rgba(13,27,75,0.10)',
        cardHover: '0 8px 32px rgba(13,27,75,0.16)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-warn': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'slide-in-right': 'slide-in-right 0.45s ease-out both',
        'pulse-warn': 'pulse-warn 1.4s ease-in-out infinite',
        'count-up': 'count-up 0.35s ease-out both',
      },
    },
  },
  plugins: [],
}
