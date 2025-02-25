import { PiSealCheckLight } from "react-icons/pi";
import Card from "@/components/ui/Card";
import PageBody from "@/components/ui/PageBody";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import Divider from "@/components/ui/Divider";
import { useMemo } from "react";

type Profile = components["schemas"]["Profile"];

export default function Profile() {
  const { user, profile, isLoadingUser } = useProfile();

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
        <PageBody.Breadcrumb.Item href="/dashboard/profile">
          Profile
        </PageBody.Breadcrumb.Item>
      </PageBody.Breadcrumb>

      <PageBody.Content flex gap={5} padding="md">
        <Card height="max">
          <Card.Header>
            <Typography>Profile</Typography>
            {isLoadingUser
              ? (
                <Typography>Loading...</Typography>
              ) : (
                <>
                  <Typography as="h2">
                    <div className="flex gap-4 align-middle items-center">
                      {user?.name}
                      {profile?.verboseStatus?.toLocaleLowerCase() === "verified"
                        && <PiSealCheckLight className="text-green-300 inline" />}
                    </div>
                  </Typography>
                  <Typography as="span">{user?.email}</Typography>
                </>
              )}
          </Card.Header>

          <Divider style="partial" />

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
        </Card>

        {tenantsOwnership && (
          <Card height="max">
            <Card.Header>
              <Typography>Working on accounts</Typography>
            </Card.Header>

            <Card.Body>
              {tenantsOwnership.map((tenant) => (
                <div key={tenant.tenant}>
                  <Typography>{tenant.tenant}</Typography>
                </div>
              ))}
            </Card.Body>
          </Card>
        )}

        <Card height="max" dashed={!licensedResources}>
          <Card.Header>
            <Typography>Licensed resources</Typography>
          </Card.Header>

          <Card.Body>
            {licensedResources
              ? (
                licensedResources?.map((resource) => (
                  <div key={resource.accName}>
                    <Typography>{resource.accName}</Typography>
                  </div>
                ))
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
