import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";
import { RiRobot2Line } from "react-icons/ri";
import TenantResolver from "./TenantResolver";
import TenantBasicInfo from "./TenantBasicInfo";
import PermissionIcon from "@/components/ui/PermissionIcon";
import MiniBox from "@/components/ui/MiniBox";
import IntroSection from "@/components/ui/IntroSection";
import { useTranslation } from "react-i18next";
import { MycRole } from "@/types/MyceliumRole";
import { Link } from "react-router";
import { useMemo } from "react";

type LicensedResource = components["schemas"]["LicensedResource"];

interface Props {
  licensedResources: LicensedResource[] | null;
}

export default function LicensedResourcesSection({ licensedResources }: Props) {
  const { t } = useTranslation();

  const uniqueAccountIds = useMemo(() => {
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

  return (
    licensedResources?.length && (
      <Card padding="sm" width="alwaysFull" height="adaptive">
        <Card.Header>
          <Typography as="h5" decoration="faded">
            {t("screens.Dashboard.LicensedResourcesSection.title")}
          </Typography>
        </Card.Header>

        <Card.Body width="fit">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 scrollbar w-full">
            {!licensedResources && (
              <div className="flex flex-col gap-2">
                <Typography decoration="smooth">
                  {t("screens.Dashboard.LicensedResourcesSection.noResources")}
                </Typography>
                <Typography as="small" decoration="smooth" width="xs">
                  {t(
                    "screens.Dashboard.LicensedResourcesSection.noResourcesDescription"
                  )}
                </Typography>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 scrollbar w-full">
            {uniqueAccountIds
              ?.sort((a, b) => a.name.localeCompare(b.name))
              ?.map((resource, index) => (
                <MiniBox key={index}>
                  <IntroSection
                    title={t(
                      "screens.Dashboard.LicensedResourcesSection.accountName.title"
                    )}
                    prefixProps={{ nowrap: true }}
                    contentProps={{ truncate: true }}
                    content={
                      <div className="flex items-center gap-2">
                        {resource.sysAcc && (
                          <div>
                            <RiRobot2Line
                              className="text-indigo-500 h-4 w-4 dark:text-lime-500 hover:cursor-help"
                              title={t(
                                "screens.Dashboard.LicensedResourcesSection.accountName.system"
                              )}
                            />
                          </div>
                        )}
                        <Typography
                          truncate
                          width="fit"
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
                              className="text-indigo-500 dark:text-lime-500 hover:underline"
                            >
                              {resource.name}
                            </Link>
                          ) : (
                            <Link
                              to={`/dashboard/tenants/${resource.tenantId}/accounts/?accountId=${resource.id}`}
                              className="text-indigo-500 dark:text-lime-500 hover:underline"
                            >
                              {resource.name}
                            </Link>
                          )}
                        </Typography>
                      </div>
                    }
                    as="h3"
                  >
                    <TenantResolver tenantId={resource.tenantId}>
                      <TenantBasicInfo tenantId={resource.tenantId} />
                    </TenantResolver>

                    {resource.roles.map((role) => (
                      <div
                        key={role.role}
                        className="border-t-[0.5px] border-indigo-100 dark:border-lime-900 p-1"
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
                            className="w-fit text-green-500 dark:text-green-400 bg-green-100 dark:bg-green-500 bg-opacity-50 dark:bg-opacity-20 rounded-full px-2 py-1 mt-1 text-xs border border-green-500 dark:border-green-400 hover:cursor-help"
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
    )
  );
}
