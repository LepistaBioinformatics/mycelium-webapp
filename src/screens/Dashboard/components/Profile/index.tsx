import { PiSealCheckLight } from "react-icons/pi";
import Card from "@/components/ui/Card";
import PageBody from "@/components/ui/PageBody";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import TenantOwnership from "./TenantOwnership";
import PermissionIcon from "@/components/ui/PermissionIcon";

type Profile = components["schemas"]["Profile"];

export default function Profile() {
  const { user, profile, isLoadingUser } = useProfile();

  const [loadingSize, setLoadingSize] = useState(3);

  const tenantsOwnership = useMemo(
    () => getTenantsOwnership(profile?.tenantsOwnership),
    [profile?.tenantsOwnership]
  );

  const licensedResources = useMemo(
    () => getLicensedResources(profile?.licensedResources),
    [profile?.licensedResources]
  );

  return (
    <PageBody padding="md" height="fit">
      <PageBody.Breadcrumb>
        <PageBody.Breadcrumb.Item>
          Control panel
        </PageBody.Breadcrumb.Item>
        <PageBody.Breadcrumb.Item>
          Profile
        </PageBody.Breadcrumb.Item>
      </PageBody.Breadcrumb>

      <PageBody.Content padding="md" container flex wrap gap={3}>
        <Card minHeight="50vh" maxHeight="90vh" padding="sm">
          <Card.Header>
            <Typography as="h6" decoration="smooth">Profile</Typography>
          </Card.Header>

          <Card.Body>
            {isLoadingUser
              ? (
                <Typography>Loading...</Typography>
              ) : (
                <>
                  <Typography as="h2">
                    <div className="flex gap-2 align-middle items-center">
                      <span className="max-w-xs truncate">{user?.name}</span>
                      {profile?.verboseStatus?.toLocaleLowerCase() === "verified"
                        && <PiSealCheckLight className="text-green-300 inline" />}
                    </div>
                  </Typography>
                  <Typography as="span">{user?.email}</Typography>
                </>
              )}
          </Card.Body>

          <Card.Body>
            <div className="flex flex-col gap-4 mb-12">
              <div>
                <Typography as="small">
                  Has privileged roles?
                </Typography>

                <Typography as="h2">
                  {profile?.isManager || profile?.isStaff ? "Yes" : "No"}
                </Typography>
              </div>
            </div>
          </Card.Body>
        </Card>

        {tenantsOwnership && (
          <Card minHeight="50vh" maxHeight="90vh" padding="sm">
            <Card.Header>
              <Typography as="h6" decoration="smooth">Ownership on Tenants</Typography>
            </Card.Header>

            <Card.Body>
              <div className="flex flex-col gap-2">
                {tenantsOwnership
                  ?.sort((a, b) => b.since.localeCompare(a.since))
                  ?.slice(0, loadingSize)
                  ?.map((tenant) => (
                    <TenantOwnership
                      key={tenant.tenant}
                      tenantId={tenant.tenant}
                      since={tenant.since}
                    />
                  ))}
              </div>

              {tenantsOwnership?.length > loadingSize && (
                <div className="flex justify-center items-center mt-5">
                  <Button
                    intent="link"
                    rounded
                    disabled={tenantsOwnership.length === loadingSize}
                    size="sm"
                    onClick={() => setLoadingSize(tenantsOwnership.length)}
                  >
                    <span className="text-sm text-blue-500 dark:text-lime-400">
                      Load all {tenantsOwnership.length}
                    </span>
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        <Card minHeight="50vh" maxHeight="90vh" dashed={!licensedResources} padding="sm">
          <Card.Header>
            <Typography as="h6" decoration="smooth">Licensed resources</Typography>
          </Card.Header>

          <Card.Body>
            {licensedResources
              ? (
                <div className="flex flex-col gap-2">
                  {licensedResources?.map((resource) => (
                    <div key={resource.accName} className="flex flex-col gap-2 max-w-xs bg-gray-50 dark:bg-slate-900 bg-opacity-40 rounded-md p-2 border-2 border-gray-200 dark:border-gray-700">
                      <Typography as="h4" truncate>{resource.accName}</Typography>
                      <div className="flex flex-col gap-2">
                        <Typography as="span" decoration="smooth">
                          Role: {resource.role}
                        </Typography>
                        <Typography as="span" decoration="smooth">
                          <div className="flex gap-2 align-middle items-center">
                            Perm: <PermissionIcon permission={resource.perm} />
                          </div>
                        </Typography>
                        <Typography as="span" decoration="smooth">
                          <div className="flex gap-2 align-middle items-center">
                            System: {resource.sysAcc ? "Yes" : "No"}
                          </div>
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              )
              : (
                <div className="flex flex-col gap-2">
                  <Typography decoration="smooth">
                    No resources to show
                  </Typography>
                  <Typography as="small" decoration="smooth" width="xs">
                    Accounts shared with you will appear here
                  </Typography>
                </div>
              )}
          </Card.Body>
        </Card>
      </PageBody.Content>
    </PageBody>
  );
}

const getTenantsOwnership = (
  tenantsOwnership: Profile["tenantsOwnership"]
): components["schemas"]["TenantOwnership"][] | null => {
  if (tenantsOwnership && "records" in tenantsOwnership) {
    return tenantsOwnership.records;
  }

  return null;
}

const getLicensedResources = (
  licensedResources: Profile["licensedResources"]
): components["schemas"]["LicensedResource"][] | null => {
  if (licensedResources && "records" in licensedResources) {
    return licensedResources.records;
  }

  return null;
}
