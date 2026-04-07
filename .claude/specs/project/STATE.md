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

**M4 — Native Auth** (spec complete, not started)

Spec: `.claude/specs/features/native-auth/` — 8 tasks (T0–T8)

**Blocked by:** Gateway feature `magic-link-auth` (GT0–GT7 must be complete first)

Key decisions made:
- Login flow: email → magic link email → gateway HTML page shows 6-digit code → user types code in webapp → JWT issued
- JWT stored in React state (primary) + `sessionStorage("myc-native-token")` (page reload)
- `useNativeAuth` hook is a drop-in replacement for `useAuth0()` surface
- Auth0 removed from webapp entirely; remains as optional external provider at gateway level
- `NativeAuthProvider` replaces `Auth0Provider` in `main.tsx`
- All auth consumption already centralized in `use-profile.tsx` (D5) — migration touches only that file + `main.tsx` + `HomePage`
