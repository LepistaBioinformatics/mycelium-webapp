import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { TbSortDescending2Filled } from "react-icons/tb";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";
import { RiRobot2Line } from "react-icons/ri";
import TenantBasicInfo from "./TenantBasicInfo";
import PermissionIcon from "@/components/ui/PermissionIcon";
import MiniBox from "@/components/ui/MiniBox";
import IntroSection from "@/components/ui/IntroSection";
import { useTranslation } from "react-i18next";
import { MycRole } from "@/types/MyceliumRole";
import { Link } from "react-router";
import { useMemo, useState } from "react";
import CreateConnectionStringModal from "../CreateConnectionStringModal";
import { MycPermission } from "@/types/MyceliumPermission";
import Button from "@/components/ui/Button";
import { FaKey } from "react-icons/fa";
import { GrUserManager } from "react-icons/gr";

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

enum SortBy {
  Name = "name",
  Tenant = "tenant",
}

interface Props {
  licensedResources: LicensedResource[] | null;
}

export default function LicensedResourcesSection({ licensedResources }: Props) {
  const { t } = useTranslation();

  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Name);

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

  const HeaderHeader = ({ resource }: { resource: CustomLicensedResource }) => {
    return (
      <div className="flex items-center gap-2">
        <Typography
          truncate
          width="fit"
          as="h5"
          decoration="bold"
          title={t(
            "screens.Dashboard.LicensedResourcesSection.accountName.title",
            {
              accName: resource.name,
            }
          )}
        >
          {resource.role === MycRole.TenantManager ? (
            <Link
              to={`/dashboard/tenants/${resource.tenantId}`}
              className="text-brand-violet-500 dark:text-brand-violet-500 hover:underline"
            >
              {resource.name}
            </Link>
          ) : (
            <Link
              to={`/dashboard/tenants/${resource.tenantId}/accounts/?accountId=${resource.id}`}
              className="text-brand-violet-500 dark:text-brand-violet-500 hover:underline"
            >
              {resource.name}
            </Link>
          )}
        </Typography>
      </div>
    );
  };

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
            <div className="hidden sm:block">
              <div className="overflow-x-auto scrollbar">
                <Table
                  striped
                  theme={{
                    root: {
                      base: "w-full text-left text-sm text-zinc-500 dark:text-zinc-400",
                    },
                    head: {
                      cell: {
                        base: "bg-zinc-50 px-6 py-3 group-first/head:first:rounded-tl-lg group-first/head:last:rounded-tr-lg dark:bg-zinc-700",
                      },
                    },
                    body: {
                      base: "bg-zinc-50 dark:bg-zinc-700",
                      cell: {
                        base: "bg-zinc-50 dark:bg-zinc-800 group-hover/row:bg-zinc-100 dark:group-hover/row:bg-zinc-900 px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg",
                      },
                    },
                    row: {
                      base: "group/row bg-transparent",
                      hovered: "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                      striped:
                        "odd:bg-white even:bg-zinc-50 odd:dark:bg-zinc-800 even:dark:bg-zinc-700",
                    },
                  }}
                >
                  <TableHead>
                    <TableHeadCell>
                      <div className="flex items-center gap-3 group/sort">
                        <TbSortDescending2Filled
                          size={16}
                          title="Sort by name"
                          className="inline-block group-hover/sort:text-brand-violet-500 dark:group-hover/sort:text-brand-violet-500 cursor-pointer"
                          onClick={() => setSortBy(SortBy.Name)}
                        />
                        <span>
                          {t(
                            "screens.Dashboard.LicensedResourcesSection.accountName.title"
                          )}
                        </span>
                      </div>
                    </TableHeadCell>
                    <TableHeadCell>
                      {t(
                        "screens.Dashboard.LicensedResourcesSection.accountType.title"
                      )}
                    </TableHeadCell>
                    <TableHeadCell>
                      {t(
                        "screens.Dashboard.LicensedResourcesSection.role.prefix"
                      )}
                    </TableHeadCell>
                    <TableHeadCell
                      className="cursor-help"
                      title={t(
                        "screens.Dashboard.LicensedResourcesSection.createConnectionString.description"
                      )}
                    >
                      {t(
                        "screens.Dashboard.LicensedResourcesSection.createConnectionString.title"
                      )}
                    </TableHeadCell>
                  </TableHead>
                  <TableBody className="divide-y">
                    {uniqueAccounts
                      ?.sort((a, b) => {
                        if (sortBy === SortBy.Name) {
                          return a.name.localeCompare(b.name);
                        }

                        if (sortBy === SortBy.Tenant) {
                          return a.tenantId.localeCompare(b.tenantId);
                        }

                        return 0;
                      })
                      ?.map((resource, index) => {
                        const accountType = getAccountType(resource);

                        return (
                          <TableRow
                            key={index}
                            className="bg-white dark:border-zinc-700 dark:bg-zinc-800"
                          >
                            <TableCell>
                              <HeaderHeader resource={resource} />
                            </TableCell>
                            <TableCell>
                              <accountType.Icon
                                className="cursor-help text-brand-violet-500 dark:text-brand-violet-500 text-lg"
                                title={accountType.text}
                              />
                            </TableCell>
                            <TableCell>
                              {resource.roles.map((role, index) => (
                                <div
                                  key={index + role.role}
                                  className="whitespace-nowrap"
                                >
                                  <span>{role.role}</span>
                                  <PermissionIcon
                                    permission={role.perm}
                                    inline
                                  />
                                </div>
                              ))}
                            </TableCell>
                            <TableCell
                              className="text-right"
                              title={t(
                                "screens.Dashboard.LicensedResourcesSection.createConnectionString.title"
                              )}
                            >
                              <Button
                               
                                intent="link"
                                center
                                onClick={() =>
                                  handleOpenCreateConnectionStringModal(
                                    resource.id,
                                    resource.tenantId
                                  )
                                }
                              >
                                <FaKey className="inline-block" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full block sm:hidden">
              {uniqueAccounts
                ?.sort((a, b) => a.name.localeCompare(b.name))
                ?.map((resource, index) => (
                  <MiniBox key={index} width="full">
                    <IntroSection
                      title={t(
                        "screens.Dashboard.LicensedResourcesSection.accountName.title"
                      )}
                      prefixProps={{ nowrap: true }}
                      contentProps={{ truncate: true }}
                      content={<HeaderHeader resource={resource} />}
                      as="h3"
                    >
                      <TenantBasicInfo
                        tenantId={resource.tenantId}
                        tenantName={resource.name}
                      />

                      {resource.roles.map((role, index) => (
                        <div
                          key={index + role.role}
                          className="border-t-[0.5px] border-brand-violet-100 dark:border-brand-violet-700 p-1"
                        >
                          <IntroSection.Item
                            prefix={t(
                              "screens.Dashboard.LicensedResourcesSection.role.prefix"
                            )}
                            prefixProps={{ nowrap: true }}
                            title={t(
                              "screens.Dashboard.LicensedResourcesSection.role.title",
                              {
                                role: role.role,
                              }
                            )}
                          >
                            <span className="whitespace-nowrap group/clip flex items-center gap-1">
                              {role.role}
                              <PermissionIcon permission={role.perm} inline />
                            </span>
                          </IntroSection.Item>

                          {role.verified && (
                            <span
                              className="w-fit text-green-500 dark:text-green-400 bg-green-100 dark:bg-green-500 bg-opacity-50 dark:bg-opacity-20 px-2 py-1 mt-1 text-xs border border-green-500 dark:border-green-400 hover:cursor-help"
                              title="You have confirmed the invitation to this account"
                            >
                              {t(
                                "screens.Dashboard.LicensedResourcesSection.verified"
                              )}
                            </span>
                          )}
                        </div>
                      ))}
                    </IntroSection>
                  </MiniBox>
                ))}
            </div>
          </Card.Body>
        </Card>

      {isCreateConnectionStringModalOpen && accountId && (
        <CreateConnectionStringModal
          isOpen={isCreateConnectionStringModalOpen}
          onClose={handleCloseCreateConnectionStringModal}
          onSuccess={handleSuccessCreateConnectionString}
          accountId={accountId}
          tenantId={tenantId}
          roles={filteredLicensedResources}
        />
      )}
    </>
  );
}
