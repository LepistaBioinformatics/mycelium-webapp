import { components } from "@/services/openapi/mycelium-schema";

type Account = components["schemas"]["Account"];

/**
 * How to show an account's name. Service accounts are created by the gateway
 * with path-like names (`tid/<id>/manager`, `tid/<id>/role/<slug>`), so they
 * are shown by what they are, not by that name.
 */
export type AccountNameDescription =
  | { kind: "regular"; name: string }
  | { kind: "tenantManager"; rawName: string }
  | { kind: "role"; role: string; rawName: string }
  | { kind: "actor"; actor: string; rawName: string }
  | { kind: "system"; name: string };

/** "subscriptions-manager" / "subscriptionsManager" → "Subscriptions manager" */
export function humanizeSlug(value: string): string {
  const spaced = value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim()
    .toLowerCase();

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function describeAccountName(account: Account): AccountNameDescription {
  const rawName = account.name || account.id?.slice(0, 8) || "";
  const accountType = account.accountType;

  if (typeof accountType === "object" && accountType !== null) {
    if ("tenantManager" in accountType) {
      return { kind: "tenantManager", rawName };
    }

    if ("roleAssociated" in accountType) {
      return {
        kind: "role",
        role: humanizeSlug(accountType.roleAssociated.roleName),
        rawName,
      };
    }

    if ("actorAssociated" in accountType) {
      return {
        kind: "actor",
        actor: humanizeSlug(String(accountType.actorAssociated.actor)),
        rawName,
      };
    }
  }

  if (account.isSystemAccount) return { kind: "system", name: rawName };

  return { kind: "regular", name: rawName };
}
