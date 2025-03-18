import { MdAltRoute } from "react-icons/md";
import { LuListChecks } from "react-icons/lu";
import { VscAccount, VscOrganization } from "react-icons/vsc";
import { GrOrganization, GrUserAdmin } from "react-icons/gr";
import { PiSealCheckLight } from "react-icons/pi";
import Card from "@/components/ui/Card";
import PageBody from "@/components/ui/PageBody";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import { useCallback, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import TenantOwnership from "./TenantOwnership";
import PermissionIcon from "@/components/ui/PermissionIcon";
import { RiRobot2Line } from "react-icons/ri";
import CardsSection from "./CardsSection";
import { GiWizardStaff } from "react-icons/gi";
import AboutCard from "./AboutCard";
import { MycRole } from "@/types/MyceliumRole";
import { FaUserCheck } from "react-icons/fa6";
import { MdNearbyError, MdWebhook } from "react-icons/md";
import { SlOrganization } from "react-icons/sl";
import { TextInput } from "flowbite-react";

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

  const hasRole = useCallback((role: MycRole | undefined, systemRole: boolean) => {
    if (!licensedResources) {
      return null;
    }

    if (!role) {
      const resources = licensedResources
        ?.filter((resource) => (
          resource.sysAcc === systemRole
        ));

      if (resources?.length === 0) {
        return null;
      }

      return resources;
    }

    const resources = licensedResources
      ?.filter((resource) => (
        resource.role === role &&
        resource.sysAcc === systemRole
      ));

    if (resources?.length === 0) {
      return null;
    }

    return resources;
  }, [licensedResources]);

  const hasSystemAccountManager = useMemo(
    () => hasRole(MycRole.AccountManager, true),
    [hasRole]
  );

  const hasSystemGatewayManager = useMemo(
    () => hasRole(MycRole.GatewayManager, true),
    [hasRole]
  );

  const hasSystemGuestsManager = useMemo(
    () => hasRole(MycRole.GuestsManager, true),
    [hasRole]
  );

  const hasSystemSubscriptionsManager = useMemo(
    () => hasRole(MycRole.SubscriptionsManager, true),
    [hasRole]
  );

  const hasSystemSystemManager = useMemo(
    () => hasRole(MycRole.SystemManager, true),
    [hasRole]
  );

  const hasSystemTenantManager = useMemo(
    () => hasRole(MycRole.TenantManager, true),
    [hasRole]
  );

  const hasNonSystemRole = useMemo(
    () => hasRole(undefined, false),
    [hasRole]
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

      <PageBody.Content padding="md" container flex="col" gap={12}>
        <CardsSection>
          <CardsSection.Header>
            <Typography
              as="h4"
              decoration="smooth"
              title="Here you can find important information about your profile and your permissions"
            >
              About you
            </Typography>
          </CardsSection.Header>

          <CardsSection.Body>
            <Card minHeight="50vh" maxHeight="50vh" padding="sm" width="6xl" flex1>
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
              <Card minHeight="50vh" maxHeight="50vh" padding="sm" width="6xl" flex1>
                <Card.Header>
                  <Typography as="h6" decoration="smooth">
                    Ownership on Tenants
                  </Typography>
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

            <Card minHeight="50vh" maxHeight="50vh" padding="sm" width="6xl" flex1 dashed={!licensedResources}>
              <Card.Header>
                <Typography as="h6" decoration="smooth">
                  Accounts witch you have access
                </Typography>
              </Card.Header>

              <Card.Body>
                {licensedResources
                  ? (
                    <div className="flex flex-col gap-2 scrollbar">
                      {licensedResources
                        ?.sort((a, b) => (a.sysAcc ? -1 : 1) || a.accName.localeCompare(b.accName) || b.perm.localeCompare(a.perm))
                        ?.map((resource, index) => (
                          <div
                            key={index}
                            className="flex flex-col gap-0 bg-blue-50 dark:bg-slate-900 bg-opacity-50 dark:bg-opacity-50 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 w-full"
                          >
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

        {(profile?.licensedResources || profile?.isStaff || profile?.isManager) && (
          <CardsSection>
            <CardsSection.Header>
              <Typography
                as="h4"
                decoration="smooth"
                title="Your permissions allow you to do the following actions in our system"
              >
                What can you do with your current permissions?
              </Typography>
            </CardsSection.Header>

            <CardsSection.Body>
              {profile?.isStaff && (
                <AboutCard
                  title="STAFF"
                  subtitle="High level permissions"
                  icon={GiWizardStaff}
                  headerTitle="Super user group"
                  links={[
                    { label: "/staff", to: "/dashboard/staff" },
                  ]}
                  aboutContent={(
                    <Typography as="p" width="xxs" decoration="faded">
                      Staff users can execute high-level system actions, such
                      as promoting eligible users to staff or manager roles.
                      Due to the significant level of access and control, this
                      role should be assigned with utmost caution.

                      <br /><br />

                      Additionally, staff users share the same permissions as
                      manager users.
                    </Typography>
                  )}
                />
              )}

              {profile?.isManager && (
                <AboutCard
                  title="MANAGER"
                  subtitle="High level permissions"
                  icon={GrUserAdmin}
                  headerTitle="Super user group"
                  links={[
                    { label: "/tenants", to: "/dashboard/tenants" },
                    { label: "/guest-roles", to: "/dashboard/guest-roles" },
                  ]}
                  aboutContent={
                    <Typography as="p" width="xxs" decoration="faded">
                      Wow, you're a Manager! This is a crucial role with
                      extensive authority over the system.

                      <br /><br />

                      Manager users can perform high-level actions, including
                      creating and managing tenants, configuring system-wide
                      settings, and overseeing all user roles. With this level
                      of access and control, the Manager role carries
                      significant responsibility and should be assigned with the
                      utmost caution.
                    </Typography>
                  }
                />
              )}

              {hasSystemAccountManager && (
                <AboutCard
                  title="ACCOUNT MANAGER"
                  subtitle="Account-wide scope"
                  icon={VscAccount}
                  headerTitle="Account system role"
                  links={[
                    { label: "/accounts", to: "/dashboard/accounts" },
                  ]}
                  aboutContent={(
                    <Typography as="p" width="xxs" decoration="faded">
                      Account Manager is a account-wide role that allows you to
                      manage accounts and guests to a specific account. This
                      role is crucial for maintaining a secure and user-friendly
                      environment for all users.
                    </Typography>
                  )}
                />
              )}

              {hasSystemGatewayManager && (
                <AboutCard
                  title="GATEWAY MANAGER"
                  subtitle="Gateway-wide scope"
                  icon={MdAltRoute}
                  headerTitle="Gateway system role"
                  links={[
                    { label: "/gateways", to: "/dashboard/gateways" },
                  ]}
                  aboutContent={(
                    <Typography as="p" width="xxs" decoration="faded">
                      Gateway Manager is a gateway-wide role that allows you to
                      view and manage routes and services. This role has a
                      system-wide scope, but with read-only privileges.
                    </Typography>
                  )}
                />
              )}

              {hasSystemGuestsManager && (
                <AboutCard
                  title="GUEST MANAGER"
                  subtitle="System-wide scope"
                  icon={FaUserCheck}
                  headerTitle="Guest system role"
                  links={[
                    { label: "/guest-roles", to: "/dashboard/guest-roles" },
                  ]}
                  aboutContent={(
                    <Typography as="p" width="xxs" decoration="faded">
                      Guests Manager is a system-wide role that allows you to
                      manage guest roles across all tenants. Roles created with
                      this permission will be applied to all tenants, ensuring a
                      consistent and secure guest experience across the entire
                      system.

                      <br /><br />

                      This role is crucial for maintaining a secure and
                      user-friendly environment for all users.
                    </Typography>
                  )}
                />
              )}

              {hasSystemSubscriptionsManager && (
                <AboutCard
                  title="SUBSCRIPTIONS MANAGER"
                  subtitle="Tenant-wide scope"
                  icon={GrOrganization}
                  headerTitle="Subscriptions system role"
                  links={[
                    { label: "/subscriptions", to: "/dashboard/subscriptions" },
                  ]}
                  aboutContent={(
                    <Typography as="p" width="xxs" decoration="faded">
                      Subscriptions Manager is a tenant-wide role that allows
                      you to manage subscriptions within one or more tenants.
                      Actions performed by this role include creating and
                      updating subscriptions, as well as managing associated
                      resources and settings.

                      <br /><br />

                      Subscriptions Manager can also guest users to a specific
                      subscription account. Manage accounts tags and metadata is
                      also allowed.
                    </Typography>
                  )}
                />
              )}

              {hasSystemSystemManager && (
                <AboutCard
                  title="SYSTEM MANAGER"
                  subtitle="System-wide scope"
                  icon={({ className, title }: { className: string, title: string }) => {
                    return (
                      <div title={title} className="flex items-center gap-2">
                        <MdNearbyError className={className} />
                        <MdWebhook className={className + " -ml-3"} />
                      </div>
                    );
                  }}
                  headerTitle="System system role"
                  links={[
                    { label: "/error-codes", to: "/dashboard/error-codes" },
                    { label: "/webhooks", to: "/dashboard/webhooks" },
                  ]}
                  aboutContent={(
                    <Typography as="p" width="xxs" decoration="faded">
                      System Manager should deal with system-wide issues and
                      resources. Their impact is global, so they should be
                      cautious when making changes.

                      <br /><br />

                      System managers should deal with less critical issues,
                      such as error codes management and high level as webhooks
                      configuration.
                    </Typography>
                  )}
                />
              )}

              {tenantsOwnership && (
                <AboutCard
                  title="TENANT OWNER"
                  subtitle="Tenant-wide scope"
                  icon={VscOrganization}
                  headerTitle="Tenant ownership"
                  links={[
                    { label: "/tenants", to: "/dashboard/tenants" },
                  ]}
                  aboutContent={(
                    <Typography as="p" width="xxs" decoration="faded">
                      You are a tenant owner. This means you have full access to
                      one or more tenants and can manage them as well as their
                      associated accounts and guests.

                      <br /><br />

                      Tenant owners has full access to the tenant's resources,
                      including management of accounts, metadata, tags, and
                      settings.
                    </Typography>
                  )}
                />
              )}

              {hasSystemTenantManager && (
                <AboutCard
                  title="TENANT MANAGER"
                  subtitle="Tenant-wide scope"
                  icon={SlOrganization}
                  headerTitle="Tenant system role"
                  links={[
                    { label: "/tenants", to: "/dashboard/tenants" },
                  ]}
                  aboutContent={(
                    <Typography as="p" width="xxs" decoration="faded">
                      Tenant Manager is a tenant-wide role that allows you to
                      manage a single tenant.

                      <br /><br />

                      Actions performed by this role include creating and
                      updating tenants settings, as well as managing associated
                      resources as accounts, metadata, and tags.
                    </Typography>
                  )}
                />
              )}

              {hasNonSystemRole && (
                <AboutCard
                  title="CUSTOM ROLES"
                  subtitle="Non system roles"
                  icon={LuListChecks}
                  headerTitle="Custom roles"
                  links={[]}
                  aboutContent={(
                    <Typography as="div" width="xxs" decoration="faded">
                      You have access to one or more custom roles. This
                      roles has a granular but non-system scope.

                      <br /><br />

                      <div className="flex flex-col gap-2">
                        <Typography as="h5" decoration="smooth">
                          Roles/accounts with access to:
                        </Typography>

                        <SearchableNonSystemRolesList roles={hasNonSystemRole} />
                      </div>
                    </Typography>
                  )}
                />
              )}
            </CardsSection.Body>
          </CardsSection>
        )}
      </PageBody.Content>
    </PageBody>
  );
}

const getTenantsOwnership = (
  tenantsOwnership: Profile["tenantsOwnership"]
): components["schemas"]["TenantOwnership"][] | null => {
  if (tenantsOwnership && "records" in tenantsOwnership) {
    const records = tenantsOwnership.records;

    if (records.length === 0) {
      return null;
    }

    return records;
  }

  return null;
}

const getLicensedResources = (
  licensedResources: Profile["licensedResources"]
): components["schemas"]["LicensedResource"][] | null => {
  if (licensedResources && "records" in licensedResources) {
    const records = licensedResources.records;

    if (records.length === 0) {
      return null;
    }

    return records;
  }

  return null;
}

function SearchableNonSystemRolesList({
  roles,
}: {
  roles: components["schemas"]["LicensedResource"][];
}) {
  const [search, setSearch] = useState("");

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => role.role.toLowerCase().includes(search.toLowerCase()));
  }, [roles, search]);

  return (
    <div className="mb-24">
      <TextInput
        type="text"
        sizing="sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Filter roles"
      />

      <div className="flex flex-col gap-2">
        {filteredRoles
          ?.sort((a, b) => (
            a.accName.localeCompare(b.accName) ||
            a.role.localeCompare(b.role) ||
            a.perm.localeCompare(b.perm)
          ))
          ?.map((resource, index) => (
            <div key={index} className="flex flex-col gap-0 border-b border-gray-200 dark:border-gray-700 pt-2">
              <div className="flex items-center gap-1 whitespace-nowrap">
                <Typography as="span" decoration="smooth" nowrap>
                  Role
                </Typography>
                <Typography as="h5" truncate title={resource.role}>
                  {resource.role}
                </Typography>
              </div>
              <div className="flex items-center gap-1 whitespace-nowrap">
                <Typography as="span" decoration="smooth" nowrap>
                  on
                </Typography>
                <Typography as="span" truncate title={resource.accName}>
                  {resource.accName}
                </Typography>
              </div>
              <div className="flex items-center gap-1 -mt-1 whitespace-nowrap">
                <Typography as="span" decoration="smooth" nowrap>
                  being able to
                </Typography>
                <PermissionIcon permission={resource.perm} inline />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}