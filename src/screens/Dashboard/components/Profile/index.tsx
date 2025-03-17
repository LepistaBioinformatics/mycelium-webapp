import { GrUserAdmin } from "react-icons/gr";
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
import { RiRobot2Line } from "react-icons/ri";
import CardsSection from "./CardsSection";
import { GiWizardStaff } from "react-icons/gi";
import AboutCard from "./AboutCard";

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

      <PageBody.Content padding="md" container flex wrap gap={12}>
        <CardsSection>
          <CardsSection.Header>
            <Typography
              as="h6"
              decoration="smooth"
              title="Here you can find important information about your profile and your permissions"
            >
              Important things
            </Typography>
          </CardsSection.Header>

          <CardsSection.Body>
            <Card minHeight="50vh" maxHeight="90vh" padding="sm" width="full">
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
                <div className="flex flex-col gap-2 justify-around mb-12">
                  <div>
                    <Typography as="small">
                      Manager Privileges?
                    </Typography>

                    <Typography as="h2">
                      {profile?.isManager ? "Yes" : "No"}
                    </Typography>
                  </div>

                  <div>
                    <Typography as="small">
                      Staff Privileges?
                    </Typography>

                    <Typography as="h2">
                      {profile?.isStaff ? "Yes" : "No"}
                    </Typography>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {tenantsOwnership && (
              <Card minHeight="50vh" maxHeight="90vh" padding="sm" width="full">
                <Card.Header>
                  <Typography as="h6" decoration="smooth">Ownership on Tenants</Typography>
                </Card.Header>

                <Card.Body>
                  <div className="flex flex-wrap scrollbar">
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

            <Card minHeight="50vh" maxHeight="90vh" dashed={!licensedResources} padding="sm" width="full">
              <Card.Header>
                <Typography as="h6" decoration="smooth">Accounts witch you have access</Typography>
              </Card.Header>

              <Card.Body>
                {licensedResources
                  ? (
                    <div className="flex flex-wrap gap-2 scrollbar">
                      {licensedResources
                        ?.sort((a, b) => (a.sysAcc ? -1 : 1) || a.accName.localeCompare(b.accName) || b.perm.localeCompare(a.perm))
                        ?.map((resource, index) => (
                          <div key={index} className="flex flex-col gap-0 bg-blue-50 dark:bg-slate-900 bg-opacity-50 dark:bg-opacity-50 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 w-full">
                            <Typography as="h3" title="The account which you have access to">
                              <div className="flex items-center gap-2">
                                {resource.sysAcc && <RiRobot2Line className="text-blue-500 dark:text-lime-500" title="System account" />}
                                {resource.accName}
                              </div>
                            </Typography>
                            <div className="flex items-center gap-2">
                              <Typography decoration="smooth">as</Typography>
                              <Typography as="h4" title="The role assigned to you" nowrap>
                                {resource.role}
                              </Typography>
                            </div>
                            <div className="flex items-center gap-1">
                              <Typography decoration="smooth">being able to</Typography>
                              <PermissionIcon permission={resource.perm} inline />
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
          </CardsSection.Body>
        </CardsSection>

        <CardsSection>
          <CardsSection.Header>
            <Typography
              as="h6"
              decoration="smooth"
              title="Your permissions allow you to do the following actions in our system"
            >
              What can you do with your permissions
            </Typography>
          </CardsSection.Header>

          <CardsSection.Body>
            {profile?.isStaff && (
              <AboutCard
                title="STAFF"
                subtitle="High level permissions"
                icon={GiWizardStaff}
                iconTitle="STAFF"
                links={[
                  { label: "/staff", to: "/dashboard/staff" },
                ]}
                aboutContent={(
                  <>
                    <Typography as="p" width="xxs">
                      Staff users can execute high-level system actions, such
                      as promoting eligible users to staff or manager roles.
                      Due to the significant level of access and control, this
                      role should be assigned with utmost caution.
                    </Typography>

                    <Typography as="p" width="xxs">
                      Additionally, staff users share the same permissions as
                      manager users.
                    </Typography>
                  </>
                )}
              />
            )}

            {profile?.isManager && (
              <AboutCard
                title="MANAGER"
                subtitle="High level permissions"
                icon={GrUserAdmin}
                iconTitle="MANAGER"
                links={[
                  { label: "/tenants", to: "/dashboard/tenants" },
                  { label: "/guest-roles", to: "/dashboard/guest-roles" },
                ]}
                aboutContent={
                  <>
                    <Typography as="p" width="xxs">
                      Wow, you're a Manager! This is a crucial role with
                      extensive authority over the system.
                    </Typography>

                    <Typography as="p" width="xxs">
                      Manager users can perform high-level actions, including
                      creating and managing tenants, configuring system-wide
                      settings, and overseeing all user roles. With this level
                      of access and control, the Manager role carries
                      significant responsibility and should be assigned with the
                      utmost caution.
                    </Typography>
                  </>
                }
              />
            )}
          </CardsSection.Body>
        </CardsSection>
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
