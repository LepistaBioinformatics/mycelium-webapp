import { components } from "@/services/openapi/mycelium-schema";
import { rpcCall } from "./client";

type Account = components["schemas"]["Account"];
type UpgradeTargetAccountType =
  components["schemas"]["UpgradeTargetAccountType"];
type DowngradeTargetAccountType =
  components["schemas"]["DowngradeTargetAccountType"];

export interface UpgradePrivilegesParams {
  accountId: string;
  to: UpgradeTargetAccountType;
}

export interface DowngradePrivilegesParams {
  accountId: string;
  to: DowngradeTargetAccountType;
}

export function accountsUpgradePrivileges(
  params: UpgradePrivilegesParams,
  getToken: () => Promise<string>
): Promise<Account> {
  return rpcCall<UpgradePrivilegesParams, Account>(
    "staff.accounts.upgradePrivileges",
    params,
    getToken
  );
}

export function accountsDowngradePrivileges(
  params: DowngradePrivilegesParams,
  getToken: () => Promise<string>
): Promise<Account> {
  return rpcCall<DowngradePrivilegesParams, Account>(
    "staff.accounts.downgradePrivileges",
    params,
    getToken
  );
}
