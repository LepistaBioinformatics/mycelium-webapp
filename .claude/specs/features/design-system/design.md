# Design: Lepista Design System — Foundation + Primitives

## Strategy: zero-churn color swap

The 264 `brand-violet-*` usages across 52 files are **not** edited. In `tailwind.config.js`
the `brand.violet.*` subkey is repointed to the DS violet hexes, so every existing usage
adopts the new color for free. Alongside it, the DS-canonical **flat** scales are added at
the top level so new/primitive code can write `border-brand-600`, `shadow-infra-400`, etc.
Tailwind allows `brand` to be both a color scale and to hold a `violet` subkey — both class
forms (`bg-brand-500` and `bg-brand-violet-500`) coexist without collision because they are
distinct key paths.

### `tailwind.config.js` colors block

```js
colors: {
  // DS flat scales (canonical — use in new/primitive code)
  brand: {
    50:'#f3edf9',100:'#e4d4f2',200:'#cbade7',300:'#ac7dd6',400:'#9260c4',
    500:'#7b49a0',600:'#663a88',700:'#512d6e',800:'#3d2154',900:'#2a153a',
    950:'#120a19',975:'#0d0713',
    // legacy subkey — repointed to DS violet so 264 existing usages adopt it for free
    violet:{
      50:'#f3edf9',100:'#e4d4f2',200:'#cbade7',300:'#ac7dd6',400:'#9260c4',
      500:'#7b49a0',600:'#663a88',700:'#512d6e',800:'#3d2154',900:'#2a153a',950:'#120a19',
    },
    // legacy lime/sky retained only if still referenced via CSS vars; class usages are 0
  },
  infra:{50:'#eef9fd',100:'#d5f0fa',200:'#abe1f5',300:'#80d2f0',400:'#64C5EB',500:'#3ba8d4',600:'#2d88ad',700:'#236a87',800:'#1a4d62',900:'#11313e'},
  saas:{50:'#fef1f6',100:'#fdd5e6',200:'#faaacb',300:'#f57cae',400:'#E84D8A',500:'#c93570',600:'#a62a5b',700:'#812147',800:'#5d1833',900:'#3b0f20'},
  science:{50:'#fffbeb',100:'#fef3c7',200:'#fde68a',300:'#fcd34d',400:'#FEB326',500:'#d99b1e',600:'#b37f17',700:'#8c6311',800:'#66470c',900:'#402d07'},
  status:{ production:'#22c55e', stable:'#3b82f6', research:'#f59e0b', contributions:'#8b5cf6' },
}
```

> Verify at build time that repointing `brand.violet.*` doesn't visually break the two
> screens that used the old `brand-violet-400` (`#a78bfa`, a lighter lilac) — the DS 400
> `#9260c4` is darker/more saturated. Acceptable per the "follow the DS" directive.

### Fonts

`fontFamily` in `tailwind.config.js`:

```js
fontFamily: {
  display: ['"Bricolage Grotesque"', 'sans-serif'],
  sans:    ['"Hanken Grotesk"', 'sans-serif'],
  mono:    ['"Space Mono"', 'monospace'],
}
```

`index.html` Google Fonts link (replaces the Quicksand/JetBrains line):

```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Hanken+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
```

> The PWA workbox config caches Google Fonts via CacheFirst — new font URLs are picked up
> automatically, no workbox change needed. `<meta theme-color>` `#8b5cf6` → `#9260c4`.

### `index.css`

- Set `font-family: "Hanken Grotesk", sans-serif;` on `:root`, `--font-mono: 'Space Mono', monospace;`, add `--font-display`/`--font-sans`.
- Replace the ad-hoc `--color-brand-primary`/`-accent`/`-growth`/`-primary-active` values with DS equivalents (primary → `#9260c4`, accent → `infra-200 #abe1f5`, growth → keep a green or map to `status.production`, primary-active → `brand-700 #512d6e`). Keep the variable **names** so the scrollbar rules referencing them keep working.
- **Remove** the `@media (prefers-color-scheme: light/dark)` block and the hardcoded `color: rgba(255,255,255,.87)` / `background-color: #242424` on `:root`. Dark mode is driven by the `.dark` class from `ThemeProvider` + Tailwind `darkMode:'class'`; these hardcoded values fight it. Keep `color-scheme`, `font-synthesis`, smoothing, and the `@layer utilities` scrollbar/`dont-break-out` block.

