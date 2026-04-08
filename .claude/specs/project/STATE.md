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
