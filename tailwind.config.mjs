/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: '#FFFFFF',
          subtle: '#F7F7F5',
          text: '#191919',
          secondary: '#6B6B6B',
          tertiary: '#9B9B9B',
          blue: '#0077D4',
          border: '#E5E5E5',
          hover: '#F0F0F0'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Noto Sans SC', 'sans-serif']
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.12)'
      },
      borderRadius: {
        'notion': '12px'
      }
    }
  },
  plugins: []
};
