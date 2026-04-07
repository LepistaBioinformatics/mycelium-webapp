# Concerns

## HIGH

### H1: Zero Test Coverage
**Evidence:** `cypress/e2e/` directory does not exist. No `*.cy.ts`, `*.spec.ts`, or `*.test.ts` files anywhere. No Vitest/Jest in devDependencies. `npm test` fails with "Missing script: test". Cypress is installed but contains only boilerplate placeholder files.

**Risk:** There is no safety net for regressions. Any change to authentication logic (`use-profile`), permission checking, API fetching, or Redux state can silently break without detection. Critical paths — login/logout, tenant selection, account CRUD, webhook management — have zero automated coverage. The permission gate (`hasEnoughPermissions` in `use-profile`) controls whether users can access sensitive admin data; its correctness is verified only by manual testing.

**Fix:**
1. Add `vitest` + `@testing-library/react` as devDependencies; add a `"test": "vitest"` script to `package.json`.
2. Start with pure utility functions (`buildPath`, `camelToHumanText`, `formatDDMMYY`, `validateEmail`) — zero mocking required.
3. Add Redux slice reducer tests (notification, tenant state transitions) with `configureStore` from RTK.
4. Add `renderHook` tests for `use-suspense-error` and `use-search-bar-params` with a mock Redux store.
5. Write parametric tests for the permission computation logic in `use-profile.tsx` — this is the most critical untested logic in the app.
6. For E2E: add a `cy:run` script; implement Auth0 programmatic login for Cypress (Auth0 Management API token or a dedicated test user with password grant).

---

### H2: `useSWR` Called Inside a Redux Async Thunk (Rules of Hooks Violation)
**Evidence:** `src/states/profile.state.tsx` lines 15–20:
```ts
export const fetchProfile = createAsyncThunk("profile/fetchProfile", async () => {
  const { data } = useSWR(buildPath("/_adm/beginners/profile"), (url) =>
    fetch(url).then((res) => res.json())
  );
  return data;
});
```
`useSWR` is a React hook. Calling it inside an async thunk (which is a plain async function, not a React component or hook) violates the Rules of Hooks. In strict mode this will throw at runtime if the thunk is ever dispatched. Currently the thunk is **never dispatched** anywhere in the codebase, so the bug is dormant.

**Risk:** The `profile` Redux slice is incomplete as a result — it only handles `fetchProfile.pending` and does nothing useful. The real profile fetching is done independently in `use-profile.tsx` using local React state and `sessionStorage`. The Redux `profile` slice is therefore vestigial dead code. If a developer attempts to use it in the future (e.g., dispatching `fetchProfile`), it will crash in production.

**Fix:** Delete the `fetchProfile` thunk and the `profile` Redux slice entirely (or redesign it without hooks). The actual profile state lives in `use-profile.tsx`'s local state and `sessionStorage`; the Redux slice provides no value in its current form.

---

### H3: Hook Called Conditionally (Rules of Hooks Violation — Active)
**Evidence:** `src/components/AccountType.tsx` lines 33–44:
```tsx
if (typeof account.accountType === "string") {
  return (/* early return */);
}

// eslint-disable-next-line react-hooks/rules-of-hooks
const accountType = useMemo(...);
// eslint-disable-next-line react-hooks/rules-of-hooks
const renderedValues = useCallback(...);
```
Two hooks (`useMemo`, `useCallback`) are called after a conditional early return. This is an unconditional rules-of-hooks violation. The `eslint-disable` comments suppress the lint warning but do not fix the underlying problem.

**Risk:** React's hook call order guarantee is broken. When `account.accountType` changes from an object to a string (or vice versa) between renders, React will encounter a different number of hook calls than expected and throw an error ("Rendered more hooks than during the previous render"). This is an active production risk for any account that has a polymorphic `accountType`.

**Fix:** Move the hooks above the conditional return (compute `accountType` and `renderedValues` unconditionally), or refactor into two separate components — one for string account types and one for object account types.

---

## MEDIUM

### M1: `@typescript-eslint/no-explicit-any` Globally Disabled
**Evidence:** `eslint.config.js`:
```js
"@typescript-eslint/no-explicit-any": "off"
```
`any` usage confirmed in: `Typography.tsx` (`title?: string | any`), `AccountType.tsx` (`renderedValues(values: any)`), `SearchBar.tsx`, `Modal.tsx`, `IntroSection.tsx`, `PageBody.tsx`, `SideCurtain.tsx`, `PaginatedAccounts.tsx`, and the `mycelium-schema.d.ts` generated file.

