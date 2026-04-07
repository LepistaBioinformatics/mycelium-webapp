# Feature Spec: REST → JSON-RPC Migration

## Overview

Replace all REST API calls in the webapp with typed JSON-RPC 2.0 wrappers against
`POST /_adm/rpc`. Build a `src/services/rpc/` layer (client + per-scope typed wrappers)
and update every consumer screen.

## Requirements

### RPC-001 — Client base

Create `src/services/rpc/client.ts` with:
- `rpcCall<P, R>(method, params, getToken): Promise<R>` — single request
- `rpcBatch(requests, getToken): Promise<BatchResult[]>` — array body
- Both throw on HTTP errors and on `json.error` in the response

### RPC-002 — Typed wrappers per scope

One file per scope in `src/services/rpc/<scope>.ts`. Each exported function:
- Has a typed `Params` interface (camelCase fields matching Rust `#[serde(rename_all = "camelCase")]`)
- Has a typed `Result` using `components["schemas"]["X"]` from `mycelium-schema.d.ts`
- Delegates to `rpcCall` with the exact method name constant

Scopes to implement: `beginners`, `managers`, `systemManager`, `gatewayManager`,
`guestManager`, `subscriptionsManager`, `tenantManager`, `tenantOwner`, `staff`

### RPC-003 — SWR key convention

All SWR reads use tuple keys: `["rpc", "<method.name>", ...discriminators]`
(e.g. `["rpc", "subscriptionsManager.accounts.list", page, skip]`).
Mutations call `mutate(["rpc", ...])` to revalidate.

### RPC-004 — No REST in migrated files

After migration, each file must contain zero `buildPath` imports and zero direct
`fetch(buildPath(...))` calls.

### RPC-005 — Gate check passes

`yarn build` (includes tsc) and `yarn lint` must pass with zero errors after each phase.

### RPC-006 — profile.get deferred

`use-profile.tsx` and `profile.state.tsx` are explicitly excluded from this migration.
Their REST calls remain unchanged until concern H2 is resolved.

---

## REST → RPC mapping

### `beginners` scope

| REST | Method | HTTP | RPC method |
|---|---|---|---|
| `/_adm/beginners/profile` | GET | — | **DEFERRED** (RPC-006) |
| `/_adm/beginners/tenants/{tenant_id}` | GET | SWR | `beginners.tenants.getPublicInfo` |
| `/_adm/beginners/tokens` | POST | fetch | `beginners.tokens.create` |
| `/_adm/beginners/accounts` | POST | fetch | `beginners.accounts.create` |

### `managers` scope

| REST | Method | HTTP | RPC method |
|---|---|---|---|
| `/_adm/managers/tenants` | GET | SWR | `managers.tenants.list` |
| `/_adm/managers/tenants` | POST | fetch | `managers.tenants.create` |
| `/_adm/managers/tenants/{id}` | DELETE | fetch | `managers.tenants.delete` |
| `/_adm/managers/accounts` | POST | fetch | `managers.accounts.createSystemAccount` |
| `/_adm/managers/guest-roles` | POST | fetch | `managers.guestRoles.createSystemRoles` |

### `systemManager` scope

| REST | Method | HTTP | RPC method |
|---|---|---|---|
| `/_adm/system-manager/webhooks` | GET | SWR | `systemManager.webhooks.list` |
| `/_adm/system-manager/webhooks` | POST | fetch | `systemManager.webhooks.create` |
| `/_adm/system-manager/webhooks/{id}` | PUT | fetch | `systemManager.webhooks.update` |
| `/_adm/system-manager/webhooks/{id}` | DELETE | fetch | `systemManager.webhooks.delete` |
| `/_adm/system-manager/error-codes` | GET | SWR | `systemManager.errorCodes.list` |

### `gatewayManager` scope

| REST | Method | HTTP | RPC method |
|---|---|---|---|
| `/_adm/gateway-manager/tools` | GET | SWR | `gatewayManager.tools.list` |

### `guestManager` scope

