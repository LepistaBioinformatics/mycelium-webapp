import { components } from "@/services/openapi/mycelium-schema";
import { TenantStatus } from "@/types/TenantStatus";
import { rpcCall } from "./client";

type Account = components["schemas"]["Account"];

type Profile = components["schemas"]["Profile"];
type Tenant = components["schemas"]["Tenant"];
type CreateTokenResponse = components["schemas"]["CreateTokenResponse"];
type PublicConnectionStringInfo =
  components["schemas"]["PublicConnectionStringInfo"];

// ---------------------------------------------------------------------------
// Tenants
// ---------------------------------------------------------------------------

export interface TenantsGetPublicInfoParams {
  tenantId: string;
}

export function tenantsGetPublicInfo(
  params: TenantsGetPublicInfoParams,
  getToken: () => Promise<string>
): Promise<Tenant> {
  return rpcCall<TenantsGetPublicInfoParams, Tenant>(
    "beginners.tenants.getPublicInfo",
    params,
    getToken
  );
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

interface RoleParam {
  name: string;
  permission?: number | null;
}

export interface TokensCreateParams {
  name: string;
  expiration: number;
  tenantId?: string | null;
  serviceAccountId?: string | null;
  roles?: RoleParam[] | null;
}

export function tokensCreate(
  params: TokensCreateParams,
  getToken: () => Promise<string>
): Promise<CreateTokenResponse> {
  return rpcCall<TokensCreateParams, CreateTokenResponse>(
    "beginners.tokens.create",
    params,
    getToken
  );
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

export interface AccountsCreateParams {
  name: string;
}

export function accountsCreate(
  params: AccountsCreateParams,
  getToken: () => Promise<string>
): Promise<void> {
  return rpcCall<AccountsCreateParams, void>(
    "beginners.accounts.create",
    params,
    getToken
  );
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export interface ProfileGetParams {
  withUrl?: boolean | null;
}

export function profileGet(
  params: ProfileGetParams,
  getToken: () => Promise<string>
): Promise<Profile> {
  return rpcCall<ProfileGetParams, Profile>(
    "beginners.profile.get",
    params,
    getToken
  );
}

// ---------------------------------------------------------------------------
// Account (get own)
// ---------------------------------------------------------------------------

export function accountsGet(
  getToken: () => Promise<string>
): Promise<Account | null> {
  return rpcCall<Record<string, never>, Account | null>(
    "beginners.accounts.get",
    {},
    getToken
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export interface MetaParams {
  key: string;
  value: string;
}

export function metaCreate(
  params: MetaParams,
  getToken: () => Promise<string>
): Promise<Record<string, string>> {
  return rpcCall<MetaParams, Record<string, string>>(
    "beginners.meta.create",
    params,
    getToken
  );
}

export function metaUpdate(
  params: MetaParams,
  getToken: () => Promise<string>
): Promise<Record<string, string>> {
  return rpcCall<MetaParams, Record<string, string>>(
    "beginners.meta.update",
    params,
    getToken
  );
}

// ---------------------------------------------------------------------------
// Tokens — list own
// ---------------------------------------------------------------------------

export function tokensListMy(
  getToken: () => Promise<string>
): Promise<PublicConnectionStringInfo[] | null> {
  return rpcCall<Record<string, never>, PublicConnectionStringInfo[] | null>(
    "beginners.tokens.list",
    {},
    getToken
  );
}

export interface TokenActionParams {
  tokenId: number;
}

export function tokensRevoke(
  params: TokenActionParams,
  getToken: () => Promise<string>
): Promise<unknown> {
  return rpcCall<TokenActionParams, unknown>(
    "beginners.tokens.revoke",
    params,
    getToken
  );
}

export function tokensDelete(
  params: TokenActionParams,
  getToken: () => Promise<string>
): Promise<unknown> {
  return rpcCall<TokenActionParams, unknown>(
    "beginners.tokens.delete",
    params,
    getToken
  );
}

// Re-export TenantStatus for convenience
export type { TenantStatus };
