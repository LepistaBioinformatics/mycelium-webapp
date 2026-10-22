const flowbite = require("flowbite-react/tailwind");

/**
 * Map a palette scale to the CSS variables in src/index.css. The `rgb(... /
 * <alpha-value>)` form keeps opacity modifiers (`bg-surface-950/90`) working.
 */
const scale = (name, steps) =>
  Object.fromEntries(
    steps.map((step) => [
      step,
      `rgb(var(--color-${name}-${step}) / <alpha-value>)`,
    ])
  );

const STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];

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
        neo: '4px 4px 0 0 rgb(var(--color-infra-400))',
        'neo-hover': '6px 6px 0 0 rgb(var(--color-infra-400))',
      },
      // Every color reads a CSS variable defined in src/index.css (`:root`).
      // Change palette values there, not here.
      colors: {
        // Lepista DS brand violet — lab identity (borders, filled buttons, highlights).
        brand: {
          ...scale("brand", [...STEPS, "950", "975"]),
          // Legacy subkey — same variables as `brand`, so existing
          // brand-violet-* usages follow the palette.
          violet: scale("brand", [...STEPS, "950"]),
        },
        // Neutral dark-mode backgrounds. Tiers: base 950, nested/alternate 900, hover 800.
        surface: scale("surface", ["700", "800", "900", "950", "975"]),
        // Infrastructure / Mycelium accent (cyan) — this app's group accent.
        infra: scale("infra", STEPS),
        // LepOps accent (magenta). Not used app-wide; kept for DS completeness.
        saas: scale("saas", STEPS),
        // Bioinformatics accent (amber; shared with AI).
        science: scale("science", STEPS),
        // Functional maturity-badge colors — never confused with group accents.
        status: scale("status", [
          "production",
          "stable",
          "research",
          "contributions",
        ]),
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

