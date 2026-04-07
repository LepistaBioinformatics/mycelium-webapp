# Architecture

**Pattern:** Single-Page Application (SPA), feature-based screen organization, custom design system on top of Flowbite/Tailwind

## High-Level Structure

The app is a React 19 SPA that serves as an admin control panel for the Mycelium API Gateway. There is a single entry point (`main.tsx`) that composes a fixed provider stack, then delegates to `App.tsx` which owns routing. All protected functionality lives inside a `/dashboard` shell route. Feature areas are organized as screen-level components under `src/screens/Dashboard/components/`, each of which owns its data-fetching, local state, and sub-components.

## Identified Patterns

### Provider Stack (main.tsx)

**Location:** `src/main.tsx`
**Purpose:** Establishes all global contexts before the app tree renders.
**Implementation:** The nesting order is significant and fixed:
```
StrictMode
  ReduxProvider (store)
    PersistGate (redux-persist, loading=null)
      ThemeProvider (Flowbite dark/light mode)
        Auth0Provider (domain/clientId from VITE_* env vars)
          App
```
The `PersistGate` with `loading={null}` means the UI renders nothing (blank) until the Redux store is rehydrated from localStorage. Auth0Provider sits _inside_ ThemeProvider deliberately so the Flowbite theme is available to Auth0's hosted UI redirect.

### CVA-Based Design System

**Location:** `src/components/ui/`
**Purpose:** Provide a typed, variant-driven component layer that abstracts Tailwind class composition.
**Implementation:** Every primitive (Button, Typography, PageBody, Card, Modal, Banner, etc.) uses `class-variance-authority` to define variants. A shared `projectVariants` object in `src/constants/shared-component-styles.ts` exports canonical token sets (width, height, padding, margin, gap) that are spread into individual component variant maps to keep token definitions DRY across 20+ components.
**Example:** `Button` exposes `intent`, `size`, `rounded`, `padding`, `fullWidth`, `center`, `disabled` variants; `Typography` exposes `as`, `decoration`, `width`, `highlight`, `center`, `truncate`, `flex`, `gap` and more.

### Profile-Centric Permission Hook

**Location:** `src/hooks/use-profile.tsx`
**Purpose:** Single hook that acts as the gateway for authentication state, user profile data, and permission checks throughout the app.
**Implementation:** The hook fetches the Mycelium `/beginners/profile` endpoint using plain `fetch` + `getAccessTokenSilently()`. The result is cached in `sessionStorage` under key `"myc-profile"` with a 1-minute TTL. On each call the hook also accepts an optional `args` object with `roles`, `permissions`, `tenantOwnerNeeded`, `shouldBeManager`, `shouldBeStaff`, `denyManager`, `denyStaff`, `restrictSystemAccount` flags and computes a `hasEnoughPermissions` boolean via `useMemo`. This derived boolean controls data-fetching eligibility (the SWR URL becomes `null` when `false`) and UI affordances (buttons disabled).
**Example:** `useProfile({ roles: [MycRole.SystemManager], permissions: [MycPermission.Read, MycPermission.Write] })` is called at the top of the Webhooks screen; if the result's `hasEnoughPermissions` is `false` the SWR key is `null` and no API call fires.

### SWR Data Fetching Pattern

**Location:** Throughout `src/screens/Dashboard/components/` and `src/hooks/`
**Purpose:** Cache and revalidate paginated list data from the Mycelium API.
**Implementation:** Each screen or hook computes a memoized URL string (including pagination and search query params). That URL is passed as the SWR key; when `null` (unauthenticated or insufficient permissions) SWR is suspended. The fetcher function always calls `getAccessTokenSilently()` to obtain a Bearer token, then calls native `fetch`, then pipes the response through `parseHttpError` from `useSuspenseError`. SWR options are consistent across screens: `revalidateOnFocus: false`, `revalidateOnReconnect: false`, `revalidateOnMount: true`, with per-screen `refreshInterval` (typically 60 seconds).
**Example:** `useTenantDetails` in `src/hooks/use-tenant-details.tsx` uses SWR with a 2-minute refresh interval; the fetcher explicitly handles 204 (returns `"unknown"`), 200 (returns `{ active: json }`), and 403 (returns `"unauthorized"`) status codes as typed union values.

### Centralized Notification System

