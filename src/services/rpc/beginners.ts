import { components } from "@/services/openapi/mycelium-schema";
import { TenantStatus } from "@/types/TenantStatus";
import { rpcCall } from "./client";

type Tenant = components["schemas"]["Tenant"];
type CreateTokenResponse = components["schemas"]["CreateTokenResponse"];

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

// Re-export TenantStatus for convenience
export type { TenantStatus };
