# Code Conventions

## Naming

### Files and Components

- **Screens:** PascalCase directories and files, `index.tsx` as the screen entry point. Example: `src/screens/Dashboard/components/Accounts/index.tsx`
- **UI components:** PascalCase single-file components in `src/components/ui/`. Example: `Typography.tsx`, `Button.tsx`, `SuspenseNotification.tsx`
- **Non-screen components:** PascalCase files directly in `src/components/`. Example: `AppNotifications.tsx`, `ErrorBoundary.tsx`, `ThemeProvider.tsx`
- **Typo in filename:** `FomField.tsx` (missing 'r') — inconsistency with all other files; likely a long-standing typo

### Functions and Hooks

- **Hooks:** kebab-case filenames prefixed with `use-`. Example: `use-profile.tsx`, `use-tenant-details.tsx`, `use-suspense-error.tsx`, `use-toggle-sidebar.tsx`
- **Hook functions:** camelCase exported as default. Example: `export default function useProfile(...)`
- **Component functions:** PascalCase. Private sub-components within a file (e.g. `LogoutModal`, `MainHeader`, `Secret`, `OperationMethod`) are also PascalCase but not exported.
- **Utility functions:** camelCase named exports. Example: `buildPath`, `formatDDMMYY`, `camelToHumanText`, `validateEmail`

### Types and Interfaces

- **OpenAPI-derived types:** Aliased locally via `type X = components["schemas"]["X"]` at the top of each file that needs them. Not re-exported; each file aliases independently.
- **Component prop interfaces:** Named `Props` (not `XProps`) within each file. When a prop interface needs to be imported by other files it uses the component name prefix: `AccountModalProps`, `PaginatedAccountsProps`.
- **Enums:** PascalCase names, used for local screen state (`ActiveTab`, `OpenedSection`, `SystemAccountTypes`) and shared domain types (`MycRole`, `MycPermission`, `Language`).
- **Shared global type:** `BaseProps` is declared as a `global interface` in `src/types/BaseProps.tsx` (which uses `.tsx` extension despite containing no JSX); it provides `children?: React.ReactNode` accessible everywhere without import.

### Redux Slices

- **Files:** `{noun}.state.tsx` in `src/states/`. Example: `profile.state.tsx`, `tenant.state.tsx`, `notification.state.tsx`
- **Actions:** `createAction` with string identifiers following `"{slice}/{actionName}"` convention. Example: `"tenant/setTenantInfo"`, `"notification/setNotification"`
- **Reducers:** Default exported as `{noun}Reducer`. Example: `profileReducer`, `tenantReducer`, `notificationReducer`

### Constants

- **Files:** kebab-case in `src/constants/`. Example: `routes.tsx`, `http-headers.ts`, `shared-component-styles.ts`, `zero-tenant.ts`
- **Route constants:** SCREAMING_SNAKE_CASE. Example: `HOME_ROUTE`, `DASHBOARD_ROUTE`, `PROFILE_ROUTE`
- **HTTP header names:** SCREAMING_SNAKE_CASE constant, string value in kebab-case. Example: `TENANT_ID_HEADER`

## File Structure (within files)

Observed ordering pattern in screen and component files:

1. `"use client"` directive (present in some files — leftover from Next.js conventions, ignored by Vite)
2. Third-party imports (react, react-router, @auth0, flowbite-react, react-icons, etc.)
3. Internal `@/` alias imports (UI components, hooks, services, types, constants)
4. Local type aliases (`type X = components["schemas"]["X"]`)
5. Enum or interface declarations
6. Component function(s) — default export first, then private named sub-components at the bottom of the file
7. Pure helper functions at the bottom (e.g. `getNumericPermission`, `setHttpErrorType`)

Import alias `@` is configured in `vite.config.ts` and resolves to `./src`; all internal imports use `@/` rather than relative paths.

Exports are mostly `export default function`. Named exports are used for actions, types meant for external consumption, and the `ThemeProvider`/`useTheme` pair.

## TypeScript Usage

- **Strict mode:** Not fully enforced — `no-explicit-any` is explicitly turned off in `eslint.config.js`, and `any` appears in multiple UI component files (Typography `title` prop, AccountType `renderedValues` callback, SearchBar internals)
- **Type derivation from OpenAPI:** `mycelium-schema.d.ts` is auto-generated; files alias specific schema types locally: `type Account = components["schemas"]["Account"]`. This keeps types authoritative from the API spec.
- **`as` casts:** Used moderately; some risk areas: `error as string` in ErrorBoundary, `parsedProfile as ProfileWithTtl` in use-profile, route definitions cast with `as AppRoute`
- **Non-null assertion:** `document.getElementById("root")!` in main.tsx — acceptable at entry point
- **Optional chaining:** Heavily used throughout; `profile?.isStaff`, `webhook?.url`, `account?.id` are common patterns
- **`serializableCheck: false`** in Redux middleware — required because some action payloads contain non-serializable values (Date objects used for `forceMutate` state)

## Error Handling

- **HTTP errors:** Channeled through `parseHttpError(res)` from `useSuspenseError` hook. It reads the response body, attempts JSON parse, and dispatches a Redux notification with severity derived from status code ranges (5xx = error, 4xx = warning, 3xx = info).
- **Auth0 errors:** `parseAuth0Error(err)` dispatches an error notification.
- **SWR fetcher errors:** Swallowed with `.catch(console.error)` in most screens — errors do not propagate to SWR's `error` field or trigger any UI state change.
- **Route errors:** Each route defines an `errorElement: <ErrorBoundary />` which uses `useRouteError()` from React Router and renders the error as a string alongside a generic illustration.
- **Session storage parse errors:** Wrapped in `try/catch` in `use-profile.tsx` with `console.error` fallback.
- **Promise rejections in effects:** `fetchProfile().then(setProfile).catch(console.error)` — unhandled rejections are silenced.

## Comments

- **JSDoc on hooks and utilities:** Consistently used for exported hooks (`use-profile`, `use-tenant-details`, `buildPath`) and utility functions (`buildRoutes`, `getNumericPermission`). JSDoc describes parameters, return values, and behavioral notes.
- **Inline comments:** Used to explain non-obvious logic blocks (e.g., the three-step URL resolution logic in `use-tenant-details`, the session storage TTL rationale in `use-profile`).
- **eslint-disable comments:** Present in 12 locations across the codebase; most suppress `react-hooks/exhaustive-deps` (dependency array shortcuts) and `@typescript-eslint/no-unused-vars` (destructured-but-ignored variables, e.g. `[searchParams, _]`). One suppresses `react-hooks/rules-of-hooks` inside `AccountType` where hooks are called conditionally after an early return — a genuine rules violation.
- **`"use client"` directives:** Present in several files (AppNotifications, useSuspenseError, Accounts/index, Profile/index). These are Next.js conventions with no effect in a Vite/React SPA; they appear to be copy-paste artifacts.