**Risk:** `any` erasures in UI component prop types defeat TypeScript's ability to catch type mismatches at compile time. In `Typography`'s `title` prop the type is `string | any`, which collapses to `any`. In `AccountType`'s `renderedValues` the `any` parameter obscures what shape is expected. These are low-severity individually but the pattern normalizes untyped code.

**Fix:** Re-enable the rule with `"warn"` severity. Fix the handful of genuine `any` usages with `unknown`, proper union types, or generics. Reserve `// eslint-disable-next-line @typescript-eslint/no-explicit-any` for the few unavoidable cases (e.g., in the generated schema file).

---

### M2: All Three Redux Slices Share the Same `redux-persist` Key
**Evidence:** `src/states/store.ts`:
```ts
const persistConfig = { key: "myc", storage };
const profilePersistedReducer = persistReducer(persistConfig, profileReducer);
const tenantPersistedReducer = persistReducer(persistConfig, tenantReducer);
const notificationPersistedReducer = persistReducer(persistConfig, notificationReducer);
```
All three slices use identical `persistConfig` objects with key `"myc"`. This means each slice is stored at the same localStorage key, causing each to overwrite the others' persisted data.

**Risk:** On application startup, `redux-persist` will rehydrate each slice from the same `localStorage["myc"]` entry. The last reducer to write wins; the other two lose their persisted state. Notification state should never be persisted (stale notifications on reload are confusing). Profile state may be redundant given the `sessionStorage` cache in `use-profile.tsx`. Tenant state is legitimately useful to persist. In practice the persisted `notification` state means users may see old error/success banners on page reload.

**Fix:** Give each slice a unique key: `{ key: "myc-tenant", storage }`. Remove `notificationReducer` from `persistReducer` entirely (notifications are transient). Consider whether `profileReducer` should be persisted at all given it is currently an empty stub.

---

### M3: `serializableCheck: false` in Redux Middleware
**Evidence:** `src/states/store.ts`:
```ts
middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
```
Serialization checking is fully disabled.

**Risk:** This was added to handle `Date` objects (used in `forceMutate` state in Accounts). However, disabling the check entirely means Redux will silently accept non-serializable values in any action or state, which breaks time-travel debugging, state persistence, and any future SSR scenarios. The actual fix is narrow: use `forceMutate: number | null` (timestamp) instead of `Date | null`.

**Fix:** Re-enable serialization checking with `ignoredActions` or `ignoredPaths` narrowly scoped to the specific field(s) that need it, rather than disabling globally.

---

### M4: Direct `useAuth0()` Calls Scattered Outside the Abstraction Layer
**Evidence:** `useAuth0()` is called directly in 6+ files outside `use-profile.tsx`: `AppHeader.tsx`, `MobileNavbar.tsx`, `LogoutButton.tsx`, `LoginButton.tsx`, `HomePage/index.tsx`, `MyceliumProfile.tsx`, `GuestRoles/DeleteGuestRole.tsx`, `WebHooks/DeleteWebHook.tsx`.

**Risk:** If the auth provider ever changes (or if Auth0-specific behavior needs to be mocked in tests), every call site must be updated individually. The abstraction intention of `use-profile.tsx` is partially undermined.

**Fix:** Either extend `use-profile.tsx` to re-export all needed Auth0 surface area (`logout`, `loginWithRedirect`, etc.) so all consumers go through one hook, or accept the current pattern and document it explicitly as the convention.

---

### M5: `console.log` Left in Production-Bound Code
**Evidence:** `src/screens/Dashboard/components/Discovery/index.tsx`:
```ts
const onSubmit = (term?: string) => {
  console.log(term);  // debug statement
  ...
};
```
**Risk:** Leaks search terms to the browser console in production. Minor information exposure and noise for end users inspecting the console.

**Fix:** Remove the `console.log` statement. Add an eslint rule `"no-console": "warn"` to prevent recurrence.

---

### M6: SWR Fetcher Errors Silently Swallowed
**Evidence:** In multiple screen components (Webhooks, Discovery, PaginatedAccounts, AccountDetails):
```ts
.catch(console.error)  // or .catch((err) => { console.error(err); })
```
SWR's `error` return value is never used in the UI. When a fetch fails catastrophically (network error, Auth0 token failure), the screen simply shows nothing (empty list, no skeleton, no error state).

**Risk:** Users see a blank screen with no feedback when API calls fail. Network errors or token expiry go unannounced. The `parseHttpError` function handles HTTP-level errors but not network-level failures (e.g., `fetch` throwing because the server is unreachable).

**Fix:** Use SWR's `error` return value to render an error state. Alternatively, wrap the `.catch` to dispatch a Redux notification instead of (or in addition to) `console.error`.

---

## LOW

