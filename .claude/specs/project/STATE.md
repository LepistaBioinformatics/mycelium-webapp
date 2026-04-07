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

- **B1** — `beginners.profile.get` migration (P10) is blocked by concern H2.
  Do not migrate `use-profile.tsx` or `profile.state.tsx` until H2 is addressed.

## Lessons

_(empty — will be populated during execution)_

## Todos

- [ ] Check `tenantOwner.meta.create` vs `tenantOwner.tenant.updateNameAndDescription`
  for the `/_adm/tenant-owner/meta` PUT call — need to read the dispatcher to confirm.
- [ ] Verify if `AccountModal` POST to `/_adm/subscriptions-manager/accounts` maps to
  `createSubscriptionAccount` or `createRoleAssociatedAccount` — depends on the payload shape.
- [ ] Verify `AccountInvitations` second SWR call (`listGuestOnSubscriptionAccount` vs
  `listLicensedAccountsOfEmail`).

## Deferred Ideas

- Batch RPC calls on screen load (load multiple resources in one round-trip using `rpcBatch`).
  Deferred until all screens are migrated individually — batching is an optimization pass.
