# Roadmap

## M1 — REST → JSON-RPC Migration

**Goal:** All `buildPath` REST calls replaced with typed RPC wrappers.
`src/services/rpc/` layer fully built and wired into every screen.

### Phases (in execution order)

| Phase | Scope | Files affected | Status |
|---|---|---|---|
| P0 | RPC client layer | `src/services/rpc/client.ts` | ✅ done |
| P1 | `systemManager` — webhooks + error codes | `systemManager.ts`, WebHooks/*, ErrorCodes/* | ✅ done |
| P2 | `gatewayManager` — discovery | `gatewayManager.ts`, Discovery/* | ✅ done |
| P3 | `beginners` — tokens + accounts (non-profile) | `beginners.ts`, CreateConnectionStringModal, MyceliumProfile | ✅ done |
| P4 | `managers` — tenants | `managers.ts`, Tenants/index, TenantModal, DeleteTenant | ✅ done |
| P5 | `tenantOwner` — meta, owners | `tenantOwner.ts`, EditMetadataModal, GuestOwnerModal, UnguestOwnerModal | ✅ done |
| P6 | `tenantManager` — tenant detail, tags, accounts | `tenantManager.ts`, Details/*, CreateSubscriptionManagerAccountModal, DeleteAccount | ✅ done |
| P7 | `guestManager` — guest roles | `guestManager.ts`, GuestRoles/*, GuestRoleSelector | ✅ done |
| P8 | `subscriptionsManager` — accounts + guests | `subscriptionsManager.ts`, PaginatedAccounts, AccountDetails, AccountInvitations, GuestsByEmail, GuestToAccountModal, UnInviteGuestModal | ✅ done |
| P9 | `staff` — upgrade/downgrade | `staff.ts`, UpgradeOrDowngradeAccountModal | ✅ done |
| P10 | `beginners.profile.get` | `use-profile.tsx`, `services/rpc/beginners.ts` | ✅ done |

## M2 — Active Concerns Resolution

Resolve remaining concerns from CONCERNS.md. H2 and M2 resolved. Remaining: H3, M4.

## M3 — Test Coverage

Add unit tests for RPC wrappers and key hooks. Requires vitest setup (see TESTING.md).
