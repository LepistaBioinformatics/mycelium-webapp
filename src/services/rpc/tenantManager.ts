import { components } from "@/services/openapi/mycelium-schema";
import { rpcCall } from "./client";

type Tenant = components["schemas"]["Tenant"];
type Tag = components["schemas"]["Tag"];

// ---------------------------------------------------------------------------
// Tenant
// ---------------------------------------------------------------------------

export interface TenantGetParams {
  tenantId: string;
}

export function tenantGet(
  params: TenantGetParams,
  getToken: () => Promise<string>
): Promise<Tenant> {
  return rpcCall<TenantGetParams, Tenant>(
    "tenantManager.tenant.get",
    params,
    getToken
  );
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

export interface AccountsCreateSubscriptionManagerAccountParams {
  tenantId: string;
}

export function accountsCreateSubscriptionManagerAccount(
  params: AccountsCreateSubscriptionManagerAccountParams,
  getToken: () => Promise<string>
): Promise<void> {
  return rpcCall<AccountsCreateSubscriptionManagerAccountParams, void>(
    "tenantManager.accounts.createSubscriptionManagerAccount",
    params,
    getToken
  );
}

export interface AccountsDeleteSubscriptionAccountParams {
  tenantId: string;
  accountId: string;
}

export function accountsDeleteSubscriptionAccount(
  params: AccountsDeleteSubscriptionAccountParams,
  getToken: () => Promise<string>
): Promise<void> {
  return rpcCall<AccountsDeleteSubscriptionAccountParams, void>(
    "tenantManager.accounts.deleteSubscriptionAccount",
    params,
    getToken
  );
}

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export interface TagsCreateParams {
  tenantId: string;
  value: string;
  meta?: Record<string, string> | null;
}

export function tagsCreate(
  params: TagsCreateParams,
  getToken: () => Promise<string>
): Promise<Tag> {
  return rpcCall<TagsCreateParams, Tag>(
    "tenantManager.tags.create",
    params,
    getToken
  );
}

export interface TagsUpdateParams {
  tenantId: string;
  tagId: string;
  value: string;
  meta?: Record<string, string> | null;
}

export function tagsUpdate(
  params: TagsUpdateParams,
  getToken: () => Promise<string>
): Promise<Tag> {
  return rpcCall<TagsUpdateParams, Tag>(
    "tenantManager.tags.update",
    params,
    getToken
  );
}

export interface TagsDeleteParams {
  tenantId: string;
  tagId: string;
}

export function tagsDelete(
  params: TagsDeleteParams,
  getToken: () => Promise<string>
): Promise<void> {
  return rpcCall<TagsDeleteParams, void>(
    "tenantManager.tags.delete",
    params,
    getToken
  );
}
