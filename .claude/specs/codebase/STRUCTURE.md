# Project Structure

**Root:** `modules/mycelium-webapp/`

## Directory Tree

```
modules/mycelium-webapp/
├── cypress/
│   ├── fixtures/
│   │   └── example.json
│   └── support/
│       ├── commands.ts          # Placeholder only — no custom commands implemented
│       ├── component.ts         # Registers cy.mount; sets up Cypress component testing
│       └── component-index.html
├── public/                      # Static assets (icons, PWA assets, undraw.co illustrations, custom images)
├── src/
│   ├── components/              # Shared/global components
│   │   ├── ui/                  # Design system primitives (~28 files)
│   │   ├── AccountType.tsx
│   │   ├── AppNotifications.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   ├── LoginButton.tsx
│   │   ├── LogoutButton.tsx
│   │   ├── NotFound.tsx
│   │   ├── Owners.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── WrittenBy.tsx
│   ├── constants/
│   │   ├── http-headers.ts      # TENANT_ID_HEADER constant
│   │   ├── routes.tsx           # Route definitions, AppRoute type, buildRoutes()
│   │   ├── shared-component-styles.ts  # Shared CVA token sets
│   │   └── zero-tenant.ts
│   ├── functions/               # Pure utility functions
│   │   ├── camel-to-human-text.ts
│   │   ├── camel-to-kebab-text.ts
│   │   ├── format-dd-mm-yy.tsx
│   │   ├── format-email.ts
│   │   ├── get-licensed-resources-or-null.ts
│   │   ├── get-tenant-ownership-or-null.ts
│   │   ├── snake-to-human-text.ts
│   │   └── validate-email.ts
│   ├── hooks/
│   │   ├── use-profile.tsx      # Auth + profile fetch + permission logic
│   │   ├── use-search-bar-params.tsx
│   │   ├── use-suspense-error.tsx
│   │   ├── use-tenant-details.tsx
│   │   └── use-toggle-sidebar.tsx
│   ├── i18n/
│   │   ├── config.ts            # i18next initialization
│   │   ├── en/translations.json
│   │   ├── pt-br/translations.json
│   │   └── es/translations.json
│   ├── screens/
│   │   ├── Dashboard/
│   │   │   ├── index.tsx        # Dashboard shell: Sidebar + Outlet layout
│   │   │   └── components/
│   │   │       ├── Accounts/    # Account list + detail + CRUD modals (~11 files)
│   │   │       ├── Discovery/   # API operation browser
│   │   │       ├── ErrorCodes/  # Error code management
│   │   │       ├── GuestRoles/  # Guest role management
│   │   │       ├── Profile/     # User profile + licensed resources
│   │   │       ├── Tenants/     # Tenant list + nested Details/
│   │   │       ├── WebHooks/    # Webhook CRUD (~4 files)
│   │   │       ├── ControlPanelBreadcrumbItem.tsx
│   │   │       ├── CreateConnectionStringModal.tsx
│   │   │       ├── DashBoardBody.tsx
│   │   │       ├── GuestRoleSelector.tsx
│   │   │       └── PaginatedContent.tsx
│   │   └── HomePage/
│   │       ├── index.tsx        # Landing page (anonymous + authenticated views)
│   │       ├── AuthenticatedUser.tsx
│   │       ├── FlowContainer.tsx
│   │       └── MyceliumProfile.tsx
│   ├── services/
│   │   └── openapi/
│   │       ├── mycelium-api.ts       # buildPath() helper + MYCELIUM_API_URL
│   │       └── mycelium-schema.d.ts  # Generated OpenAPI types (components["schemas"])
│   ├── states/
│   │   ├── store.ts             # Redux store + persistors
│   │   ├── profile.state.tsx
│   │   ├── tenant.state.tsx
│   │   └── notification.state.tsx
│   ├── types/
│   │   ├── BaseProps.tsx        # Global interface BaseProps declaration
│   │   ├── GetSchema.tsx
│   │   ├── MyceliumPermission.ts
│   │   ├── MyceliumRole.ts
│   │   ├── PaginatedRecords.ts
│   │   ├── SearchOperations.tsx
│   │   ├── TenantStatus.ts
│   │   └── TenantTagTypes.tsx
│   ├── App.tsx                  # Router + route tree
│   ├── App.css
│   ├── index.css                # Global CSS / Tailwind directives
│   ├── main.tsx                 # Entry point + provider stack
│   └── vite-env.d.ts
├── eslint.config.js
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
└── vite.config.ts
```

## Module Areas

### `screens/`

**Purpose:** Full-page feature areas. Each subdirectory represents a top-level route or a significant sub-feature of the Dashboard.

