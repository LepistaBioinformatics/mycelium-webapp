# External Integrations

## Identity Provider

**Service:** Auth0
**Purpose:** Federated authentication — handles user identity, session management, and JWT issuance. The app does not implement its own login/registration flows.

**Implementation:**
- Provider: `@auth0/auth0-react` 2.3 (`Auth0Provider` in `src/main.tsx`)
- Token acquisition: `getAccessTokenSilently()` used inside every SWR fetcher to attach a Bearer JWT to API requests. `getAccessTokenWithPopup()` is the login trigger on the HomePage (popup rather than redirect flow).
- Hook consumption: A custom `useProfile` hook wraps `useAuth0()` and re-exports its values alongside derived Mycelium-specific profile data. Direct `useAuth0()` calls also exist in `AppHeader`, `MobileNavbar`, `LogoutButton`, `LoginButton`, `HomePage`, `MyceliumProfile`, and several Delete/Guest-role modals — the abstraction is leaky.
- Logout: `useAuth0().logout()` called directly from the Dashboard's `LogoutModal` component.

**Config (env vars in `src/main.tsx`):**
```
VITE_AUTH0_CLIENT_ID      — Auth0 application client ID
VITE_AUTH0_DOMAIN         — Auth0 tenant domain (e.g., mycelium.us.auth0.com)
VITE_AUTH0_AUDIENCE       — API audience identifier (used for JWT `aud` claim)
VITE_AUTH0_SCOPE          — Requested OAuth scopes
```

**Authorization params:** `redirect_uri: window.location.origin`, `display: "page"`, `prompt: "login"`, `response_type: "code"` (PKCE code flow).

---

## Backend API

**Service:** Mycelium API Gateway (internal; the same system this webapp administers)
**Purpose:** All application data — profiles, tenants, accounts, guest roles, webhooks, API operations (discovery). The webapp is the control-panel UI for this gateway.

**Implementation:**
- Base URL: `VITE_MYCELIUM_API_URL` env var, accessed via `src/services/openapi/mycelium-api.ts`
- Path builder: `buildPath(path: keyof paths, { query?, path? })` constructs a typed `URL` object using the OpenAPI path literal type as the key. Path parameters are replaced via `encodeURIComponent`; query params use `URLSearchParams`.
- HTTP client: Native `fetch` API (no Axios, no generated client). Every call is inline inside SWR fetcher functions.
- Auth: `Authorization: Bearer <token>` header on every request; token obtained from Auth0 via `getAccessTokenSilently()` before each fetch.
- Tenant scoping: Some endpoints require the `x-mycelium-tenant-id` header (constant from `src/constants/http-headers.ts`); applied conditionally when `tenantId` is available.

**Known API endpoints accessed (from route paths and `buildPath` calls):**

| Path | HTTP | Used in |
|---|---|---|
| `/_adm/beginners/profile` | GET | `use-profile.tsx` (profile fetch) |
| `/_adm/beginners/tenants/{tenant_id}` | GET | `use-tenant-details.tsx` |
| `/_adm/system-manager/webhooks` | GET/POST/PUT/DELETE | `WebHooks/` screen |
| `/_adm/gateway-manager/tools` | GET | `Discovery/` screen |
| `/_adm/subscriptions-manager/accounts` | GET/POST | `Accounts/` screen and modals |
| `/_adm/subscriptions-manager/accounts/{account_id}` | GET/DELETE/PATCH | `AccountDetails.tsx`, `DeleteAccount.tsx`, etc. |
| `/_adm/guests-manager/...` | various | `GuestRoles/` screen |
| `/_adm/.../tenants` | GET/POST | `Tenants/` screen |

**Type safety:** `src/services/openapi/mycelium-schema.d.ts` is generated from the backend's OpenAPI spec using `openapi-typescript`. Component props and state throughout the app use `components["schemas"]["X"]` to stay in sync with the API contract. This file must be regenerated manually when the backend schema changes.

