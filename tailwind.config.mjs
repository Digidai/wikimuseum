/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        notion: {
          text: '#191919',
          secondary: '#6B6B6B',
          tertiary: '#9B9B9B',
          blue: '#0077D4',
          border: '#E5E5E5'
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
};