**Key files:**
- `screens/HomePage/index.tsx` — Public landing page, handles both anonymous (login CTA) and authenticated (profile summary) states
- `screens/Dashboard/index.tsx` — The authenticated shell with persistent Sidebar, MobileNavbar, AppNotifications overlay, and logout confirmation modal
- `screens/Dashboard/components/Accounts/` — Most complex feature area (11 files, PaginatedAccounts.tsx is 517 lines); handles listing, detail panel (SideCurtain), and CRUD for account entities
- `screens/Dashboard/components/Tenants/Details/` — Second-most complex; nested tenant management including metadata, tags, owners, and guest owner modals
- `screens/Dashboard/components/Discovery/index.tsx` — OpenAPI operation browser; renders tool operations with parameters, request body, and response schema as JSON trees

### `components/ui/`

**Purpose:** The project's custom design system — thin wrappers around HTML elements and Tailwind classes, typed via CVA variants. These are the only reusable presentational primitives.

**Key files:**
- `Button.tsx` — CVA variants: intent (primary/secondary/warning/danger/link/info), size, rounded, padding, disabled
- `Typography.tsx` — Polymorphic text element with 15+ CVA variants; renders as `p`, `span`, `small`, `h1`–`h6`, or `title`
- `Modal.tsx` — Compound component (Modal.Header, Modal.Body)
- `PageBody.tsx` — Compound component (PageBody.Breadcrumb, PageBody.Content, PageBody.Footer) providing page-level layout
- `Sidebar.tsx` — Collapsible navigation sidebar with compound Sidebar.Item
- `SuspenseNotification.tsx` — Auto-dismissing toast banner with countdown progress bar
- `SideCurtain.tsx` — Slide-in detail panel used for AccountDetails

### `components/` (non-ui)

**Purpose:** Shared cross-cutting components that are not design-system primitives.

**Key files:**
- `ThemeProvider.tsx` — Wraps Flowbite's theme context; exports `useTheme()` hook
- `AppNotifications.tsx` — Connects Redux notification state to `SuspenseNotification`
- `ErrorBoundary.tsx` — React Router error boundary fallback
- `AccountType.tsx` — Renders the polymorphic `accountType` field of an Account (which can be a string or a tagged union object)

### `hooks/`

**Purpose:** Cross-cutting hooks shared across multiple screens.

**Key files:**
- `use-profile.tsx` — Auth, profile fetch, session-storage caching, permission computation
- `use-suspense-error.tsx` — Redux notification dispatch helpers + HTTP error parsing
- `use-tenant-details.tsx` — SWR-based tenant status fetch; reused in Accounts and Tenants screens
- `use-search-bar-params.tsx` — Pagination state (skip, pageSize) and search term management

### `services/openapi/`

**Purpose:** API connectivity layer.

**Key files:**
- `mycelium-api.ts` — `buildPath(path, { query, path })` utility that builds typed URL strings from the OpenAPI path literal type; `MYCELIUM_API_URL` from env
- `mycelium-schema.d.ts` — Auto-generated TypeScript type declarations from the backend's OpenAPI spec; consumed as `components["schemas"]["X"]` throughout the app

### `states/`

**Purpose:** Global Redux state. Three slices all persisted to localStorage.

### `types/`

**Purpose:** Domain enums, utility generics, and the global `BaseProps` declaration.

### `functions/`

**Purpose:** Pure utility functions (string formatting, validation, data transformations). No side effects, no hooks.

### `constants/`

**Purpose:** App-wide static values: routes, HTTP headers, Tailwind token definitions.

### `i18n/`

**Purpose:** i18next configuration and static translation JSON files for three locales.

## Where Things Live

| Concern | Location |
|---|---|
| Auth logic | `src/hooks/use-profile.tsx` (fetch + cache + permission logic); `src/main.tsx` (Auth0Provider config) |
| API calls | Inline in SWR fetchers inside screen components and custom hooks; URL building via `src/services/openapi/mycelium-api.ts` |
| Global state | `src/states/store.ts` + three `*.state.tsx` slice files |
| Routing | `src/constants/routes.tsx` (route definitions) + `src/App.tsx` (route tree) |
| Theme | `src/components/ThemeProvider.tsx` + `tailwind.config.js` (dark mode class strategy) |
| Notifications | `src/states/notification.state.tsx` → `src/hooks/use-suspense-error.tsx` → `src/components/AppNotifications.tsx` → `src/components/ui/SuspenseNotification.tsx` |
| i18n config | `src/i18n/config.ts` + `src/i18n/{locale}/translations.json` |
| Type definitions | `src/services/openapi/mycelium-schema.d.ts` (API types) + `src/types/` (domain enums/interfaces) |
