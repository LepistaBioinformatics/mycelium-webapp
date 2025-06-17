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

type LicensedResource = components["schemas"]["LicensedResource"];

interface Props {
  licensedResources: LicensedResource[] | null;
}

export default function LicensedResourcesSection({ licensedResources }: Props) {
  const { t } = useTranslation();

  return (
    <Card padding="sm" width="full" dashed={!licensedResources}>
      <Card.Header>
        <Typography as="h3" decoration="smooth">
          {t("Dashboard.LicensedResourcesSection.title")}
        </Typography>
      </Card.Header>

      <Card.Body>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 scrollbar w-full">
          {!licensedResources && (
            <div className="flex flex-col gap-2">
              <Typography decoration="smooth">
                {t("Dashboard.LicensedResourcesSection.noResources")}
              </Typography>
              <Typography as="small" decoration="smooth" width="xs">
                {t("Dashboard.LicensedResourcesSection.noResourcesDescription")}
              </Typography>
            </div>
          )}
        </div>

        {licensedResources && (
          <div className="flex flex-col gap-2 scrollbar">
            {licensedResources
              ?.sort(
                (a, b) =>
                  (a.sysAcc ? -1 : 1) ||
                  a.accName.localeCompare(b.accName) ||
                  b.perm.localeCompare(a.perm)
              )
              ?.map((resource, index) => (
                <MiniBox key={index}>
                  <IntroSection
                    title={t(
                      "Dashboard.LicensedResourcesSection.accountName.title"
                    )}
                    prefixProps={{ nowrap: true }}
                    contentProps={{ truncate: true }}
                    content={
                      <div className="flex items-center gap-2">
                        {resource.sysAcc && (
                          <div>
                            <RiRobot2Line
                              className="text-blue-500 h-4 w-4 dark:text-lime-500 hover:cursor-help"
                              title={t(
                                "Dashboard.LicensedResourcesSection.accountName.system"
                              )}
                            />
                          </div>
                        )}
                        <Typography
                          truncate
                          width="fit"
                          title={t(
                            "Dashboard.LicensedResourcesSection.accountName.title",
                            {
                              accName: resource.accName,
                            }
                          )}
                        >
                          {resource.accName}
                        </Typography>
                      </div>
                    }
                    as="h3"
                  >
                    <TenantResolver tenantId={resource.tenantId}>
                      <TenantBasicInfo tenantId={resource.tenantId} />
                    </TenantResolver>

                    <IntroSection.Item
                      prefix={t(
                        "Dashboard.LicensedResourcesSection.role.prefix"
                      )}
                      prefixProps={{ nowrap: true }}
                      title={t(
                        "Dashboard.LicensedResourcesSection.role.title",
                        {
                          role: resource.role,
                        }
                      )}
                    >
                      <span className="whitespace-nowrap">{resource.role}</span>
                    </IntroSection.Item>

                    <IntroSection.Item
                      prefixProps={{ nowrap: true }}
                      prefix={t(
                        "Dashboard.LicensedResourcesSection.permission.prefix"
                      )}
                      title={t(
                        "Dashboard.LicensedResourcesSection.permission.title",
                        {
                          perm: resource.perm,
                        }
                      )}
                    >
                      <PermissionIcon permission={resource.perm} inline />
                    </IntroSection.Item>

                    {!resource.verified && (
                      <span
                        className="w-fit text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-500 bg-opacity-50 dark:bg-opacity-20 rounded-full px-1 py-0 mt-1 text-xs border border-red-500 dark:border-red-400 hover:cursor-help"
                        title="You not confirmed the invitation to this account"
                      >
                        {t("Dashboard.LicensedResourcesSection.unverified")}
                      </span>
                    )}
                  </IntroSection>
                </MiniBox>
              ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
