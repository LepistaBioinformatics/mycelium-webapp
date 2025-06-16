import PageBody from "@/components/ui/PageBody";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import { useMemo } from "react";
import { RiDashboardFill } from "react-icons/ri";
import CardsSection from "../../../../components/ui/CardsSection";
import getTenantsOwnershipOrNull from "@/functions/get-tenant-ownership-or-null";
import getLicensedResourcesOrNull from "@/functions/get-licensed-resources-or-null";
import PermissionsDetails from "./PermissionsDetails";
import ControlPanelBreadcrumbItem from "../ControlPanelBreadcrumbItem";
import TenantOwnershipSection from "./TenantOwnershipSection";
import LicensedResourcesSection from "./LicensedResourcesSection";
import { GiWizardStaff } from "react-icons/gi";
import { GrUserAdmin } from "react-icons/gr";
import IntroSection from "@/components/ui/IntroSection";

type Profile = components["schemas"]["Profile"];

export default function Profile() {
  const { user, profile, isLoadingUser } = useProfile();

  const tenantsOwnership = useMemo(
    () => getTenantsOwnershipOrNull(profile?.tenantsOwnership),
    [profile?.tenantsOwnership]
  );

  const licensedResources = useMemo(
    () => getLicensedResourcesOrNull(profile?.licensedResources),
    [profile?.licensedResources]
  );

  return (
    <PageBody padding="md" height="fit">
      <PageBody.Breadcrumb>
        <ControlPanelBreadcrumbItem />
        <PageBody.Breadcrumb.Item icon={RiDashboardFill}>
          Profile
        </PageBody.Breadcrumb.Item>
      </PageBody.Breadcrumb>

      <PageBody.Content padding="md" container flex="col" gap={12}>
        <CardsSection>
          <CardsSection.Header>
            {isLoadingUser ? (
              <Typography>Loading...</Typography>
            ) : (
              <IntroSection
                prefix="You are"
                content={
                  <Typography as="h1" title="You are logged in as">
                    <div className="flex items-center gap-3">
                      <span>{user?.name}</span>
                      {profile?.isStaff && (
                        <GiWizardStaff
                          className="inline text-blue-500 dark:text-lime-500 hover:cursor-help p-0.5"
                          title="Staff user"
                        />
                      )}
                      {profile?.isManager && (
                        <GrUserAdmin
                          className="inline text-blue-500 dark:text-lime-500 hover:cursor-help p-0.5"
                          title="Manager user"
                        />
                      )}
                    </div>
                  </Typography>
                }
                as="div"
              >
                <IntroSection.Item prefix="with email" title="Your email">
                  {user?.email}
                </IntroSection.Item>
              </IntroSection>
            )}
          </CardsSection.Header>

          <CardsSection.Body>
            <div className="flex flex-col md:flex-row md:flex-wrap gap-3">
              <TenantOwnershipSection tenantsOwnership={tenantsOwnership} />
              <LicensedResourcesSection licensedResources={licensedResources} />
            </div>
          </CardsSection.Body>
        </CardsSection>

        {licensedResources && profile && (
          <PermissionsDetails profile={profile} />
        )}
      </PageBody.Content>
    </PageBody>
  );
}
