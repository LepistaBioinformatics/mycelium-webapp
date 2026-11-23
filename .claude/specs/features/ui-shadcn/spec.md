# Feature: UI modernization — Tailwind v4 + shadcn/ui

**Status:** Implemented — gate passing (build, lint 0 errors, 67 unit tests, 7 Cypress e2e).
Pending user approval before commit. Decisions logged as STATE D34–D36.
Visually checked (Cypress + Chromium screenshots, stubbed gateway): login, home, onboarding,
profile (+ tabs), namespaces, accounts, guest roles (+ create modal), webhooks (populated
tables + create modal), federation, discovery, error codes; light + dark; 390px mobile profile.
Not visually checked: tenant details (18 files), account details, populated account lists,
the accounts dropdown menu, other modals and side curtains — review in the running app.

SPEC_DEVIATION (UI-05): only Modal (Dialog), Dropdown (DropdownMenu) and FormField (Label) are
rebuilt on shadcn. Banner, Divider, Skeleton, VerticalTabNav, SideCurtain, Pager, SearchBar and
CopyToClipboard were restyled on the token layer instead (same look, less behaviour risk);
inputs and tables are token-styled native elements (`ui/Input`, `ui/DataTable`). Unused
shadcn components were not kept.

**Size:** Complex (138 tsx files, styling stack swap, new component base)
**Branch:** `feat/ui-shadcn` (from `develop`)
**Version:** owned by semantic-release; commits use `feat(ui):` (visible restyle, no behaviour change → MINOR)

## Context

The webapp is styled with Tailwind CSS 3, Flowbite-React 0.10 (form inputs, table,
spinner, theme provider) and hand-written CVA primitives in `src/components/ui/`
painted with the Lepista design system (D11: violet `brand`, cyan `infra` accent,
Bricolage / Hanken / Space Mono, "delicate neobrutalism").

The goal is a cleaner, more modern UI built on shadcn/ui (Radix primitives, accessible
by default, owned source) while staying recognisably Lepista.

## Decisions (user, 2026-11-22)

| ID | Decision |
|---|---|
| D-01 | **shadcn + Lepista tokens.** shadcn's CSS variables map to the Lepista palette and fonts. The look gets cleaner (neutral inputs, softer focus rings); identity stays (violet primary, cyan accent, DS fonts). `shadow-neo` stays reserved for marketing/hero surfaces, as the DS rule already says. |
| D-02 | **Tailwind v4.** Current shadcn CLI and components target v4. `tailwind.config.js` becomes `@theme` in `src/index.css`; the palette stays defined once in `:root`. |
| D-03 | **Incremental migration.** Foundation → primitives (same public API) → screens in batches → Flowbite removed. The app stays usable after every phase. |
| D-04 | **Local preview.** Vite dev (`localhost:5173`, HMR) against a standalone gateway on `localhost:8080`. |

## Design (inline)

- **Where shadcn code lives:** `src/components/shadcn/` (components.json `aliases.ui`).
  The existing `src/components/ui/*` wrappers keep their names and props and are rebuilt
  on top of it, so the ~250 call sites do not change in phase 2. Keeping the two folders
  apart avoids `Button.tsx` vs `button.tsx` collisions on case-insensitive filesystems.
- **`cn` helper:** `src/lib/utils.ts` (`clsx` + `tailwind-merge`), the shadcn default;
  `@/lib/*` is already a tsconfig alias.
- **Tokens:** shadcn semantic variables (`--background`, `--foreground`, `--primary`,
  `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`,
  `--sidebar-*`) are defined in `:root` and `.dark` by referencing the existing
  `--color-<scale>-<step>` palette, never new hexes:
  - primary = `brand-600` / white text; ring = `infra-400`; accent = `infra` tint;
  - light background white, dark background `surface-950`, cards dark `surface-900`;
  - border/input neutral (zinc-200 light, `surface-800` dark); the violet outline stays
    on cards/panels via the `Card` wrapper, per DS;
  - radius `0.5rem` (DS `rounded-lg`).
- **Dark mode:** stays class-based (`.dark` on `<html>`, set by `ThemeProvider` from the
  OS preference) via `@custom-variant dark`.
- **New dependencies (justified):** `@tailwindcss/vite` (v4 build), `tailwind-merge` +
  `clsx` (shadcn `cn`), `tw-animate-css` (shadcn animations), `@radix-ui/*` /
  `lucide-react` (pulled by the shadcn components that are added). Removed at the end:
  `flowbite-react`, `autoprefixer`, `postcss` config.

## Requirements

### Phase 1 — Foundation

- **UI-01** Tailwind v4 with `@tailwindcss/vite`; `tailwind.config.js` and PostCSS config
  removed; every existing utility class keeps rendering (v4 renames applied by
  `@tailwindcss/upgrade`).
- **UI-02** Palette, fonts, shadows and animations defined in `src/index.css` (`:root` +
  `@theme`); palette values unchanged.
- **UI-03** `components.json` and the shadcn token layer (D-01 mapping) in light and dark.
- **UI-04** Flowbite still renders where used until phase 4, or is replaced right here if
  it does not work under v4 (flowbite-react 0.10 ships a v3 plugin — verify first).

### Phase 2 — Primitives (public API unchanged)

- **UI-05** `Button`, `Card`, `Modal` (→ Dialog), `FomField`/inputs (→ Input, Textarea,
  Select, Label), `Dropdown` (→ DropdownMenu), `Skeleton`, `Banner` (→ Alert), `Divider`
  (→ Separator), `VerticalTabNav` (→ Tabs), `SideCurtain` (→ Sheet), `Pager`
  (→ Pagination), `SearchBar` (→ Command), `CopyToClipboard`/tooltips (→ Tooltip) rebuilt
  on shadcn.
- **UI-06** Shell: `Sidebar`, `MobileNavbar`, `AppHeader` on the shadcn Sidebar.
- **UI-07** `Typography` keeps its variants, retuned to the new scale.

### Phase 3 — Screens (batches, one per area)

- **UI-08** Login, HomePage, HostedLoginCallback.
- **UI-09** Profile, Onboarding, Discovery, ErrorCodes.
- **UI-10** Accounts, GuestRoles.
- **UI-11** Tenants.
- **UI-12** WebHooks (tables → shadcn Table), Federation.

### Phase 4 — Cleanup

- **UI-13** No `flowbite-react` import left; dependency, `Flowbite` provider and theme
  overrides removed.
- **UI-14** `.claude/rules/design-system.md` (monorepo) updated: shadcn folder, token
  layer, Flowbite rule dropped.

## Acceptance (every phase)

- `yarn build`, `yarn lint`, `yarn test` pass.
- No behaviour change: same routes, same RPC calls, same i18n keys (new strings go to
  every locale).
- Light and dark mode checked in the running dev server; the user reviews each phase
  visually before it is committed (commit-validation rule).

## Non-goals

- New screens, flows or information architecture.
- Replacing redux, react-router, react-hook-form or i18next.
- Changing the Lepista palette values.
