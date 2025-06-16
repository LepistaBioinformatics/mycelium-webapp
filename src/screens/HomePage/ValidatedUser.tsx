import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import { VariantProps } from "class-variance-authority";
import FlowContainer, { flowContainerStyles } from "./FlowContainer";
import { components } from "@/services/openapi/mycelium-schema";
import { useAuth0 } from "@auth0/auth0-react";
import { buildPath } from "@/services/openapi/mycelium-api";
import useSWR from "swr";
import Divider from "@/components/ui/Divider";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import Banner from "@/components/ui/Banner";

type Profile = components["schemas"]["Profile"];

interface Props extends VariantProps<typeof flowContainerStyles> { }

export default function ValidatedUser({ show }: Props) {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  const { data: profile, isLoading: isLoadingProfile } = useSWR(
    isAuthenticated ? buildPath("/adm/rs/beginners/profile") : null,
    async (url) => {
      const token = await getAccessTokenSilently();
      if (!token) throw new Error("Token is required");

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      return response.json() as Promise<Profile>;
    },
    {
      revalidateIfStale: true,
      revalidateOnFocus: true,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      refreshInterval: 1000,
    }
  );

  useEffect(() => {
    if (profile?.accId) {
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    }
  }, [profile?.accId]);

  return (
    <FlowContainer show={show}>
      <Card minHeight="50vh" height="fit" width="6xl">
        {isLoading || isLoadingProfile || !profile?.accId
          ? (
            <Card.Body>
              <Typography>
                We are checking if you have an profile
                <span className="animate-ping inline-block ml-2 h-2 w-2 rounded-full bg-blue-500" />
              </Typography>

              <img
                src="/undraw.co/undraw_file-searching_2ne8.svg"
                alt="Searching for your email address..."
                width={150}
                height={150}
                className="mt-4 mx-auto"
              />
            </Card.Body>
          )
          : (
            <Card.Body>
              <div className="flex flex-col gap-4 mb-12">
                <div className="text-left">
                  <Typography>
                    <span className="text-sm">Logged in as</span><br />
                  </Typography>
                  <Typography as="h1">
                    {user?.name}
                  </Typography>

                  <Typography>
                    {user?.email}
                  </Typography>
                </div>

                <Divider style="partial" />

                <div className="text-left">
                  <Typography as="span">
                    Verified account?
                  </Typography>

                  <Typography as="h2">
                    {profile?.verboseStatus}
                  </Typography>
                </div>

                <div className="text-left">
                  <Typography as="span">
                    Has privileged roles?
                  </Typography>

                  <Typography as="h2">
                    {profile?.isManager || profile?.isStaff ? "Yes" : "No"}
                  </Typography>
                </div>

                <TenantsOwnership tenantsOwnership={profile?.tenantsOwnership} />

                <LicensedResources licensedResources={profile?.licensedResources} />
              </div>

              <Banner title={(
                <>
                  Wait for a moment
                  <span className="animate-ping inline-block ml-2 h-2 w-2 rounded-full bg-blue-500" />
                </>
              )}>
                <div className="flex flex-col gap-4">
                  <Typography>
                    We are redirecting you to the dashboard
                  </Typography>

                  <Typography as="span">
                    If you are not redirected, please click <Link to="/dashboard" className="text-blue-500">here</Link>
                  </Typography>
                </div>
              </Banner>
            </Card.Body>
          )}
      </Card>
    </FlowContainer>
  );
}

function TenantsOwnership({ tenantsOwnership }: { tenantsOwnership: Profile["tenantsOwnership"] }) {
  if (tenantsOwnership && "records" in tenantsOwnership) {
    return (
      <div className="text-left">
        <Typography as="span">
          Tenants ownership
        </Typography>

        <Typography as="h2">
          {tenantsOwnership.records.map((record) => record.tenant).join(", ")}
        </Typography>
      </div>
    );
  }

  return null;
}

function LicensedResources({ licensedResources }: { licensedResources: Profile["licensedResources"] }) {
  if (licensedResources && "records" in licensedResources) {
    return (
      <div className="text-left">
        <Typography as="span">
          Licensed resources
        </Typography>

        <Typography>
          {licensedResources.records.map((record) => record.accName).join(", ")}
        </Typography>
      </div>);
  }

  return null;
}
