# Quick 001 — Neutral dark-mode backgrounds

**Date:** 2026-10-22

Dark-mode backgrounds all came from the violet `brand` 950/900/800 scale. The
user asked for a more neutral dark background.

## Change

- `tailwind.config.js`: new `surface` scale (neutral charcoal 700–975).
- Dark surface backgrounds swapped 1:1 across 37 files:
  `dark:bg-brand-950` → `dark:bg-surface-950`, `brand-900` → `surface-900`
  (incl. hover, `/40`, `/90`, `from-`), surface hovers/dividers `brand-800` →
  `surface-800`.
- Kept violet: borders (`brand-600`), the filled primary button
  (`button-styles.ts`), selected/highlight states and chips
  (`brand-violet-9xx`).
- Monorepo rule `.claude/rules/design-system.md` updated: dark surfaces use
  `surface-*`, never `brand-950/900/800`.

## Verify

`yarn build` ok, `yarn lint` 0 errors, `yarn test` 32 passed.

## Follow-up — palette as global CSS variables

User asked for colors defined once, globally. Every palette scale (`brand`,
`surface`, `infra`, `saas`, `science`, `status`) is now a CSS variable in
`src/index.css` `:root` (`--color-<scale>-<step>`, RGB channels + hex
comment). `tailwind.config.js` maps each scale to
`rgb(var(--color-…) / <alpha-value>)`, so opacity modifiers still work, and
`shadow-neo` reads `--color-infra-400`. The old named aliases
(`--color-brand-primary`, …) now point at the palette variables. Built CSS
checked: classes resolve to the variables; same hex values as before.
