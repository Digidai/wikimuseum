/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: '#FAFAFA',
          card: '#FFFFFF',
          text: '#37352F',
          muted: '#787774',
          blue: '#2383E2',
          border: '#E8E8E8',
          hover: '#F1F1EF'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        notion: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)'
      }
    }
  },
  plugins: []
};
