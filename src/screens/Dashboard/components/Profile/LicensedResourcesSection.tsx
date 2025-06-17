import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";
import { RiRobot2Line } from "react-icons/ri";
import TenantResolver from "./TenantResolver";
import TenantBasicInfo from "./TenantBasicInfo";
import PermissionIcon from "@/components/ui/PermissionIcon";
import MiniBox from "@/components/ui/MiniBox";
import IntroSection from "@/components/ui/IntroSection";

type LicensedResource = components["schemas"]["LicensedResource"];

interface Props {
  licensedResources: LicensedResource[] | null;
}

export default function LicensedResourcesSection({ licensedResources }: Props) {
  return (
    <Card padding="sm" width="sm" flex1 dashed={!licensedResources}>
      <Card.Header>
        <Typography as="h6" decoration="smooth">
          Accounts witch you have access
        </Typography>
      </Card.Header>

      <Card.Body>
        {!licensedResources && (
          <div className="flex flex-col gap-2">
            <Typography decoration="smooth">No resources to show</Typography>
            <Typography as="small" decoration="smooth" width="xs">
              Accounts shared with you will appear here
            </Typography>
          </div>
        )}

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
                    title="Account name"
                    prefixProps={{ nowrap: true }}
                    contentProps={{ truncate: true }}
                    content={
                      <div className="flex items-center gap-2">
                        {resource.sysAcc && (
                          <div>
                            <RiRobot2Line
                              className="text-blue-500 h-4 w-4 dark:text-lime-500 hover:cursor-help"
                              title="System account"
                            />
                          </div>
                        )}
                        <Typography
                          title={`The account which you have access to: ${resource.accName}`}
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
                      prefix="as"
                      prefixProps={{ nowrap: true }}
                      title={`The role assigned to you: ${resource.role}`}
                    >
                      <span className="whitespace-nowrap">{resource.role}</span>
                    </IntroSection.Item>

                    <IntroSection.Item
                      prefixProps={{ nowrap: true }}
                      prefix="able to"
                      title={`The permission assigned to you: ${resource.perm}`}
                    >
                      <PermissionIcon permission={resource.perm} inline />
                    </IntroSection.Item>

                    {!resource.verified && (
                      <span
                        className="w-fit text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-500 bg-opacity-50 dark:bg-opacity-20 rounded-full px-1 py-0 mt-1 text-xs border border-red-500 dark:border-red-400 hover:cursor-help"
                        title="You not confirmed the invitation to this account"
                      >
                        Unverified
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
