import { components } from "@/services/openapi/mycelium-schema";
import { MycPermission } from "@/types/MyceliumPermission";

type LicensedResource = components["schemas"]["LicensedResource"];

export interface PendingInvitation {
  key: string;
  accountId: string;
  accountName: string;
  tenantId: string;
  role: string;
  permission: MycPermission;
}

export function invitationKey(
  accountId: string,
  role: string,
  permission: string
): string {
  return `${accountId}:${role}:${permission}`;
}

/**
 * Invitations the user has not accepted yet: the unverified licenses of the
 * profile, one per (account, role, permission), minus the ones accepted in
 * this session (the gateway may still serve a cached profile listing them).
 */
export default function listPendingInvitations(
  licensedResources: LicensedResource[] | null | undefined,
  accepted: ReadonlySet<string> = new Set()
): PendingInvitation[] {
  const seen = new Map<string, PendingInvitation>();

  for (const license of licensedResources ?? []) {
    if (license.verified) continue;

    const key = invitationKey(license.accId, license.role, license.perm);
    if (seen.has(key) || accepted.has(key)) continue;

    seen.set(key, {
      key,
      accountId: license.accId,
      accountName: license.accName,
      tenantId: license.tenantId,
      role: license.role,
      permission: license.perm as MycPermission,
    });
  }

  return [...seen.values()].sort((a, b) =>
    a.accountName.localeCompare(b.accountName)
  );
}
