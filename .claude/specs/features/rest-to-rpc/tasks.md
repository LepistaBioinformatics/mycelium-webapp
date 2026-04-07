# Tasks: REST → JSON-RPC Migration

Legend: ⬜ not started · 🔄 in progress · ✅ done · 🔴 blocked

---

## T0 — RPC client layer

\*\*Status:\*\* ✅

**What:** Create `src/services/rpc/client.ts` with `rpcCall` and `rpcBatch`.

**Where:** `src/services/rpc/client.ts` (new file)

**Spec:** RPC-001

**Done when:**
- `client.ts` exports `rpcCall<P, R>` and `rpcBatch`
- HTTP errors throw
- `json.error` throws with RPC method name in message
- `yarn build` passes

---

## T1 — `systemManager` wrappers + WebHooks + ErrorCodes

\*\*Status:\*\* ✅

**Depends on:** T0

**What:**
1. Create `src/services/rpc/systemManager.ts` with wrappers for:
   - `webhooksList(params, getToken)`
   - `webhooksCreate(params, getToken)`
   - `webhooksUpdate(params, getToken)`
   - `webhooksDelete(params, getToken)`
   - `errorCodesList(params, getToken)`
2. Migrate `src/screens/Dashboard/components/WebHooks/index.tsx` — SWR key → `["rpc", "systemManager.webhooks.list", ...]`
3. Migrate `src/screens/Dashboard/components/WebHooks/WebhookModal.tsx` — POST + PUT → rpc wrappers
4. Migrate `src/screens/Dashboard/components/WebHooks/DeleteWebHook.tsx` — DELETE → rpc wrapper
5. Migrate `src/screens/Dashboard/components/ErrorCodes/index.tsx` — SWR key → `["rpc", "systemManager.errorCodes.list", ...]`

**Spec:** RPC-002, RPC-003, RPC-004

**Done when:** zero `buildPath` in affected files, `yarn build` passes

---

## T2 — `gatewayManager` wrappers + Discovery

\*\*Status:\*\* ✅

**Depends on:** T0

**What:**
1. Create `src/services/rpc/gatewayManager.ts` with:
   - `toolsList(params, getToken)`
2. Migrate `src/screens/Dashboard/components/Discovery/index.tsx` — SWR key → `["rpc", "gatewayManager.tools.list", ...]`

**Spec:** RPC-002, RPC-003, RPC-004

**Done when:** zero `buildPath` in Discovery/index.tsx, `yarn build` passes

---

## T3 — `beginners` wrappers (non-profile) + token + account creation

\*\*Status:\*\* ✅

**Depends on:** T0

**What:**
1. Create `src/services/rpc/beginners.ts` with:
   - `tenantsGetPublicInfo(params, getToken)`
   - `tokensCreate(params, getToken)`
   - `accountsCreate(params, getToken)`
2. Migrate `src/hooks/use-tenant-details.tsx` — SWR key → `["rpc", "beginners.tenants.getPublicInfo", tenantId]`
3. Migrate `src/screens/Dashboard/components/CreateConnectionStringModal.tsx` — POST → `tokensCreate`
4. Migrate `src/screens/HomePage/MyceliumProfile.tsx` — POST `/_adm/beginners/accounts` → `accountsCreate`
5. Migrate `src/screens/Dashboard/components/Tenants/index.tsx` — `beginners.tenants.getPublicInfo` SWR usage (the inline fetch at line 125)
6. Migrate `src/screens/Dashboard/components/Tenants/TenantDetails.tsx` — same `getPublicInfo` SWR

**Note:** `use-profile.tsx` profile fetch is EXCLUDED (D2, RPC-006).

**Spec:** RPC-002, RPC-003, RPC-004, RPC-006

**Done when:** all listed files have zero `buildPath` except use-profile.tsx, `yarn build` passes

---

## T4 — `managers` wrappers + Tenants CRUD

\*\*Status:\*\* ✅

**Depends on:** T0

**What:**
1. Create `src/services/rpc/managers.ts` with:
   - `tenantsList(params, getToken)`
   - `tenantsCreate(params, getToken)`
   - `tenantsDelete(params, getToken)`
   - `accountsCreateSystemAccount(params, getToken)`
   - `guestRolesCreateSystemRoles(params, getToken)`
2. Migrate `src/screens/Dashboard/components/Tenants/index.tsx` — SWR key → `["rpc", "managers.tenants.list", ...]`
3. Migrate `src/screens/Dashboard/components/Tenants/TenantModal.tsx` — POST → `tenantsCreate`
4. Migrate `src/screens/Dashboard/components/Tenants/DeleteTenant.tsx` — DELETE → `tenantsDelete`
5. Migrate `src/screens/Dashboard/components/Accounts/AccountModal.tsx` — POST to managers → `accountsCreateSystemAccount`
6. Migrate `src/screens/Dashboard/components/GuestRoles/GuestRolesInitializer.tsx` — POST → `guestRolesCreateSystemRoles`

**Spec:** RPC-002, RPC-003, RPC-004

**Done when:** zero `buildPath` in affected files, `yarn build` passes

---

## T5 — `tenantOwner` wrappers + meta + owners

\*\*Status:\*\* ✅

**Depends on:** T0

**What:**
1. Create `src/services/rpc/tenantOwner.ts` with:
   - `accountsCreateManagementAccount(params, getToken)`
   - `metaCreate(params, getToken)` *(verify dispatcher — may be `meta.create` or `tenant.updateNameAndDescription`)*
   - `ownerGuest(params, getToken)`
   - `ownerRevoke(params, getToken)`