### L1: `"use client"` Directives in a Vite SPA
**Evidence:** `"use client"` appears at the top of `src/components/AppNotifications.tsx`, `src/hooks/use-suspense-error.tsx`, `src/screens/Dashboard/components/Accounts/index.tsx`, `src/screens/Dashboard/components/Profile/index.tsx`.

**Risk:** Zero functional impact in a Vite/React SPA — Vite ignores this directive. However it signals that code was copy-pasted from a Next.js project or template, and may confuse developers unfamiliar with the codebase into thinking server components are in use.

**Fix:** Remove all `"use client"` directives. Add a lint rule (or eslint plugin) to disallow them if the project ever adopts a Next.js-based framework.

---

### L2: Typo in Filename `FomField.tsx`
**Evidence:** `src/components/ui/FomField.tsx` — missing the `r` in "Form".

**Risk:** Low impact but inconsistent; any import of `FomField` surprises readers.

**Fix:** Rename to `FormField.tsx` and update all import statements.

---

### L3: Extremely Low Accessibility Coverage
**Evidence:** Only 4 `aria-` attribute usages found in the entire `src/` tree. No `role`, `aria-label`, `aria-labelledby`, or `aria-describedby` on interactive custom components (Button, Modal header/close controls, Sidebar items, SideCurtain). Custom icon-only buttons (FaPlus, FaEdit, FaTrash in Webhooks) have no accessible labels.

**Risk:** The app is inaccessible to screen reader users. Icon-only action buttons are unannounced. Modal dialogs lack focus management and `aria-modal`. The Sidebar has no landmark role.

**Fix:** Add `aria-label` to icon-only buttons. Add `role="dialog"` and `aria-modal="true"` to Modal. Audit each custom UI component in `src/components/ui/` against WCAG 2.1 AA requirements.

---

### L4: Profile Tab Content Placeholder
**Evidence:** `src/screens/Dashboard/components/Profile/index.tsx` lines ~212–222:
```tsx
<TabItem ... title="List Connection Strings" icon={IoOptions}>
  Content
</TabItem>
```
A tab containing only the literal string "Content" — an unimplemented feature.

**Risk:** Users who click the "List Connection Strings" tab see a blank tab with no UI. Delivers a broken product experience.

**Fix:** Implement the tab content or hide the tab behind a feature flag until the feature is ready.

---

### L5: `isbot` Dependency Unused in Source
**Evidence:** `isbot` 5 is listed as a production dependency (`dependencies`, not `devDependencies`) but no import of `isbot` exists in `src/`.

**Risk:** Adds unnecessary bytes to the production bundle (Vite tree-shakes ES modules but `isbot` may not be fully tree-shakeable). Misleads maintainers about what the app does.

**Fix:** Remove `isbot` from `package.json` dependencies if it is not needed.

---

### L6: `swr-openapi` Unused Devdependency
**Evidence:** `swr-openapi` 5.1 is in `devDependencies` but not imported anywhere in the source. The project uses raw `useSWR` with hand-built URLs instead.

**Risk:** Misleading — suggests typed SWR-OpenAPI integration was planned or evaluated but never implemented.

**Fix:** Remove `swr-openapi` from `devDependencies`, or implement it to replace the current pattern of manually constructing URLs and typing SWR calls.

---

### L7: Route Array Mutation in `buildRoutes`
**Evidence:** `src/constants/routes.tsx` `buildRoutes` function:
```ts
return Object.values(ROUTES).map((route) => {
  route.name = t(`${tPath}.${route.translationKey}`); // mutates the original object
  ...
});
```
`ROUTES` is declared `as const` but `route.name` is mutated in place on each call. This bypasses the `const` intent and produces shared mutable state.

**Risk:** On the first call, route names are translated. On subsequent calls (profile or language changes), names are re-translated correctly in this case, but the mutation pattern is fragile — if `ROUTES` values were truly frozen this would throw.

**Fix:** Return new objects: `return { ...route, name: t(...) }` instead of mutating in place. Already partially done for the disabled case (`return { ...route, disabled: true }`).

---

### L8: 1-Minute Profile TTL May Be Too Short
**Evidence:** `src/hooks/use-profile.tsx`:
```ts
ttl: Date.now() + 1000 * 60 * 1, // 1 minute
```
**Risk:** The profile (which contains licensed resources and tenant ownership) is re-fetched every minute on any page load or navigation if the session storage entry has expired. For users with many roles/tenants this is unnecessary API load. The SWR-based `useTenantDetails` uses a 2-minute interval by comparison.

**Fix:** Extend the TTL to 5–15 minutes. Add a manual invalidation path (e.g., a "Refresh profile" button) so users can force a refresh after role changes without waiting for the TTL.
