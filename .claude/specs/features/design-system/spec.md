# Feature: Lepista Design System — Foundation + Primitives

**Status:** Implemented — pending visual UAT + user approval before commit
**Size:** Large
**Version target:** `0.6.0` → `0.7.0` (visible restyle — bump in the same commit)

## Context

The Lepista Bioinformatics Lab published a shared brand design system (v1.0.0, DTCG
2025.10) that all group products must follow:

- Human doc: https://lepista.com.br/design-system.md
- CSS tokens: https://lepista.com.br/design-system/tokens.css
- DTCG JSON: https://lepista.com.br/design-system/tokens.json
- Manifest: https://lepista.com.br/design-system/index.json

The webapp is the **`infra` group** (Infrastructure / Mycelium), so its group accent
is **cyan `#64C5EB`** (`infra-400`). The lab-wide brand color is **violet `#9260c4`**
(`brand-400`).

This feature wires the DS tokens into the webapp and repaints the shared `ui/`
primitives so the "delicate neobrutalism" language propagates app-wide through CVA.
Per-screen polish over the 52 files that reference brand colors is an explicit
follow-up, out of scope here.

## Design tokens (source of truth)

### Color families (flat scales)

- `brand` — violet, lab identity: `50 #f3edf9 · 100 #e4d4f2 · 200 #cbade7 · 300 #ac7dd6 · 400 #9260c4 · 500 #7b49a0 · 600 #663a88 · 700 #512d6e · 800 #3d2154 · 900 #2a153a · 950 #120a19 · 975 #0d0713`
- `infra` — cyan, this app's accent: `50 #eef9fd · 100 #d5f0fa · 200 #abe1f5 · 300 #80d2f0 · 400 #64C5EB · 500 #3ba8d4 · 600 #2d88ad · 700 #236a87 · 800 #1a4d62 · 900 #11313e`
- `saas` — magenta: `400 #E84D8A` (+ full scale)
- `science` — amber: `400 #FEB326` (+ full scale)
- `ai` — references science (amber)

### Status / badge colors (semantic, never confused with group accents)

- production `#22c55e` · stable `#3b82f6` · research `#f59e0b` · contributions `#8b5cf6`

### Typography

- Display (headings, hero): **Bricolage Grotesque** → `--font-display`
- Body (paragraphs, default UI): **Hanken Grotesk** → `--font-sans`
- Mono (eyebrows, labels, buttons, badges): **Space Mono** → `--font-mono`

### Component language — delicate neobrutalism

- Flat solid surfaces (no glass/translucency).
- Single consistent 1px violet border (`brand-600`).
- Radius small + consistent — ~8px (`rounded-lg`).
- Signature shadow: hard offset, **no blur**, carrying the group accent —
  `box-shadow: 4px 4px 0 0 var(--color-infra-400)`, grows to `6px` on hover.
- Hover "lift": `translate(-2px, -2px)` while the shadow grows.
- Eyebrows/labels/buttons: mono, uppercase, preceded by a small solid group-color square.
- Status badges: flat sharp chips keeping their semantic color.

### Usage rules

- Accent occupies at most ~20% of a section (border, icon, one CTA).
- Section backgrounds stay neutral.
- Never two group accents in the same viewport (this app only uses `infra` cyan).

## Requirements

| ID | Requirement |
|---|---|
| **R1** | Tailwind exposes the DS color scales: `brand` (violet, incl. 950/975), `infra`, `saas`, `science`, and semantic `status` colors. Existing `brand.violet.*` key is retained but repointed to the new violet hexes so all 264 `brand-violet-*` usages adopt the new palette with no per-file edits. |
| **R2** | Tailwind `fontFamily` defines `display` (Bricolage Grotesque), `sans` (Hanken Grotesk), `mono` (Space Mono); body defaults to `sans`. |
| **R3** | `index.html` loads the three DS fonts from Google Fonts (replacing Quicksand + JetBrains Mono) and updates `<meta theme-color>` to the DS violet. |
| **R4** | `index.css` defines `--font-display`, `--font-sans`, `--font-mono` and the DS `--color-*` variables; the `@media (prefers-color-scheme)` block that hardcodes `#242424`/`#213547` and fights the `class`-based dark mode is removed. |
| **R5** | Reusable neobrutalism utilities exist: a hard-offset accent shadow (4px, 6px on hover) and the `-2px,-2px` hover lift, usable from CVA primitives. |
| **R6** | Shared `ui/` primitives are repainted to the DS language: flat surface + 1px violet border + cyan hard-offset shadow + hover lift where appropriate; headings use `font-display`; labels/buttons/eyebrows use `font-mono` uppercase; badges use semantic status colors. Primitives in scope: `Button`, `Card`, `Section`, `Modal`, `DetailsBox`, `MiniBox`, `Banner`, `ListItem`, `Typography`. |
| **R7** | Primary CTA is legible: cyan `#64C5EB` is too light for white text (fails WCAG), so the primary button uses the neobrutalist treatment (neutral/dark surface + violet border + cyan offset shadow) rather than a solid cyan fill. See design.md. |
| **R8** | The offset shadow is applied only to signature containers (cards, sections, modals, primary buttons) — not to dense list rows / table cells — to avoid visual noise in an admin panel. |
| **R9** | The local rule `.claude/rules/design-system.md` (monorepo root) is rewritten: the "prefer sharp corners / remove rounding" mandate is replaced by the DS radius (`rounded-lg` ~8px), border, shadow, and typography conventions, so future work doesn't revert this. |
| **R10** | `package.json` version bumped `0.6.0` → `0.7.0`. |
| **R11** | `public/manifest.json` theme/background colors updated to DS violet (if present). |

## Non-goals

- Per-screen repaint of the 52 files referencing brand colors (follow-up).
- Codemod renaming `brand-violet-*` → `brand-*` (optional follow-up).
- Touching dead `src/App.css` (not imported).
- New Cypress/visual-regression tests (none exist; verification is manual/visual).

## Verification

tsc + lint catch nothing visual and there are no test specs, so acceptance is **visual**:
run `yarn dev`, eyeball key screens (Home, Dashboard, a modal, a form) in **both light and
dark mode**, confirm fonts, violet borders, cyan offset shadows, hover lift, and legible CTAs.
Then `yarn build` + `yarn lint` must pass (gate-checks rule). Do not commit until the user
manually tests and approves (commit-validation rule).
