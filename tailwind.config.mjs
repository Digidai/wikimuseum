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
          text: '#37352F',
          bg: '#FFFFFF',
          hover: '#F5F5F5',
          secondary: '#787774',
          border: '#E9E9E9'
        }
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            maxWidth: 'none',
            color: theme('colors.notion.text'),
            fontFamily: theme('fontFamily.sans'),
            h1: { fontFamily: theme('fontFamily.sans'), color: theme('colors.notion.text') },
            h2: { fontFamily: theme('fontFamily.sans'), color: theme('colors.notion.text') },
            h3: { fontFamily: theme('fontFamily.sans'), color: theme('colors.notion.text') },
            h4: { fontFamily: theme('fontFamily.sans'), color: theme('colors.notion.text') },
            blockquote: { borderLeftColor: theme('colors.notion.text') },
          },
        },
      }),
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
};
