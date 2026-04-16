/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:        '#05050f',
        surface:   '#0d0d1f',
        surface2:  '#13132a',
        border:    '#1a1a3a',
        accent:    '#2563ff',
        'accent-hover': '#1d4ed8',
        cyan:      '#00d4ff',
        success:   '#00e87a',
        muted:     '#4b5680',
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body:    ['Figtree', 'sans-serif'],
      },
      animation: {
        'orb-1':    'orbFloat1 14s ease-in-out infinite',
        'orb-2':    'orbFloat2 18s ease-in-out infinite',
        'orb-3':    'orbFloat1 22s ease-in-out infinite reverse',
        'slide-up': 'slideUp 0.45s cubic-bezier(0.16,1,0.3,1) both',
        'logo-pulse':'logoPulse 2.4s ease-in-out infinite',
        'glow-border':'glowBorder 3s ease-in-out infinite',
        'count-in':  'countIn 0.5s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        orbFloat1: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%':     { transform: 'translate(45px,-55px) scale(1.07)' },
          '66%':     { transform: 'translate(-28px,30px) scale(0.95)' },
        },
        orbFloat2: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%':     { transform: 'translate(-55px,40px) scale(1.09)' },
          '66%':     { transform: 'translate(35px,-22px) scale(0.94)' },
        },
        slideUp: {
          from: { transform: 'translateY(18px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        logoPulse: {
          '0%,100%': { boxShadow: '0 0 8px rgba(37,99,255,0.5)' },
          '50%':     { boxShadow: '0 0 20px rgba(0,212,255,0.7)' },
        },
        glowBorder: {
          '0%,100%': {
            borderColor: 'rgba(37,99,255,0.45)',
            boxShadow: '0 0 24px rgba(37,99,255,0.12), inset 0 0 24px rgba(37,99,255,0.03)',
          },
          '50%': {
            borderColor: 'rgba(0,212,255,0.65)',
            boxShadow: '0 0 48px rgba(0,212,255,0.22), inset 0 0 32px rgba(0,212,255,0.05)',
          },
        },
        countIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(37,99,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,255,0.04) 1px, transparent 1px)',
        'gradient-accent':
          'linear-gradient(135deg, #2563ff 0%, #00d4ff 100%)',
        'gradient-hero':
          'linear-gradient(135deg, #2563ff 0%, #00d4ff 55%, #e0e7ff 100%)',
      },
      backgroundSize: {
        'grid': '48px 48px',
      },
    },
  },
  plugins: [],
}
