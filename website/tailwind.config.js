/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Mirror :root tokens in styles/index.css — values unchanged
        ps: {
          black: 'var(--black)',
          dark: 'var(--dark)',
          gray: 'var(--gray)',
          muted: 'var(--muted)',
          light: 'var(--light)',
          white: 'var(--white)',
          border: 'var(--border)',
          accent: 'var(--accent)',
          'accent-hover': 'var(--accent-hover)',
        },
      },
      fontFamily: {
        arabic: ['Noto Sans Arabic', 'system-ui', 'sans-serif'],
        latin: ['Inter', 'Noto Sans Arabic', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        container: '1400px',
      },
      transitionTimingFunction: {
        'ps-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      zIndex: {
        header: '100',
        menu: '99',
        'cursor-trail': '9996',
        cursor: '9997',
        preloader: '9999',
      },
    },
  },
  plugins: [],
};
