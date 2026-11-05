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
            teal: '#1FC8C0',
            tealDark: '#17A89F',
            tealLight: '#E8FAF9',
            amber: '#F5A623',
            amberLight: '#FFF8F0',
            coral: '#FF6F61',
            purple: '#7C4DFF',
            green: '#43A047',
          },
          text: {
            heading: '#1A1D2E',
            body: '#6B7280',
            secondary: '#6B7280',
            muted: '#9CA3AF',
          },
          border: {
            light: '#E5E7EB',
            medium: '#D1D5DB',
          },
          status: {
            success: '#10B981',
            successBg: '#D1FAE5',
            warning: '#F59E0B',
            warningBg: '#FEF3C7',
            error: '#EF4444',
            errorBg: '#FEE2E2',
            info: '#1FC8C0',
            infoBg: '#E8FAF9',
          },
        },
        // Top-level Space+ aliases for easy Tailwind usage
        primary: '#1FC8C0',
        'bg-app': '#F4F7FA',
        'bg-card': '#FFFFFF',
        'text-h': '#1A1D2E',
        'text-b': '#6B7280',
        'text-m': '#9CA3AF',
        'border-light': '#E5E7EB',
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
