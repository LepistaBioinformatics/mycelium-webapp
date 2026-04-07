# Tech Stack

**Analyzed:** 2026-04-07

## Core

- **Language:** TypeScript 5.7 (strict mode via tsconfig; `no-explicit-any` rule explicitly disabled in eslint)
- **Framework:** React 19 (with `React.StrictMode` enabled)
- **Build tool:** Vite 6.1 with `@vitejs/plugin-react`
- **Package manager:** Yarn (yarn.lock present; scripts invoked via npm/yarn interchangeably)

## UI

- **Component library:** Flowbite React 0.10 — used for `Dropdown`, `Tabs`, `TabItem`, `Flowbite` (theme wrapper); the project builds a thin custom design system on top of it
- **Custom UI layer:** `src/components/ui/` — Button, Typography, Modal, PageBody, Card, Section, Sidebar, SideCurtain, SearchBar, SuspenseNotification, and ~20 more; all styled via CVA (class-variance-authority)
- **Styling:** Tailwind CSS 3 with PostCSS/Autoprefixer; dark-mode via `class` strategy; Flowbite Tailwind plugin integrated in `tailwind.config.js`
- **Icons:** react-icons 5.5 (multiple icon families: `ri`, `md`, `fa`, `io`, `gi`, `gr`, `vsc`, `io5`)
- **Variant system:** `class-variance-authority` 0.7 drives all variant-based component styling; a shared `projectVariants` object in `src/constants/shared-component-styles.ts` provides canonical width/height/padding/gap/margin token sets reused across components

## State & Data

- **State management:** Redux Toolkit 2.6 + React Redux 9.2; three slices: `profile`, `tenant`, `notification`; all persisted via `redux-persist` 6 (localStorage, key `"myc"`)
- **Remote data fetching:** SWR 2.3 used directly in hooks and screen components (not via `swr-openapi`; that package is a devDependency and appears unused at runtime)
- **Form handling:** react-hook-form 7.54 used in all mutation modals (AccountModal, WebhookModal, TenantModal, GuestToAccountModal, etc.)
- **API client:** Plain `fetch` wrapped by `buildPath()` helper in `src/services/openapi/mycelium-api.ts`; no generated axios/fetch client despite `openapi-typescript-codegen` being present

## Auth

- **Provider:** Auth0 via `@auth0/auth0-react` 2.3
- **Token strategy:** `getAccessTokenSilently()` called per-request inside SWR fetchers; `getAccessTokenWithPopup()` used on the home page as the login trigger
- **Profile caching:** Session-storage TTL cache (1 minute) implemented manually in `use-profile` hook; Redux store also holds some auth-adjacent state

## i18n

- **Library:** i18next 25 + react-i18next 15
- **Locales:** English (`en`, default/fallback), Brazilian Portuguese (`pt-br`), Spanish (`es`); translation files are static JSON at `src/i18n/{locale}/translations.json`
- **Usage pattern:** `useTranslation()` hook called in every screen and most components; translation keys are nested (`screens.Dashboard.Accounts.title`, `Menu.tenants`, etc.)

## PWA

- **Plugin:** `vite-plugin-pwa` 1.0 with `autoUpdate` registration
- **Workbox:** `globPatterns` covers js/css/html/ico/png/svg/json; Google Fonts and GStatic font URLs cached via `CacheFirst` strategy (1 year TTL)
- **Assets:** `@vite-pwa/assets-generator` — run via `generate-pwa-assets` script from `public/logo-small.svg`; `manifest: false` (external `public/manifest.webmanifest` file expected)

## Testing

- **E2E:** Cypress 14.1 — configured with component testing support (`cypress/react` mount command registered); **no actual test specs exist** (`cypress/e2e/` directory is absent)
- **Unit / Integration:** None — no Vitest, Jest, or React Testing Library present

## Dev Tools

- **Linter:** ESLint 9.19 flat config; plugins: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `typescript-eslint`; `@typescript-eslint/no-explicit-any` explicitly set to `"off"`
- **Type checker:** TypeScript 5.7 (`tsc -b` runs as part of `build` script); separate `tsconfig.app.json` and `tsconfig.node.json`
- **API types:** `openapi-typescript` 7.6 generates `src/services/openapi/mycelium-schema.d.ts` from the backend OpenAPI spec (run manually, not part of CI scripts)
- **Markdown rendering:** react-markdown 10 + remark-gfm 4 (used in Discovery screen for operation descriptions)
- **JSON viewer:** react-json-pretty 2.2 with `monikai` theme (used in Discovery screen)
- **Countdown:** react-countdown 2.3 (used in SuspenseNotification timer bar)
- **Bot detection:** isbot 5 (declared as a runtime dependency; no active usage found in src — likely residual)