2. Migrate `src/screens/Dashboard/components/Tenants/CreateManagementAccount.tsx`
3. Migrate `src/screens/Dashboard/components/Tenants/Details/EditMetadataModal.tsx`
4. Migrate `src/screens/Dashboard/components/Tenants/Details/GuestOwnerModal.tsx`
5. Migrate `src/screens/Dashboard/components/Tenants/Details/UnguestOwnerModal.tsx`

**Note:** Before implementing metaCreate, read
`modules/mycelium-api-gateway/ports/api/src/rpc/dispatchers/tenant_owner.rs`
to confirm which RPC method handles `PUT /_adm/tenant-owner/meta`.

**Spec:** RPC-002, RPC-003, RPC-004

**Done when:** zero `buildPath` in affected files, `yarn build` passes

---

## T6 — `tenantManager` wrappers + tenant detail, tags, accounts

\*\*Status:\*\* ✅

**Depends on:** T0

**What:**
1. Create `src/services/rpc/tenantManager.ts` with:
   - `tenantGet(params, getToken)`
   - `accountsCreateSubscriptionManagerAccount(params, getToken)`
   - `accountsDeleteSubscriptionAccount(params, getToken)`
   - `tagsCreate(params, getToken)`
   - `tagsDelete(params, getToken)`
2. Migrate `src/screens/Dashboard/components/Tenants/Details/index.tsx` — SWR key → `["rpc", "tenantManager.tenant.get", tenantId]`
3. Migrate `src/screens/Dashboard/components/Tenants/Details/CreateSubscriptionManagerAccountModal.tsx`
4. Migrate `src/screens/Dashboard/components/Accounts/DeleteAccount.tsx`
5. Migrate `src/screens/Dashboard/components/Tenants/Details/BrandCard.tsx`

**Spec:** RPC-002, RPC-003, RPC-004

**Done when:** zero `buildPath` in affected files, `yarn build` passes

---

## T7 — `guestManager` wrappers + GuestRoles screens

\*\*Status:\*\* ✅

**Depends on:** T0

**What:**
1. Create `src/services/rpc/guestManager.ts` with:
   - `guestRolesList(params, getToken)`
   - `guestRolesCreate(params, getToken)`
   - `guestRolesUpdateNameAndDescription(params, getToken)`
   - `guestRolesDelete(params, getToken)`
   - `guestRolesInsertRoleChild(params, getToken)`
2. Migrate `src/screens/Dashboard/components/GuestRoles/index.tsx`
3. Migrate `src/screens/Dashboard/components/GuestRoles/GuestRolesModal.tsx`
4. Migrate `src/screens/Dashboard/components/GuestRoles/DeleteGuestRole.tsx`
5. Migrate `src/screens/Dashboard/components/GuestRoles/RegisterGuestRoleChild.tsx`
6. Migrate `src/screens/Dashboard/components/GuestRoleSelector.tsx`

**Spec:** RPC-002, RPC-003, RPC-004

**Done when:** zero `buildPath` in affected files, `yarn build` passes

---

## T8 — `subscriptionsManager` wrappers + Accounts screens

\*\*Status:\*\* ✅

**Depends on:** T0

**What:**
1. Create `src/services/rpc/subscriptionsManager.ts` with:
   - `accountsList(params, getToken)`
   - `accountsGet(params, getToken)`
   - `accountsCreateSubscriptionAccount(params, getToken)`
   - `guestRolesList(params, getToken)`
   - `guestRolesGet(params, getToken)`
   - `guestsListLicensedAccountsOfEmail(params, getToken)`
   - `guestsListGuestOnSubscriptionAccount(params, getToken)`
   - `guestsGuestUserToSubscriptionAccount(params, getToken)`
   - `guestsRevokeUserGuestToSubscriptionAccount(params, getToken)`
2. Migrate `src/screens/Dashboard/components/Accounts/PaginatedAccounts.tsx`
3. Migrate `src/screens/Dashboard/components/Accounts/AccountDetails.tsx`
4. Migrate `src/screens/Dashboard/components/Accounts/AccountInvitations.tsx`
5. Migrate `src/screens/Dashboard/components/Accounts/GuestsByEmail.tsx`
6. Migrate `src/screens/Dashboard/components/Accounts/GuestToAccountModal.tsx`
7. Migrate `src/screens/Dashboard/components/Accounts/UnInviteGuestModal.tsx`
8. Migrate `src/screens/Dashboard/components/Accounts/AccountModal.tsx` (subscriptions-manager POST)

**Spec:** RPC-002, RPC-003, RPC-004

**Done when:** zero `buildPath` in affected files, `yarn build` passes

---

## T9 — `staff` wrappers + UpgradeOrDowngrade

\*\*Status:\*\* ✅

**Depends on:** T0

**What:**
1. Create `src/services/rpc/staff.ts` with:
   - `accountsUpgradePrivileges(params, getToken)`
   - `accountsDowngradePrivileges(params, getToken)`
2. Migrate `src/screens/Dashboard/components/Accounts/UpgradeOrDowngradeAccountModal.tsx`

**Spec:** RPC-002, RPC-003, RPC-004

**Done when:** zero `buildPath` in affected file, `yarn build` passes

---

## T10 — Final validation

\*\*Status:\*\* ✅

**Depends on:** T1–T9

**What:**
1. Run `grep -r "buildPath" src/ --include="*.ts" --include="*.tsx"` — must return only
   `use-profile.tsx`, `profile.state.tsx`, and `src/services/openapi/mycelium-api.ts`
2. Run `yarn build` — zero errors
3. Run `yarn lint` — zero errors
4. Update ROADMAP.md phases P1–P9 to ✅

**Done when:** grep confirms zero unintended REST survivors, build + lint green

---

## Deferred

- **P10** — `beginners.profile.get` migration. Blocked by H2 (useSWR in Redux thunk).
  Track in STATE.md.