| REST | Method | HTTP | RPC method |
|---|---|---|---|
| `/_adm/guests-manager/guest-roles` | GET | SWR | `guestManager.guestRoles.list` |
| `/_adm/guests-manager/guest-roles` | POST | fetch | `guestManager.guestRoles.create` |
| `/_adm/guests-manager/guest-roles/{id}` | PUT | fetch | `guestManager.guestRoles.updateNameAndDescription` |
| `/_adm/guests-manager/guest-roles/{id}` | DELETE | fetch | `guestManager.guestRoles.delete` |
| `/_adm/guests-manager/guest-roles/{id}/children/{child_id}` | POST | fetch | `guestManager.guestRoles.insertRoleChild` |

### `subscriptionsManager` scope

| REST | Method | HTTP | RPC method |
|---|---|---|---|
| `/_adm/subscriptions-manager/accounts` | GET | SWR | `subscriptionsManager.accounts.list` |
| `/_adm/subscriptions-manager/accounts` | POST | fetch | `subscriptionsManager.accounts.createSubscriptionAccount` |
| `/_adm/subscriptions-manager/accounts/{id}` | GET | SWR | `subscriptionsManager.accounts.get` |
| `/_adm/subscriptions-manager/guest-roles` | GET | SWR | `subscriptionsManager.guestRoles.list` |
| `/_adm/subscriptions-manager/guest-roles/{id}` | GET | SWR | `subscriptionsManager.guestRoles.get` |
| `/_adm/subscriptions-manager/guests` | GET | SWR | `subscriptionsManager.guests.listLicensedAccountsOfEmail` |
| `/_adm/subscriptions-manager/guests/accounts/{id}` | GET | SWR | `subscriptionsManager.guests.listGuestOnSubscriptionAccount` |
| `/_adm/subscriptions-manager/guests/accounts/{id}/roles/{role_id}` | POST | fetch | `subscriptionsManager.guests.guestUserToSubscriptionAccount` |
| `/_adm/subscriptions-manager/guests/accounts/{id}/roles/{role_id}` | DELETE | fetch | `subscriptionsManager.guests.revokeUserGuestToSubscriptionAccount` |

### `tenantManager` scope

| REST | Method | HTTP | RPC method |
|---|---|---|---|
| `/_adm/tenant-manager/tenants/{id}` | GET | SWR | `tenantManager.tenant.get` |
| `/_adm/tenant-manager/accounts` | POST | fetch | `tenantManager.accounts.createSubscriptionManagerAccount` |
| `/_adm/tenant-manager/accounts/{id}` | DELETE | fetch | `tenantManager.accounts.deleteSubscriptionAccount` |
| `/_adm/tenant-manager/tags` | POST | fetch | `tenantManager.tags.create` |
| `/_adm/tenant-manager/tags/{id}` | DELETE | fetch | `tenantManager.tags.delete` |

### `tenantOwner` scope

| REST | Method | HTTP | RPC method |
|---|---|---|---|
| `/_adm/tenant-owner/accounts` | POST | fetch | `tenantOwner.accounts.createManagementAccount` |
| `/_adm/tenant-owner/meta` | PUT | fetch | `tenantOwner.meta.create` *(verify in dispatcher)* |
| `/_adm/tenant-owner/owners` | POST | fetch | `tenantOwner.owner.guest` |
| `/_adm/tenant-owner/owners` | DELETE | fetch | `tenantOwner.owner.revoke` |

### `staff` scope

| REST | Method | HTTP | RPC method |
|---|---|---|---|
| `/_adm/staffs/accounts/{id}/upgrade` | PATCH | fetch | `staff.accounts.upgradePrivileges` |
| `/_adm/staffs/accounts/{id}/downgrade` | PATCH | fetch | `staff.accounts.downgradePrivileges` |

---

## Files NOT to touch

- `src/hooks/use-profile.tsx` — profile REST call deferred (H2)
- `src/states/profile.state.tsx` — contains useSWR-in-thunk (H2)
- `src/services/openapi/` — keep the existing OpenAPI types; RPC results reuse them
