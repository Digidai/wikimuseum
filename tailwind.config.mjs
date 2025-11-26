/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
      },
      colors: {
        notion: {
          text: '#191919',
          secondary: '#6B6B6B',
          tertiary: '#9B9B9B',
          blue: '#0077D4',
          border: '#E5E5E5'
        }
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            maxWidth: 'none',
            color: '#333',
            fontFamily: theme('fontFamily.serif'),
            h1: { fontFamily: theme('fontFamily.sans') },
            h2: { fontFamily: theme('fontFamily.sans') },
            h3: { fontFamily: theme('fontFamily.sans') },
            h4: { fontFamily: theme('fontFamily.sans') },
          },
        },
      }),
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
};
