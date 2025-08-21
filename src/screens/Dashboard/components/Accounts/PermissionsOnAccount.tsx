import PermissionIcon from "@/components/ui/PermissionIcon";
import getLicensedResourcesOrNull from "@/functions/get-licensed-resources-or-null";
import getTenantsOwnershipOrNull from "@/functions/get-tenant-ownership-or-null";
import useProfile from "@/hooks/use-profile";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { GrInherit } from "react-icons/gr";
import { IoMdMore } from "react-icons/io";

interface Props {
  accountId?: string | null;
  tenantId?: string | null;
}

export default function PermissionsOnAccount({ accountId, tenantId }: Props) {
  const { t } = useTranslation();

  const { profile } = useProfile();

  /**
   * Get the tenants ownership for the given tenant id
   */
  const filteredTenantsOwnership = useMemo(() => {
    const tenantsOwnership = getTenantsOwnershipOrNull(
      profile?.tenantsOwnership
    );

    if (!tenantsOwnership) return null;

    return tenantsOwnership.filter((tenant) => tenant.id === tenantId);
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
    <div className="flex flex-wrap items-center gap-2">
      {filteredTenantsOwnership && filteredTenantsOwnership?.length > 0 && (
        <div
          className="flex items-center gap-3 border-2 border-dashed border-indigo-500 dark:border-lime-500 rounded-lg px-3 py-1"
          title={t(
            "screens.Dashboard.Accounts.PermissionsOnAccount.inherited.title"
          )}
        >
          <span className="text-sm">
            {t(
              "screens.Dashboard.Accounts.PermissionsOnAccount.inherited.value"
            )}
          </span>
          <GrInherit className="my-1 text-green-500 text-xl" />
        </div>
      )}

      {filteredLicensedResources
        ?.sort(
          (a, b) => a.role.localeCompare(b.role) || a.perm.localeCompare(b.perm)
        )
        ?.map((resource, index) => (
          <div
            key={index}
            className="flex items-center gap-3 border border-indigo-500 dark:border-lime-500 rounded-lg pl-3 pr-1 py-1 group"
          >
            <span>{resource.role}</span>
            <span className="sm:block sm:group-hover:hidden transition-all duration-500">
              <PermissionIcon permission={resource.perm} inline />
            </span>
            <IoMdMore className="text-2xl sm:hidden sm:group-hover:block transition-all duration-500 mx-1 text-indigo-500 dark:text-lime-500" />
          </div>
        ))}
    </div>
  );
}
