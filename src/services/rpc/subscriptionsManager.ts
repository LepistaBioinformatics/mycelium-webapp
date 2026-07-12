import { components } from "@/services/openapi/mycelium-schema";
import PaginatedRecords from "@/types/PaginatedRecords";
import { rpcBatch, rpcCall } from "./client";

type Account = components["schemas"]["Account"];
type GuestRole = components["schemas"]["GuestRole"];
type GuestUser = components["schemas"]["GuestUser"];
type LicensedResource = components["schemas"]["LicensedResource"];
type PaginatedRecordGuestUser =
  components["schemas"]["PaginatedRecord_GuestUser"];

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

export interface AccountsListParams {
  tenantId?: string;
  term?: string;
  tagValue?: string;
  accountType?: string;
  isOwnerActive?: boolean;
  status?: string;
  actor?: string;
  roleName?: string;
  readRoleId?: string;
  writeRoleId?: string;
  pageSize?: number;
  skip?: number;
}

export function accountsList(
  params: AccountsListParams,
  getToken: () => Promise<string>
): Promise<PaginatedRecords<Account>> {
  return rpcCall<AccountsListParams, PaginatedRecords<Account>>(
    "subscriptionsManager.accounts.list",
    params,
    getToken
  );
}

// The gateway's `subscriptionsManager.accounts.list` accepts a single
// `accountType` per call (no "all types" option) — see
// core/use_cases/.../list_accounts_by_type.rs. To show every allowed type in
// one list, fire one batched request per type and merge client-side. Since
// each type is paginated independently server-side, the merged `count`/page
// are best-effort (sorted by createdAt, sliced to pageSize) rather than a
// true global pagination.
export async function accountsListMerged(
  accountTypes: string[],
  params: AccountsListParams,
  getToken: () => Promise<string>
): Promise<PaginatedRecords<Account>> {
  const requests = accountTypes.map((accountType, id) => ({
    method: "subscriptionsManager.accounts.list",
    params: { ...params, accountType },
    id,
  }));

  const results = await rpcBatch(requests, getToken);

  const records: Account[] = [];
  let count = 0;

  for (const result of results) {
    if ("error" in result) continue;
    const page = result.result as PaginatedRecords<Account>;
    records.push(...(page.records ?? []));
    count += page.count ?? 0;
  }

  records.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const pageSize = params.pageSize ?? records.length;

  return {
    records: records.slice(0, pageSize),
    count,
    size: pageSize,
    skip: params.skip ?? 0,
  };
}

export interface AccountsGetParams {
  tenantId?: string;
  accountId: string;
}

export function accountsGet(
  params: AccountsGetParams,
  getToken: () => Promise<string>
): Promise<Account> {
  return rpcCall<AccountsGetParams, Account>(
    "subscriptionsManager.accounts.get",
    params,
    getToken
  );
}

export interface AccountsCreateSubscriptionAccountParams {
  tenantId: string;
  name: string;
}

export function accountsCreateSubscriptionAccount(
  params: AccountsCreateSubscriptionAccountParams,
  getToken: () => Promise<string>
): Promise<Account> {
  return rpcCall<AccountsCreateSubscriptionAccountParams, Account>(
    "subscriptionsManager.accounts.createSubscriptionAccount",
    params,
    getToken
  );
}

// ---------------------------------------------------------------------------
// Guest roles
// ---------------------------------------------------------------------------

export interface GuestRolesListParams {
  tenantId?: string;
  name?: string;
  slug?: string;
  system?: boolean;
  pageSize?: number;
  skip?: number;
}

export async function guestRolesList(
  params: GuestRolesListParams,
  getToken: () => Promise<string>
): Promise<GuestRole[]> {
  const result = await rpcCall<
    GuestRolesListParams,
    GuestRole[] | PaginatedRecords<GuestRole>
  >("subscriptionsManager.guestRoles.list", params, getToken);

  if (Array.isArray(result)) return result;
  return result.records;
}

export interface GuestRolesGetParams {
  tenantId?: string;
  id: string;
}

export function guestRolesGet(
  params: GuestRolesGetParams,
  getToken: () => Promise<string>
): Promise<GuestRole> {
  return rpcCall<GuestRolesGetParams, GuestRole>(
    "subscriptionsManager.guestRoles.get",
    params,
    getToken
  );
}

// ---------------------------------------------------------------------------
// Guests
// ---------------------------------------------------------------------------

export interface GuestsListLicensedAccountsOfEmailParams {
  tenantId: string;
  email: string;
  roles?: Array<{ name: string; permission?: number }>;
  wasVerified?: boolean;
}

export function guestsListLicensedAccountsOfEmail(
  params: GuestsListLicensedAccountsOfEmailParams,
  getToken: () => Promise<string>
): Promise<LicensedResource[]> {
  return rpcCall<GuestsListLicensedAccountsOfEmailParams, LicensedResource[]>(
    "subscriptionsManager.guests.listLicensedAccountsOfEmail",
    params,
    getToken
  );
}

export interface GuestsListGuestOnSubscriptionAccountParams {
  tenantId: string;
  accountId: string;
  pageSize?: number;
  skip?: number;
}

export function guestsListGuestOnSubscriptionAccount(
  params: GuestsListGuestOnSubscriptionAccountParams,
  getToken: () => Promise<string>
): Promise<PaginatedRecordGuestUser> {
  return rpcCall<
    GuestsListGuestOnSubscriptionAccountParams,
    PaginatedRecordGuestUser
  >(
    "subscriptionsManager.guests.listGuestOnSubscriptionAccount",
    params,
    getToken
  );
}

export interface GuestsGuestUserToSubscriptionAccountParams {
  tenantId: string;
  accountId: string;
  roleId: string;
  email: string;
}

export function guestsGuestUserToSubscriptionAccount(
  params: GuestsGuestUserToSubscriptionAccountParams,
  getToken: () => Promise<string>
): Promise<GuestUser> {
  return rpcCall<GuestsGuestUserToSubscriptionAccountParams, GuestUser>(
    "subscriptionsManager.guests.guestUserToSubscriptionAccount",
    params,
    getToken
  );
}

export interface GuestsRevokeUserGuestToSubscriptionAccountParams {
  tenantId: string;
  accountId: string;
  roleId: string;
  email: string;
}

export function guestsRevokeUserGuestToSubscriptionAccount(
  params: GuestsRevokeUserGuestToSubscriptionAccountParams,
  getToken: () => Promise<string>
): Promise<void> {
  return rpcCall<GuestsRevokeUserGuestToSubscriptionAccountParams, void>(
    "subscriptionsManager.guests.revokeUserGuestToSubscriptionAccount",
    params,
    getToken
  );
}
