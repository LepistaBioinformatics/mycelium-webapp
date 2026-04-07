import { components } from "@/services/openapi/mycelium-schema";
import { rpcCall } from "./client";

type TenantMetaKey = components["schemas"]["TenantMetaKey"];

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

export interface AccountsCreateManagementAccountParams {
  tenantId: string;
}

export function accountsCreateManagementAccount(
  params: AccountsCreateManagementAccountParams,
  getToken: () => Promise<string>
): Promise<void> {
  return rpcCall<AccountsCreateManagementAccountParams, void>(
    "tenantOwner.accounts.createManagementAccount",
    params,
    getToken
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export interface MetaCreateParams {
  tenantId: string;
  key: TenantMetaKey;
  value: string;
}

export function metaCreate(
  params: MetaCreateParams,
  getToken: () => Promise<string>
): Promise<void> {
  return rpcCall<MetaCreateParams, void>(
    "tenantOwner.meta.create",
    params,
    getToken
  );
}

// ---------------------------------------------------------------------------
// Owner
// ---------------------------------------------------------------------------

export interface OwnerGuestParams {
  tenantId: string;
  email: string;
}

export function ownerGuest(
  params: OwnerGuestParams,
  getToken: () => Promise<string>
): Promise<void> {
  return rpcCall<OwnerGuestParams, void>(
    "tenantOwner.owner.guest",
    params,
    getToken
  );
}

export interface OwnerRevokeParams {
  tenantId: string;
  email: string;
}

export function ownerRevoke(
  params: OwnerRevokeParams,
  getToken: () => Promise<string>
): Promise<void> {
  return rpcCall<OwnerRevokeParams, void>(
    "tenantOwner.owner.revoke",
    params,
    getToken
  );
}
