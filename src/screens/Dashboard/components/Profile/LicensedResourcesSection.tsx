import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";
import { RiRobot2Line } from "react-icons/ri";
import PermissionBadge from "@/components/ui/PermissionBadge";
import { buttonStyles } from "@/components/ui/button-styles";
import { BadgeCheck, Clock, KeyRound } from "lucide-react";
import { ActiveTab } from "./active-tab";
import { useTranslation } from "react-i18next";
import { MycRole } from "@/types/MyceliumRole";
import { Link, useNavigate } from "react-router";
import { useMemo, useState } from "react";
import CreateConnectionStringModal from "../CreateConnectionStringModal";
import { MycPermission } from "@/types/MyceliumPermission";
import { GrUserManager } from "react-icons/gr";
import useAccountDetailsLink from "@/hooks/use-account-details-link";

type LicensedResource = components["schemas"]["LicensedResource"];
type Permission = components["schemas"]["Permission"];

interface CustomLicensedResource {
  id: string;
  name: string;
  sysAcc: boolean;
  tenantId: string;
  role: string;
  perm: Permission;
  verified: boolean;
  roles: {
    role: string;
    perm: Permission;
    verified: boolean;
  }[];
}

interface Props {
  licensedResources: LicensedResource[] | null;
}

export default function LicensedResourcesSection({ licensedResources }: Props) {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [accountId, setAccountId] = useState<string | null>(null);

  const [tenantId, setTenantId] = useState<string | null>(null);

  const filteredLicensedResources = useMemo(() => {
    if (!licensedResources) return null;

    const filtered = licensedResources.filter(
      (resource) =>
        resource.accId === accountId && resource.tenantId === tenantId
    );

    if (filtered.length === 0) return null;

    return filtered
      .map((resource) => ({
        role: resource.role,
        permission: resource.perm as MycPermission,
      }))
      .filter(
        (resource, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.role === resource.role && t.permission === resource.permission
          )
      );
  }, [licensedResources, accountId, tenantId]);

  const [
    isCreateConnectionStringModalOpen,
    setIsCreateConnectionStringModalOpen,
  ] = useState(false);

  const handleCloseCreateConnectionStringModal = () => {
    setIsCreateConnectionStringModalOpen(false);
  };

  const handleSuccessCreateConnectionString = () => {
    setIsCreateConnectionStringModalOpen(false);
  };

  const uniqueAccounts: CustomLicensedResource[] | undefined = useMemo(() => {
    return licensedResources
      ?.map((resource) => {
        return {
          id: resource.accId,
          name: resource.accName,
          sysAcc: resource.sysAcc,
          tenantId: resource.tenantId,
          role: resource.role,
          perm: resource.perm,
          verified: resource.verified,
          roles: licensedResources
            ?.filter((r) => r.accId === resource.accId)
            ?.map((r) => {
              return {
                role: r.role,
                perm: r.perm,
                verified: r.verified,
              };
            })
            ?.filter((role, index, self) => self.indexOf(role) === index)
            ?.sort((a, b) => a.role.localeCompare(b.role)),
        };
      })
      ?.filter((accId, index, self) => {
        return self.findIndex((t) => t.id === accId.id) === index;
      });
  }, [licensedResources]);

  const handleOpenCreateConnectionStringModal = (
    accountId: string,
    tenantId: string
  ) => {
    setAccountId(accountId);
    setTenantId(tenantId);
    setIsCreateConnectionStringModalOpen(true);
  };

  const getAccountType = (resource: CustomLicensedResource) => {
    if (resource.sysAcc) {
      return {
        text: t(
          "screens.Dashboard.LicensedResourcesSection.accountType.types.system"
        ),
        Icon: RiRobot2Line,
      };
    }

    if (resource.role === MycRole.TenantManager) {
      return {
        text: t(
          "screens.Dashboard.LicensedResourcesSection.accountType.types.tenantScoped"
        ),
        Icon: GrUserManager,
      };
    }

    if (resource.role === MycRole.SystemManager) {
      return {
        text: t(
          "screens.Dashboard.LicensedResourcesSection.accountType.types.systemScoped"
        ),
        Icon: GrUserManager,
      };
    }

    return {
      text: t(
        "screens.Dashboard.LicensedResourcesSection.accountType.types.subscription"
      ),
      Icon: GrUserManager,
    };
  };

  const accountDetailsLink = useAccountDetailsLink();

  // Accounts open their details on top of the profile; a namespace's
  // management account opens the namespace itself.
  const resourceHref = (resource: CustomLicensedResource) =>
    resource.role === MycRole.TenantManager
      ? `/dashboard/tenants/${resource.tenantId}`
      : accountDetailsLink(resource.id, resource.tenantId);

  if (!licensedResources || licensedResources.length === 0) {
    return (
      <Card padding="sm" width="alwaysFull" height="fit">
        <Card.Header>
          <Typography as="h5" decoration="faded">
            {t("screens.Dashboard.LicensedResourcesSection.title")}
          </Typography>
        </Card.Header>

        <Card.Body width="full">
          <div className="flex flex-col gap-2 py-4">
            <Typography decoration="smooth">
              {t("screens.Dashboard.LicensedResourcesSection.noResources")}
            </Typography>
            <Typography as="small" decoration="smooth" width="xs">
              {t(
                "screens.Dashboard.LicensedResourcesSection.noResourcesDescription"
              )}
            </Typography>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card padding="sm" width="alwaysFull" height="fit">
        <Card.Header>
          <Typography as="h5" decoration="faded">
            {t("screens.Dashboard.LicensedResourcesSection.title")}
          </Typography>
        </Card.Header>

        <Card.Body width="full">
          <ul className="flex flex-col gap-2 w-full">
            {[...(uniqueAccounts ?? [])]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((resource) => {
                const accountType = getAccountType(resource);

                return (
                  <li
                    key={`${resource.tenantId}-${resource.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-xs transition-[box-shadow,border-color] hover:shadow-card hover:border-brand-600/40 dark:hover:border-brand-400/30 cursor-pointer"
                    onClick={() => navigate(resourceHref(resource))}
                  >
                    <div className="flex flex-col gap-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={resourceHref(resource)}
                          onClick={(event) => event.stopPropagation()}
                          title={t(
                            "screens.Dashboard.LicensedResourcesSection.accountName.title",
                            { accName: resource.name }
                          )}
                          className="font-display text-lg font-semibold text-primary dark:text-brand-300 hover:underline truncate rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                          {resource.name}
                        </Link>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground dark:bg-surface-800">
                          <accountType.Icon className="size-3.5" />
                          {accountType.text}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {resource.roles.map((role) => (
                          <span
                            key={`${role.role}-${role.perm}`}
                            title={t(
                              "screens.Dashboard.LicensedResourcesSection.role.title",
                              { role: role.role }
                            )}
                            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 text-sm"
                          >
                            <span className="font-mono text-xs text-foreground">
                              {role.role}
                            </span>
                            <PermissionBadge permission={role.perm} />
                            {role.verified ? (
                              <span className="inline-flex items-center gap-0.5 text-xs text-green-700 dark:text-green-300">
                                <BadgeCheck className="size-3.5" />
                                {t(
                                  "screens.Dashboard.LicensedResourcesSection.verified"
                                )}
                              </span>
                            ) : (
                              <Link
                                to={`/dashboard/profile?tab=${ActiveTab.Invitations}`}
                                onClick={(event) => event.stopPropagation()}
                                className="inline-flex items-center gap-0.5 text-xs text-amber-700 dark:text-amber-300 hover:underline"
                              >
                                <Clock className="size-3.5" />
                                {t(
                                  "screens.Dashboard.LicensedResourcesSection.pending"
                                )}
                              </Link>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      title={t(
                        "screens.Dashboard.LicensedResourcesSection.createConnectionString.description"
                      )}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleOpenCreateConnectionStringModal(
                          resource.id,
                          resource.tenantId
                        );
                      }}
                      className={`${buttonStyles({ intent: "secondary", size: "xs" })} w-fit shrink-0`}
                    >
                      <KeyRound className="size-3.5" />
                      {t(
                        "screens.Dashboard.LicensedResourcesSection.createConnectionString.title"
                      )}
                    </button>
                  </li>
                );
              })}
          </ul>
        </Card.Body>
      </Card>

      {isCreateConnectionStringModalOpen && accountId && (
        <CreateConnectionStringModal
          isOpen={isCreateConnectionStringModalOpen}
          onClose={handleCloseCreateConnectionStringModal}
          onSuccess={handleSuccessCreateConnectionString}
          accountId={accountId}
          accountName={
            uniqueAccounts?.find((account) => account.id === accountId)?.name
          }
          tenantId={tenantId}
          roles={filteredLicensedResources}
        />
      )}
    </>
  );
}
