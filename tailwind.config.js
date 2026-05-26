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
        abyss: {
          50: '#e8f4f8',
          100: '#c5e3ee',
          200: '#8ec8de',
          300: '#4da8c8',
          400: '#1a8aad',
          500: '#006d8f',
          600: '#005570',
          700: '#003d52',
          800: '#002533',
          900: '#000d14',
          950: '#000508',
        },
        emerald: {
          glow: '#00ff87',
          deep: '#00c461',
          mid: '#008a44',
          dark: '#004a24',
        },
        cyan: {
          glow: '#00e5ff',
          mid: '#00b8d9',
          dark: '#007a91',
        },
      },
      fontFamily: {
        display: ['var(--font-cinzel)', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-fira)', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'slide-in': 'slide-in 0.3s ease-out forwards',
        'typing': 'typing 1.5s steps(3) infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 229, 255, 0.3), 0 0 20px rgba(0, 229, 255, 0.1)' },
          '50%': { boxShadow: '0 0 15px rgba(0, 229, 255, 0.6), 0 0 40px rgba(0, 229, 255, 0.2)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'typing': {
          '0%': { content: "''" },
          '33%': { content: "'.'" },
          '66%': { content: "'..'" },
          '100%': { content: "'...'" },
        },
      },
      backgroundImage: {
        'abyss-gradient': 'linear-gradient(135deg, #000508 0%, #000d14 40%, #001a24 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(0,13,20,0.9) 0%, rgba(0,37,51,0.8) 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #004a24 0%, #008a44 100%)',
        'cyan-gradient': 'linear-gradient(135deg, #007a91 0%, #00e5ff 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.15), transparent)',
      },
    },
  },
  plugins: [],
}
