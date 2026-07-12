const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Lepista DS type roles
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        sans: ['"Hanken Grotesk"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      boxShadow: {
        // Signature neobrutalist hard-offset shadow in the infra (cyan) accent.
        neo: '4px 4px 0 0 var(--color-infra-400)',
        'neo-hover': '6px 6px 0 0 var(--color-infra-400)',
      },
      colors: {
        // Lepista DS — flat canonical scales (use in new/primitive code).
        brand: {
          50: '#f3edf9',
          100: '#e4d4f2',
          200: '#cbade7',
          300: '#ac7dd6',
          400: '#9260c4',
          500: '#7b49a0',
          600: '#663a88',
          700: '#512d6e',
          800: '#3d2154',
          900: '#2a153a',
          950: '#120a19',
          975: '#0d0713',
          // Legacy subkey — repointed to DS violet so existing brand-violet-*
          // usages adopt the new palette with no per-file edits.
          violet: {
            50: '#f3edf9',
            100: '#e4d4f2',
            200: '#cbade7',
            300: '#ac7dd6',
            400: '#9260c4',
            500: '#7b49a0',
            600: '#663a88',
            700: '#512d6e',
            800: '#3d2154',
            900: '#2a153a',
            950: '#120a19',
          },
        },
        // infra — Infrastructure / Mycelium accent (this app's group accent).
        infra: {
          50: '#eef9fd',
          100: '#d5f0fa',
          200: '#abe1f5',
          300: '#80d2f0',
          400: '#64C5EB',
          500: '#3ba8d4',
          600: '#2d88ad',
          700: '#236a87',
          800: '#1a4d62',
          900: '#11313e',
        },
        // saas — LepOps accent (magenta). Not used app-wide; kept for DS completeness.
        saas: {
          50: '#fef1f6',
          100: '#fdd5e6',
          200: '#faaacb',
          300: '#f57cae',
          400: '#E84D8A',
          500: '#c93570',
          600: '#a62a5b',
          700: '#812147',
          800: '#5d1833',
          900: '#3b0f20',
        },
        // science — Bioinformatics accent (amber; shared with AI).
        science: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#FEB326',
          500: '#d99b1e',
          600: '#b37f17',
          700: '#8c6311',
          800: '#66470c',
          900: '#402d07',
        },
        // Functional maturity-badge colors — never confused with group accents.
        status: {
          production: '#22c55e',
          stable: '#3b82f6',
          research: '#f59e0b',
          contributions: '#8b5cf6',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-in-out',
        fadeOut: 'fadeOut 1s ease-in-out',
      },
    },
  },
  plugins: [flowbite.plugin()],
}

