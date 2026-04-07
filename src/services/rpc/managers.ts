import { components } from "@/services/openapi/mycelium-schema";
import PaginatedRecords from "@/types/PaginatedRecords";
import { rpcCall } from "./client";

type Tenant = components["schemas"]["Tenant"];
type Account = components["schemas"]["Account"];

// ---------------------------------------------------------------------------
// Tenants
// ---------------------------------------------------------------------------

export interface TenantsListParams {
  name?: string;
  owner?: string;
  metadata?: string;
  tag?: string;
  pageSize?: number;
  skip?: number;
}

export function tenantsList(
  params: TenantsListParams,
  getToken: () => Promise<string>
): Promise<PaginatedRecords<Tenant>> {
  return rpcCall<TenantsListParams, PaginatedRecords<Tenant>>(
    "managers.tenants.list",
    params,
    getToken
  );
}

export interface TenantsCreateParams {
  name: string;
  description?: string | null;
  ownerId: string;
}

export function tenantsCreate(
  params: TenantsCreateParams,
  getToken: () => Promise<string>
): Promise<Tenant> {
  return rpcCall<TenantsCreateParams, Tenant>(
    "managers.tenants.create",
    params,
    getToken
  );
}

export interface TenantsDeleteParams {
  id: string;
}

export function tenantsDelete(
  params: TenantsDeleteParams,
  getToken: () => Promise<string>
): Promise<void> {
  return rpcCall<TenantsDeleteParams, void>(
    "managers.tenants.delete",
    params,
    getToken
  );
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

export interface AccountsCreateSystemAccountParams {
  name: string;
  actor: string;
}

export function accountsCreateSystemAccount(
  params: AccountsCreateSystemAccountParams,
  getToken: () => Promise<string>
): Promise<Account> {
  return rpcCall<AccountsCreateSystemAccountParams, Account>(
    "managers.accounts.createSystemAccount",
    params,
    getToken
  );
}

// ---------------------------------------------------------------------------
// Guest Roles
// ---------------------------------------------------------------------------

export function guestRolesCreateSystemRoles(
  getToken: () => Promise<string>
): Promise<void> {
  return rpcCall<Record<string, never>, void>(
    "managers.guestRoles.createSystemRoles",
    {},
    getToken
  );
}
