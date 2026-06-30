import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:             'var(--color-bg)',
        surface:        'var(--color-surface)',
        'surface-2':    'var(--color-surface-2)',
        'surface-offset': 'var(--color-surface-offset)',
        border:         'var(--color-border)',
        divider:        'var(--color-divider)',
        text:           'var(--color-text)',
        'text-muted':   'var(--color-text-muted)',
        'text-faint':   'var(--color-text-faint)',
        primary:        'var(--color-primary)',
        'primary-hover':'var(--color-primary-hover)',
        accent:         'var(--color-accent)',
        success:        'var(--color-success)',
        warning:        'var(--color-warning)',
        error:          'var(--color-error)',
        protein:        'var(--color-protein)',
        carbs:          'var(--color-carbs)',
        fat:            'var(--color-fat)',
        fiber:          'var(--color-fiber)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        sm:  'var(--radius-sm)',
        md:  'var(--radius-md)',
        lg:  'var(--radius-lg)',
        xl:  'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

export default config