### Neobrutalism utilities

Add to `tailwind.config.js` `theme.extend`:

```js
boxShadow: {
  'neo':       '4px 4px 0 0 var(--color-infra-400)',
  'neo-hover': '6px 6px 0 0 var(--color-infra-400)',
},
translate: { /* Tailwind already ships -translate-x-0.5 (-2px); use those */ }
```

Define `--color-infra-400: #64C5EB;` in `index.css` `:root` so the shadow util resolves.
The reusable "neo container" recipe (applied via CVA `base` in primitives):

```
rounded-lg border border-brand-600 shadow-neo transition-all
hover:shadow-neo-hover hover:-translate-x-0.5 hover:-translate-y-0.5
```

Non-interactive containers (Card/Section/DetailsBox) may omit the hover lift; interactive
ones (Button, clickable ListItem) include it.

## Primitive repaint plan

| Primitive | Change |
|---|---|
| **Button** | New `base`: `rounded-lg font-mono uppercase tracking-wide border transition-all`. `primary` intent → neobrutalist: `bg-brand-800 text-white border-brand-600 shadow-neo hover:shadow-neo-hover hover:-translate-x-0.5 hover:-translate-y-0.5` (dark neutral surface + cyan offset shadow — NOT solid cyan, per R7). `secondary`/`warning`/`danger` keep semantic fills but adopt `rounded-lg` + border + mono. `link` stays flat (no shadow). |
| **Card / Section / DetailsBox / MiniBox** | Flat surface (`bg-white dark:bg-brand-950`), `rounded-lg border border-brand-600`, `shadow-neo` on Card/Section (signature containers, R8); DetailsBox/MiniBox get border + radius, shadow optional. No hover lift (non-interactive). |
| **Modal** | Flat panel `bg-white dark:bg-brand-950`, `rounded-lg border border-brand-600`, `shadow-neo`. Remove any glass/blur if present. |
| **Banner** | Flat sharp chip; if it carries status meaning, use `status.*` colors; otherwise brand/infra tint at 5–8%. |
| **ListItem** | Flat, `rounded-lg` optional; **no offset shadow** (R8 — dense rows). Border-bottom separators kept. |
| **Typography** | Headings (`title,h1,h2,h3`) → add `font-display`; `span/small` labels stay `font-sans`; the `highlight` variant `!text-brand-violet-500` continues to work (repointed). Optionally add an `eyebrow` decoration: `font-mono uppercase tracking-wider text-xs`. |

### Eyebrow marker (mono label + solid square)

Provide as a small pattern (not necessarily a new component): a `font-mono uppercase` label
preceded by `<span class="inline-block w-2 h-2 bg-infra-400 mr-2" />`. Document in the rule
file; apply opportunistically in primitives that render labels.

## Files touched (foundation + primitives)

1. `tailwind.config.js` — colors, fontFamily, boxShadow.
2. `index.html` — fonts link, theme-color meta.
3. `src/index.css` — font vars, color vars, `--color-infra-400`, remove prefers-color-scheme block.
4. `src/components/ui/Button.tsx`
5. `src/components/ui/Card.tsx`
6. `src/components/ui/Section.tsx`
7. `src/components/ui/Modal.tsx`
8. `src/components/ui/DetailsBox.tsx`
9. `src/components/ui/MiniBox.tsx`
10. `src/components/ui/Banner.tsx`
11. `src/components/ui/ListItem.tsx`
12. `src/components/ui/Typography.tsx`
13. `.claude/rules/design-system.md` (monorepo root) — rewrite conventions.
14. `package.json` — version `0.7.0`.
15. `public/manifest.json` — theme/background colors (if keys present).

## Risks

- **Repointed violet is darker** than old `brand-violet-400` — the two screens using 400 shift tone. Accept (follows DS).
- **Contrast on cyan** — mitigated by R7 (no solid-cyan CTA).
- **Shadow noise** — mitigated by R8 (signature containers only).
- **Font FOUT** — Google Fonts `display=swap` handles it; PWA CacheFirst warms after first load.
