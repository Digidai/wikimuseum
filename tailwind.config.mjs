/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
      },
      colors: {
        openai: {
          black: '#000000',
          white: '#FFFFFF',
          gray: {
            50: '#F7F7F8',
            100: '#ECECF1',
            200: '#D9D9E3',
            300: '#C5C5D2',
            400: '#8E8EA0',
            500: '#6E6E80',
            600: '#565869',
            700: '#40414F',
            800: '#343541',
            900: '#202123',
          },
          green: '#10A37F',
          'green-light': '#1A7F64',
        }
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            maxWidth: 'none',
            color: theme('colors.openai.gray.800'),
            fontFamily: theme('fontFamily.sans'),
            fontSize: '1.0625rem',
            lineHeight: '1.75',
            h1: {
              fontFamily: theme('fontFamily.sans'),
              color: theme('colors.openai.black'),
              fontWeight: '600',
              letterSpacing: '-0.02em',
            },
            h2: {
              fontFamily: theme('fontFamily.sans'),
              color: theme('colors.openai.black'),
              fontWeight: '600',
              letterSpacing: '-0.02em',
            },
            h3: {
              fontFamily: theme('fontFamily.sans'),
              color: theme('colors.openai.black'),
              fontWeight: '600',
            },
            h4: {
              fontFamily: theme('fontFamily.sans'),
              color: theme('colors.openai.black'),
              fontWeight: '600',
            },
            a: {
              color: theme('colors.openai.green'),
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            blockquote: {
              borderLeftColor: theme('colors.openai.gray.300'),
              color: theme('colors.openai.gray.600'),
            },
            strong: {
              color: theme('colors.openai.black'),
            },
            code: {
              color: theme('colors.openai.gray.800'),
              backgroundColor: theme('colors.openai.gray.100'),
            },
          },
        },
      }),
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
};
