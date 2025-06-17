import { MdAltRoute } from "react-icons/md";
import { LuListChecks } from "react-icons/lu";
import { VscAccount, VscOrganization } from "react-icons/vsc";
import { GrOrganization, GrUserAdmin } from "react-icons/gr";
import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";
import { useCallback, useMemo, useState } from "react";
import PermissionIcon from "@/components/ui/PermissionIcon";
import CardsSection from "../../../../components/ui/CardsSection";
import { GiWizardStaff } from "react-icons/gi";
import AboutCard from "./AboutCard";
import { MycRole } from "@/types/MyceliumRole";
import { FaUserCheck } from "react-icons/fa6";
import { MdNearbyError, MdWebhook } from "react-icons/md";
import { SlOrganization } from "react-icons/sl";
import { TextInput } from "flowbite-react";
import getLicensedResourcesOrNull from "@/functions/get-licensed-resources-or-null";
import getTenantsOwnershipOrNull from "@/functions/get-tenant-ownership-or-null";
import MiniBox from "@/components/ui/MiniBox";
import IntroSection from "@/components/ui/IntroSection";

type Profile = components["schemas"]["Profile"];

interface Props {
  profile: Profile;
}

export default function PermissionsDetails({ profile }: Props) {
  const tenantsOwnership = useMemo(
    () => getTenantsOwnershipOrNull(profile?.tenantsOwnership),
    [profile?.tenantsOwnership]
  );

  const licensedResources = useMemo(
    () => getLicensedResourcesOrNull(profile?.licensedResources),
    [profile?.licensedResources]
  );

  const hasRole = useCallback(
    (role: MycRole | undefined, systemRole: boolean) => {
      if (!licensedResources) {
        return null;
      }

      if (!role) {
        const resources = licensedResources?.filter(
          (resource) => resource.sysAcc === systemRole
        );

        if (resources?.length === 0) {
          return null;
        }

        return resources;
      }

      const resources = licensedResources?.filter(
        (resource) => resource.role === role && resource.sysAcc === systemRole
      );

      if (resources?.length === 0) {
        return null;
      }

      return resources;
    },
    [licensedResources]
  );

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

  const hasNonSystemRole = useMemo(() => hasRole(undefined, false), [hasRole]);

  return (
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
            links={[{ label: "/accounts", to: "/dashboard/accounts" }]}
            aboutContent={
              <Typography as="div" decoration="faded">
                Staff users can execute high-level system actions, such as
                promoting eligible users to staff or manager roles. Due to the
                significant level of access and control, this role should be
                assigned with utmost caution.
                <br />
                <br />
                Additionally, staff users share the same permissions as manager
                users.
              </Typography>
            }
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
              <Typography as="div" decoration="faded">
                Wow, you're a Manager! This is a crucial role with extensive
                authority over the system.
                <br />
                <br />
                Manager users can perform high-level actions, including creating
                and managing tenants, configuring system-wide settings, and
                overseeing all user roles. With this level of access and
                control, the Manager role carries significant responsibility and
                should be assigned with the utmost caution.
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
            links={[{ label: "/accounts", to: "/dashboard/accounts" }]}
            aboutContent={
              <Typography as="div" decoration="faded">
                Account Manager is a account-wide role that allows you to manage
                accounts and guests to a specific account. This role is crucial
                for maintaining a secure and user-friendly environment for all
                users.
              </Typography>
            }
          />
        )}

        {hasSystemGatewayManager && (
          <AboutCard
            title="GATEWAY MANAGER"
            subtitle="Gateway-wide scope"
            icon={MdAltRoute}
            headerTitle="Gateway system role"
            links={[{ label: "/gateways", to: "/dashboard/gateways" }]}
            aboutContent={
              <Typography as="div" decoration="faded">
                Gateway Manager is a gateway-wide role that allows you to view
                and manage routes and services. This role has a system-wide
                scope, but with read-only privileges.
              </Typography>
            }
          />
        )}

        {hasSystemGuestsManager && (
          <AboutCard
            title="GUEST MANAGER"
            subtitle="System-wide scope"
            icon={FaUserCheck}
            headerTitle="Guest system role"
            links={[{ label: "/guest-roles", to: "/dashboard/guest-roles" }]}
            aboutContent={
              <Typography as="div" decoration="faded">
                Guests Manager is a system-wide role that allows you to manage
                guest roles across all tenants. Roles created with this
                permission will be applied to all tenants, ensuring a consistent
                and secure guest experience across the entire system.
                <br />
                <br />
                This role is crucial for maintaining a secure and user-friendly
                environment for all users.
              </Typography>
            }
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
            aboutContent={
              <Typography as="div" decoration="faded">
                Subscriptions Manager is a tenant-wide role that allows you to
                manage subscriptions within one or more tenants. Actions
                performed by this role include creating and updating
                subscriptions, as well as managing associated resources and
                settings.
                <br />
                <br />
                Subscriptions Manager can also guest users to a specific
                subscription account. Manage accounts tags and metadata is also
                allowed.
              </Typography>
            }
          />
        )}

        {hasSystemSystemManager && (
          <AboutCard
            title="SYSTEM MANAGER"
            subtitle="System-wide scope"
            icon={({
              className,
              title,
            }: {
              className: string;
              title: string;
            }) => {
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
            aboutContent={
              <Typography as="div" decoration="faded">
                System Manager should deal with system-wide issues and
                resources. Their impact is global, so they should be cautious
                when making changes.
                <br />
                <br />
                System managers should deal with less critical issues, such as
                error codes management and high level as webhooks configuration.
              </Typography>
            }
          />
        )}

        {tenantsOwnership && (
          <AboutCard
            title="TENANT OWNER"
            subtitle="Tenant-wide scope"
            icon={VscOrganization}
            headerTitle="Tenant ownership"
            links={[{ label: "/tenants", to: "/dashboard/tenants" }]}
            aboutContent={
              <Typography as="div" decoration="faded">
                You are a tenant owner. This means you have full access to one
                or more tenants and can manage them as well as their associated
                accounts and guests.
                <br />
                <br />
                Tenant owners has full access to the tenant's resources,
                including management of accounts, metadata, tags, and settings.
              </Typography>
            }
          />
        )}

        {hasSystemTenantManager && (
          <AboutCard
            title="TENANT MANAGER"
            subtitle="Tenant-wide scope"
            icon={SlOrganization}
            headerTitle="Tenant system role"
            links={[{ label: "/tenants", to: "/dashboard/tenants" }]}
            aboutContent={
              <Typography as="div" decoration="faded">
                Tenant Manager is a tenant-wide role that allows you to manage a
                single tenant.
                <br />
                <br />
                Actions performed by this role include creating and updating
                tenants settings, as well as managing associated resources as
                accounts, metadata, and tags.
              </Typography>
            }
          />
        )}

        {hasNonSystemRole && (
          <AboutCard
            title="CUSTOM ROLES"
            subtitle="Non system roles"
            icon={LuListChecks}
            headerTitle="Custom roles"
            links={[]}
            aboutContent={
              <Typography as="div" decoration="faded">
                You have access to one or more custom roles. This roles has a
                granular but non-system scope.
                <br />
                <br />
                <div className="flex flex-col gap-2">
                  <Typography as="h5" decoration="smooth">
                    Roles/accounts with access to:
                  </Typography>

                  <SearchableNonSystemRolesList roles={hasNonSystemRole} />
                </div>
              </Typography>
            }
          />
        )}
      </CardsSection.Body>
    </CardsSection>
  );
}

function SearchableNonSystemRolesList({
  roles,
}: {
  roles: components["schemas"]["LicensedResource"][];
}) {
  const [search, setSearch] = useState("");

  const filteredRoles = useMemo(() => {
    return roles.filter((role) =>
      role.role.toLowerCase().includes(search.toLowerCase())
    );
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

      <div className="flex flex-col gap-2 pt-2">
        {filteredRoles
          ?.sort(
            (a, b) =>
              a.accName.localeCompare(b.accName) ||
              a.role.localeCompare(b.role) ||
              a.perm.localeCompare(b.perm)
          )
          ?.map((resource, index) => (
            <MiniBox key={index}>
              <IntroSection title="Role" content={resource.role} as="h5">
                <IntroSection.Item
                  prefix="on"
                  title="The account that the role is assigned to"
                >
                  {resource.accName}
                </IntroSection.Item>

                <IntroSection.Item
                  prefix="being able to"
                  title="The permission of the role"
                >
                  <PermissionIcon permission={resource.perm} inline />
                </IntroSection.Item>
              </IntroSection>
            </MiniBox>
          ))}
      </div>
    </div>
  );
}
