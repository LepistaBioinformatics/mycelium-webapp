import { components } from "@/services/openapi/mycelium-schema";
import { MycRole } from "@/types/MyceliumRole";
import getTenantsOwnershipOrNull from "./get-tenant-ownership-or-null";

type Profile = components["schemas"]["Profile"];

/**
 * Whether the profile holds a role broad enough that reachable contact
 * information (name, phone) matters for accountability purposes: staff,
 * manager, a tenant-manager licensed resource, or ownership of any tenant.
 */
export default function isPrivilegedAccount(
  profile: Profile | null | undefined
): boolean {
  if (!profile) return false;

  if (profile.isStaff || profile.isManager) return true;

  if (getTenantsOwnershipOrNull(profile.tenantsOwnership) !== null) {
    return true;
  }

  const licensedResources = profile.licensedResources;

  if (licensedResources && "records" in licensedResources) {
    return licensedResources.records.some((resource) =>
      resource.role.includes(MycRole.TenantManager)
    );
  }

  return false;
}