**Location:** `src/states/notification.state.tsx`, `src/hooks/use-suspense-error.tsx`, `src/components/AppNotifications.tsx`, `src/components/ui/SuspenseNotification.tsx`
**Purpose:** Surface API errors and success messages to the user as transient toast-style banners with countdown timers.
**Implementation:** Redux's `notification` slice holds `{ title, notification, type }`. Any component can dispatch notifications by calling hooks from `useSuspenseError`: `parseHttpError(res)` (reads HTTP response, maps status codes to severity), `dispacheSuccess(msg)`, `dispatchError(msg)`, `dispatchWarning(msg)`, `dispatchInfo(msg)`. `AppNotifications` reads the slice and passes data to `SuspenseNotification`, which renders a `react-countdown`-driven progress bar that auto-dismisses after 10 seconds.

### Lazy-Loaded Screen Routes

**Location:** `src/constants/routes.tsx`
**Purpose:** Code-split each major feature area to reduce initial bundle size.
**Implementation:** All Dashboard sub-screens (Discovery, Profile, Tenants, Accounts, GuestRoles, ErrorCodes, Webhooks) are wrapped in `React.lazy()`. The `buildRoutes(profile, t, tPath)` function mutates route name strings in place for i18n and returns routes with `disabled: true` when the user's profile lacks `isStaff` or `isManager` flags required by that route.

## Data Flow

### Auth Flow

1. `Auth0Provider` initializes on app load.
2. If the user is not authenticated, `useAuth0().isAuthenticated` is `false`.
3. On the HomePage, `getAccessTokenWithPopup()` is called on button click, triggering the Auth0 popup login flow.
4. After successful login, `useAuth0().user` and `isAuthenticated` become truthy.
5. `use-profile` hook's `fetchProfile` fires — it calls `getAccessTokenSilently()` to get a JWT, then `GET /_adm/beginners/profile` with `Authorization: Bearer <token>`.
6. The returned `Profile` object is stored in React local state (inside the hook) and also written to `sessionStorage` with a 1-minute TTL.
7. `App.tsx` calls `useProfile()` and uses the returned `profile` to build the route list, enabling navigation to `/dashboard`.
8. Logout is handled via `useAuth0().logout()`, called from a confirmation modal inside the Dashboard shell.

### API Request Flow

1. Screen component calls `useProfile()` (with optional permission constraints) to get `getAccessTokenSilently` and `hasEnoughPermissions`.
2. A `useMemo` computes the SWR key URL using `buildPath(path, { query, path })` from `src/services/openapi/mycelium-api.ts`. The key resolves to `null` if the user is unauthenticated or lacks permissions.
3. SWR's fetcher function calls `getAccessTokenSilently()`, then native `fetch` with the Bearer token (and optionally a `x-mycelium-tenant-id` header from `src/constants/http-headers.ts`).
4. The response is piped through `parseHttpError`, which either returns the parsed JSON or dispatches a Redux notification and returns `null`.
5. SWR caches the result; `mutate()` is called after mutations (create/edit/delete) to refresh list data.

### State Flow

Three Redux slices are persisted to localStorage:

- **`profile`** — Holds `isLoadingUser`, `isLoadingProfile`, `adminAccess`. The async thunk `fetchProfile` exists but is incomplete (it incorrectly calls `useSWR` inside an async thunk — a rules-of-hooks violation; actual profile fetching is done outside Redux in `use-profile.tsx`).
- **`tenant`** — Holds `{ tenantInfo: Tenant | null, isLoading: boolean }`. Updated via `setTenantInfo` action dispatched when a tenant route's details load. `MainHeader` in the Dashboard reads this to display the selected tenant name.
- **`notification`** — Holds `{ title, notification, type }`. Written by `useSuspenseError` helpers; read by `AppNotifications`.

### Routing

React Router 7 `BrowserRouter` with nested `Routes`:
- `/` — `HomePage` (public, handles both anonymous and authenticated views)
- `/dashboard` — `Dashboard` shell (Outlet-based layout with Sidebar)
  - index — `Profile`
  - `/dashboard/profile` — `Profile`
  - `/dashboard/tenants` — `Tenants`
  - `/dashboard/tenants/:tenantId` — `AdvancedManagement` (Details)
  - `/dashboard/tenants/:tenantId/accounts` — `Accounts` (tenant-scoped)
  - `/dashboard/accounts` — `Accounts` (system-scoped)
  - `/dashboard/guest-roles` — `GuestRoles`
  - `/dashboard/error-codes` — `ErrorCodes`
  - `/dashboard/webhooks` — `Webhooks`
  - `/dashboard/discovery` — `Discovery`
- `*` — `NotFound`

Route metadata (name, icon, position, permission flags) drives the Sidebar navigation; `buildRoutes()` returns a sorted array of `AppRoute` objects that `Dashboard` maps into `Sidebar.Item` elements. Routes can be `disabled: true` (rendered but grayed out) when permission checks fail.
