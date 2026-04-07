# State

## Decisions

- **D1** — SWR keys for RPC use tuple form `["rpc", "method.name", ...params]` instead of URL
  strings. This keeps SWR's deduplication and revalidation working without coupling to REST URLs.
- **D2** — `use-profile.tsx` profile fetch is NOT migrated in M1. The existing `useSWR` call
  inside a Redux thunk (H2) must be resolved first to avoid making a bad pattern permanent.
- **D3** — All `rpcCall` / `rpcBatch` wrappers live in `src/services/rpc/<scope>.ts`. No RPC
  logic in components.
- **D4** — Migration is done scope by scope (P1–P9), not file by file. Each phase is
  independently buildable and committable.

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
