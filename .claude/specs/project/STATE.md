# State

## Decisions

- **D1** — SWR keys for RPC use tuple form `["rpc", "method.name", ...params]` instead of URL
  strings. This keeps SWR's deduplication and revalidation working without coupling to REST URLs.
- **D2** — `use-profile.tsx` profile fetch was deferred from M1 (blocked by H2). Resolved in M2:
  H2 fixed by deleting the vestigial Redux profile slice; P10 then migrated to `beginners.profile.get`.
- **D3** — All `rpcCall` / `rpcBatch` wrappers live in `src/services/rpc/<scope>.ts`. No RPC
  logic in components.
- **D4** — Migration is done scope by scope (P1–P9), not file by file. Each phase is
  independently buildable and committable.
- **D5** — M4 resolved by extending `useProfile()` to re-export `logout` and `loginWithRedirect`
  from Auth0. All 11 direct `useAuth0()` call sites now go through `use-profile.tsx`.
  `useAuth0` is imported only in `use-profile.tsx`.
- **D6** — `NativeAuthContext` exports both provider and hook from the same file (standard context
  pattern). The `react-refresh/only-export-components` warning is accepted as a known trade-off.
- **D8** — `NativeAuthContext` persists both token (`myc-native-token`) and user (`myc-native-user`) to `sessionStorage`. User data must survive page reload for any component that guards on `user?.email` (e.g. Onboarding, use-profile). Restore both on mount; clear both on logout.
- **D9** — Homepage is the auth entry point. `/login` remains for backward compatibility but both routes redirect to `/dashboard` after successful auth. `loginWithRedirect()` navigates to `/` (not `/login`).
- **D7** — `NativeUser.email` is `components["schemas"]["Email"]` = `{ username: string; domain: string }`.
  String rendering uses `${username}@${domain}`. Comparison with `Owner.email` (plain string) converts
  the Email object before matching.

## Blockers

_(none)_

## Lessons

- **L1 — tenantOwner.meta** — The `/_adm/tenant-owner/meta` endpoint is POST not PUT. The correct
  RPC method is `tenantOwner.meta.create` (confirmed from `method_names.rs`). The spec assumed PUT.
- **L2 — GuestRoleSelector scope** — `GuestRoleSelector.tsx` lists guest roles via
  `subscriptionsManager.guestRoles.list`, not `guestManager.guestRoles.list`. The original REST
  endpoint was `/_adm/subscriptions-manager/guest-roles` — scope must match the REST path.
- **L3 — tagsUpdate not in spec** — `tenantManager.ts` required an extra `tagsUpdate` wrapper
  (method `tenantManager.tags.update`) not listed in the original spec. `BrandCard` uses a PUT
  tags endpoint that spec missed.
- **L4 — AccountModal systemScoped branch** — T4 sub-agent reported migrating AccountModal but
  left the `systemScoped` branch on REST (`/_adm/managers/accounts`). Always verify ALL branches
  inside a component, not just the first one found.
- **L5 — empty interface lint error** — `interface Foo extends Omit<Bar, "x"> {}` triggers
  `@typescript-eslint/no-empty-object-type`. Use `type Foo = Omit<Bar, "x">` instead.
- **L6 — onSubmit dead second param** — `SearchBar.onSubmit` type is `(term?: string) => void`.
  Several screens passed a two-param handler. The second param was dead code; removing it fixes
  the `@typescript-eslint/no-unused-vars` lint error cleanly.
- **L7 — @/contexts alias missing** — `tsconfig.app.json` had explicit path mappings for every
  `src/` subfolder but `contexts/` was not included. Adding new top-level dirs under `src/` requires
  adding the alias to `tsconfig.app.json` (Vite's wildcard alias covers runtime but not tsc).
- **L8 — react-router v7** — package is `react-router`, not `react-router-dom`. Import
  `useNavigate` from `"react-router"`.
- **L9 — MyceliumLoginResponse.duration is string** — The spec defined `duration: number` but
  the schema type is `duration: string`. Always use `components["schemas"]["X"]` over hand-rolled
  types to catch gateway contract mismatches early.
- **L10 — NativeAuthContext user lost on reload** — `setAuth` stored the token but not the user.
  On reload, the context restored `token` but set `user: null`. Any effect guarded on `user?.email`
  silently skipped. Fix: persist user to a separate sessionStorage key and restore both on mount.
- **L11 — Redirect guard needs isLoadingUser, not user** — Homepage redirect used
  `isAuthenticated && user` which failed when user was null (pre-L10 fix). Even after the fix,
  the correct guard is `!isLoadingUser && isAuthenticated` — decouple redirect from user object
  presence to handle edge cases where token is valid but user deserialization fails.

## Todos

- [x] Check `tenantOwner.meta.create` vs `tenantOwner.tenant.updateNameAndDescription`
  for the `/_adm/tenant-owner/meta` PUT call — confirmed: `tenantOwner.meta.create` (POST).
- [x] Verify if `AccountModal` POST to `/_adm/subscriptions-manager/accounts` maps to
  `createSubscriptionAccount` or `createRoleAssociatedAccount` — confirmed: `createSubscriptionAccount`.
- [x] Verify `AccountInvitations` second SWR call (`listGuestOnSubscriptionAccount` vs
  `listLicensedAccountsOfEmail`) — confirmed: `listLicensedAccountsOfEmail`.

## Deferred Ideas

- Batch RPC calls on screen load (load multiple resources in one round-trip using `rpcBatch`).
  Deferred until all screens are migrated individually — batching is an optimization pass.

- M3 (Test Coverage) deferred in favor of M4 (Native Auth) — user prioritized auth replacement.

## Current Focus

**M4 — Native Auth** ✅ complete (2026-04-07)

**Design System — token migration** ✅ complete (2026-04-12)
- DS-W-01 → DS-W-06 (Tailwind brand tokens, font import, CSS vars, Button, Typography, meta tag) — done in prior commit
- All remaining components and screens migrated: 50 files, all bare `indigo-*` → `brand-violet-*`, `violet-*` → `brand-violet-*`, `lime-400/500/600/700` → `brand-lime-*`
- `lime-100` and `lime-900` intentionally preserved (no brand equivalent in palette)
- Gateway templates (DS-G-01 → DS-G-04) remain out of scope for webapp

**Auth + Onboarding flow redesign** ✅ complete (2026-04-13)
- `HomePage` is now a proper landing page with embedded magic-link auth form (email → code). Authenticated users redirect immediately to `/dashboard`; loading state renders null to avoid form flash.
- `LoginPage` still exists at `/login` but redirects to `/dashboard` on success (was `/`).
- `loginWithRedirect` in `use-native-auth.tsx` now points to `/` (homepage) instead of `/login`.
- `NativeAuthContext` now persists `user` to `sessionStorage` (`myc-native-user` key) alongside the token. Previously `user` was lost on page reload, breaking the Onboarding effect guard (`user?.email` was null).
- Dashboard index replaced: `<Profile />` → `<Onboarding />` — a vertical timeline showing account creation (required) and optional meta fields (phone, Telegram, WhatsApp, locale). Steps 2–5 are locked until account exists.
- Removed: `AuthenticatedUser.tsx`, `MyceliumProfile.tsx`, `FlowContainer.tsx` from `screens/HomePage/`.
- Auth0-related naming cleaned up: `parseAuth0Error` → `parseAuthError`, `auth0Logout` → `logout`, `VITE_AUTH0_*` env vars removed from all `.env.*` files.