**Error handling:** All HTTP responses go through `useSuspenseError().parseHttpError(res)`. Non-OK responses are parsed (JSON or text) and dispatched as Redux notifications. Status-to-severity mapping: 5xx = error, 4xx = warning, 3xx = info.

---

## i18n

**Service:** i18next (self-hosted, static JSON files — no external translation service)
**Purpose:** Multi-language support for UI text.
**Implementation:**
- Config: `src/i18n/config.ts` initializes i18next with `react-i18next` integration
- Languages: `en` (default/fallback), `ptBr` (Brazilian Portuguese), `es` (Spanish)
- Translation files: Static JSON at `src/i18n/{locale}/translations.json`; no runtime loading from CDN
- Usage: `useTranslation()` hook called in every screen; keys are deeply nested (`screens.Dashboard.Accounts.title`, `Menu.webhooks`, etc.)
- Language switching: `src/components/LanguageSwitcher.tsx` component exists (not traced to active UI placement, may be unused or conditionally rendered)
- Debug mode: Enabled in development (`import.meta.env.PROD ? false : true`)

---

## PWA

**Service:** Browser PWA / Workbox (vite-plugin-pwa + workbox-build)
**Purpose:** Progressive Web App capabilities — installability, offline asset caching, background sync of static resources.

**Implementation:**
- Plugin: `vite-plugin-pwa` 1.0 in `vite.config.ts` with `registerType: 'autoUpdate'`
- Service worker auto-updates when a new build is deployed (user gets the new version on next navigation without manual refresh)
- Asset caching: All `.{js,css,html,ico,png,svg,json}` files cached via Workbox `globPatterns`; a large `includeAssets` list in `vite.config.ts` explicitly includes all PWA icon variants (Android, Apple, Microsoft), undraw.co illustrations, and custom brand images
- Runtime caching: Google Fonts (`fonts.googleapis.com`) and GStatic font assets (`fonts.gstatic.com`) are cached with `CacheFirst` strategy and a 1-year expiration / 10-entry limit
- Manifest: `manifest: false` in plugin config — an external `public/manifest.webmanifest` file is expected (not auto-generated by the plugin)
- Asset generation: `npm run generate-pwa-assets` invokes `pwa-assets-generator --preset minimal public/logo-small.svg` to produce icon variants

---

## Google Fonts

**Service:** Google Fonts CDN
**Purpose:** Font loading for the app's typography (fonts are referenced from CSS/HTML, not declared in visible source)
**Integration:** Passive — no explicit import in app source; presence inferred from Workbox runtime caching rules for `fonts.googleapis.com` and `fonts.gstatic.com` in `vite.config.ts`. The fonts are fetched by the browser and cached by the service worker.

---

## GitHub / External Links (Static)

The HomePage (`src/screens/HomePage/index.tsx`) contains hardcoded external links:
- `https://www.linkedin.com/showcase/mycelium-api-gateway-mag/` — LinkedIn showcase
- `https://github.com/LepistaBioinformatics/mycelium` — Backend repo
- `https://github.com/LepistaBioinformatics/mycelium-webapp` — This webapp's own repo
- `https://lepistabioinformatics.github.io/mycelium-docs/` — Documentation site

These are static `<Link to="..." target="_blank">` elements with no runtime integration.

---

## OpenAPI Code Generation (Dev Tooling)

**Tools:** `openapi-typescript` 7.6 + `@open-rpc/generator` 2.1 + `openapi-typescript-codegen` 0.29

**Purpose:** Generate `src/services/openapi/mycelium-schema.d.ts` from the backend's OpenAPI spec. This is a development workflow step, not a runtime integration.

**Workflow gap:** There is no npm script for schema regeneration. The developer must run `openapi-typescript` manually (or via a separate monorepo-level command not visible in this webapp's `package.json`). If the backend API schema drifts from the generated types, TypeScript will catch mismatches in typed `buildPath` calls and schema property accesses — but only if the developer regenerates the types.

**Note:** `swr-openapi` 5.1 is listed as a devDependency but is not used anywhere in `src/`. It appears to be unused tooling, possibly evaluated and abandoned.
