import { PiSealCheckLight } from "react-icons/pi";
import Card from "@/components/ui/Card";
import PageBody from "@/components/ui/PageBody";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import Divider from "@/components/ui/Divider";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { buildPath } from "@/services/openapi/mycelium-api";
import { useAuth0 } from "@auth0/auth0-react";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import Button from "@/components/ui/Button";

type Profile = components["schemas"]["Profile"];
type Tenant = components["schemas"]["Tenant"];
export default function Profile() {
  const { user, profile, isLoadingUser } = useProfile({ withUrl: false });

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
        <PageBody.Breadcrumb.Item href="/dashboard/profile">
          Profile
        </PageBody.Breadcrumb.Item>
      </PageBody.Breadcrumb>

      <PageBody.Content flex gap={5} padding="md" wrap>
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

        {tenantsOwnership && (
          <Card height="80vh">
            <Card.Header>
              <Typography>Ownership on Tenants</Typography>
            </Card.Header>

            <Card.Body>
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

              {tenantsOwnership?.length > loadingSize && (
                <div className="flex justify-center items-center mt-5">
                  <Button
                    intent="link"
                    rounded
                    disabled={tenantsOwnership.length === loadingSize}
                    size="sm"
                    onClick={() => setLoadingSize(tenantsOwnership.length)}
                  >
                    Load all
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        )}
      </PageBody.Content>
    </PageBody>
  );
}

function TenantOwnership({
  tenantId,
  since,
}: {
  tenantId: string;
  since: string;
}) {
  const { getAccessTokenSilently } = useAuth0();

  const { data, isLoading } = useSWR<Tenant, Error>(
    buildPath(
      "/adm/rs/beginners/tenants/{tenant_id}",
      { path: { tenant_id: tenantId } }
    ),
    async (url: string) => {
      const token = await getAccessTokenSilently();
      return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => data as Tenant);
    }
  );

  return (
    <div key={tenantId}>
      <Typography>
        {isLoading ? "Loading..." : (
          <div className="flex flex-col gap-2 align-middle items-center bg-slate-200 dark:bg-slate-700 bg-opacity-50 backdrop-blur-sm rounded-md p-2">
            <Typography as="span">
              {data?.name}
            </Typography>
            <Typography as="small">
              Since {formatDDMMYY(new Date(since), true)}
            </Typography>
            <Typography as="small">
              {data?.description}
            </Typography>
          </div>
        )}
      </Typography>
    </div>
  );
}

const getTenantsOwnership = (
  tenantsOwnership: Profile["tenantsOwnership"]
): components["schemas"]["TenantOwnership"][] | null => {
  console.log(tenantsOwnership);

  if (tenantsOwnership && "records" in tenantsOwnership) {
    return tenantsOwnership.records;
  }

  return null;
}

const getLicensedResources = (
  licensedResources: Profile["licensedResources"]
): components["schemas"]["LicensedResource"][] | null => {
  console.log(licensedResources);

  if (licensedResources && "records" in licensedResources) {
    return licensedResources.records;
  }

  return null;
}
