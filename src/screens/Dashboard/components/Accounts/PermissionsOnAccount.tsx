import PermissionIcon from "@/components/ui/PermissionIcon";
import getLicensedResourcesOrNull from "@/functions/get-licensed-resources-or-null";
import getTenantsOwnershipOrNull from "@/functions/get-tenant-ownership-or-null";
import useProfile from "@/hooks/use-profile";
import { useMemo } from "react";
import { GrInherit } from "react-icons/gr";

interface Props {
  accountId?: string | null;
  tenantId?: string | null;
}

export default function PermissionsOnAccount({ accountId, tenantId }: Props) {
  const { profile } = useProfile();

  /**
   * Get the tenants ownership for the given tenant id
   */
  const filteredTenantsOwnership = useMemo(() => {
    const tenantsOwnership = getTenantsOwnershipOrNull(
      profile?.tenantsOwnership
    );

    if (!tenantsOwnership) return null;

    return tenantsOwnership.filter((tenant) => tenant.tenant === tenantId);
  }, [profile?.tenantsOwnership, tenantId]);

  /**
   * Get the licensed resources for the given account id and tenant id
   */
  const filteredLicensedResources = useMemo(() => {
    const licensedResources = getLicensedResourcesOrNull(
      profile?.licensedResources
    );

    if (!licensedResources) return null;

    const filtered = licensedResources.filter(
      (resource) =>
        resource.accId === accountId && resource.tenantId === tenantId
    );

    if (filtered.length === 0) return null;

    return filtered;
  }, [profile?.licensedResources, accountId, tenantId]);

  return (
    <div className="flex flex-wrap gap-2">
      {filteredLicensedResources?.map((resource, index) => (
        <div key={index}>
          <PermissionIcon permission={resource.perm} inline />
        </div>
      ))}

      {filteredTenantsOwnership && filteredTenantsOwnership?.length > 0 && (
        <div
          className="flex flex-wrap gap-2"
          title="Inherited view read/write permissions from tenant"
        >
          <GrInherit className="mt-1 text-green-500" />
        </div>
      )}
    </div>
  );
}
