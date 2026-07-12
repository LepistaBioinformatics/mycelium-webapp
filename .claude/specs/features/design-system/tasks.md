# Tasks: Lepista Design System — Foundation + Primitives

Legend: `[P]` = parallelizable. Gate = `yarn build` + `yarn lint` must pass. Final acceptance is visual (light + dark) + user approval before commit.

Status: T1–T10 complete, gate passes (`yarn build` + `yarn lint`, 0 errors). T11 visual QA + commit pending user approval (see `.claude/rules/commit-validation.md`).

## Phase 1 — Token foundation (must complete before primitives)

### T1 — Tailwind colors + fonts + shadows ✅
- **Where:** `tailwind.config.js`
- **Do:** Add DS flat scales (`brand` w/ 950+975, `infra`, `saas`, `science`, `status`); repoint `brand.violet.*` to DS violet hexes; add `fontFamily` (display/sans/mono); add `boxShadow.neo` / `boxShadow.neo-hover`.
- **Done when:** config parses; `bg-brand-500`, `border-brand-600`, `shadow-neo`, `font-display` all resolve in a build.
- **Depends on:** —

### T2 — index.css tokens + dark-mode fix ✅
- **Where:** `src/index.css`
- **Do:** Set `:root` `font-family: "Hanken Grotesk"`, `--font-mono: 'Space Mono'`, add `--font-display`/`--font-sans`, add `--color-infra-400: #64C5EB;` and DS `--color-brand-*` values (keep existing var names for scrollbar rules); remove the `@media (prefers-color-scheme)` block + hardcoded `#242424`/`rgba(255,255,255,.87)` on `:root`. Keep scrollbar + `dont-break-out` utilities.
- **Done when:** app renders with new body font; toggling `.dark` (via ThemeProvider) controls theme with no hardcoded-color fights.
- **Depends on:** —

### T3 — index.html fonts + meta ✅
- **Where:** `index.html`
- **Do:** Replace the Quicksand/JetBrains css2 link with the Bricolage+Hanken+Space Mono link (design.md); set `<meta theme-color>` to `#9260c4`.
- **Done when:** Network tab loads the three DS fonts; no Quicksand request.
- **Depends on:** —

## Phase 2 — Primitives (depend on Phase 1) — all `[P]` w.r.t. each other

### T4 [P] — Button ✅
- **Where:** `src/components/ui/Button.tsx`
- **Do:** New `base` (rounded-lg, font-mono uppercase, border, transition-all); `primary` → neobrutalist dark surface + cyan offset shadow + hover lift (R7, no solid cyan); other intents adopt rounded-lg + border + mono; `link` stays flat.
- **Done when:** primary button shows violet border + cyan hard shadow + lift on hover; text legible; other intents unbroken.
- **Depends on:** T1

### T5 [P] — Card / Section ✅
- **Where:** `src/components/ui/Card.tsx`, `src/components/ui/Section.tsx`
- **Do:** Flat surface, `rounded-lg border border-brand-600 shadow-neo`; no hover lift.
- **Depends on:** T1

### T6 [P] — Modal ✅
- **Where:** `src/components/ui/Modal.tsx`
- **Do:** Flat panel, rounded-lg, violet border, shadow-neo; remove glass/blur if present.
- **Depends on:** T1

### T7 [P] — DetailsBox / MiniBox / Banner / ListItem ✅
- **Where:** those four files
- **Do:** DetailsBox/MiniBox: border + rounded-lg (shadow optional). Banner: flat sharp chip, status colors when semantic. ListItem: flat, **no offset shadow** (R8).
- **Depends on:** T1

### T8 [P] — Typography ✅
- **Where:** `src/components/ui/Typography.tsx`
- **Do:** Headings (`title,h1,h2,h3`) get `font-display`; keep body on `font-sans`; verify `highlight` variant still resolves. Optional `eyebrow` decoration (font-mono uppercase tracking-wider).
- **Depends on:** T1

## Phase 3 — Wrap-up

### T9 — Rewrite design-system rule ✅
- **Where:** `.claude/rules/design-system.md` (monorepo root)
- **Do:** Replace the "sharp corners / remove rounding" mandate with DS conventions (rounded-lg ~8px radius, 1px `brand-600` border, `shadow-neo` accent shadow, font-display/sans/mono roles, mono uppercase labels, status-color badges, ~20% accent + never-two-accents rules).
- **Depends on:** —

### T10 — Version + manifest ✅ (manifest.json has no theme/background keys — nothing to change)
- **Where:** `package.json`, `public/manifest.json`
- **Do:** version `0.6.0` → `0.7.0`; manifest theme/background → DS violet if keys exist.
- **Depends on:** —

### T11 — Gate + visual verification
- **Do:** `yarn build` + `yarn lint` pass; run `yarn dev`, eyeball Home / Dashboard / a modal / a form in light + dark. Report findings; **do not commit** until user tests and approves.
- **Depends on:** T1–T10
