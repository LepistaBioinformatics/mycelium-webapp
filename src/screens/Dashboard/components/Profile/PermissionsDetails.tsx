import { MdAltRoute } from "react-icons/md";
import { LuListChecks } from "react-icons/lu";
import { VscAccount, VscOrganization } from "react-icons/vsc";
import { GrOrganization, GrUserAdmin } from "react-icons/gr";
import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";
import { useCallback, useMemo, useState } from "react";
import PermissionIcon from "@/components/ui/PermissionIcon";
import CardsSection from "@/components/ui/CardsSection";
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
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import MarkdownViewer from "@/components/ui/MarkdownViewer";

type Profile = components["schemas"]["Profile"];

interface Props {
  profile: Profile;
}

export default function PermissionsDetails({ profile }: Props) {
  const { t } = useTranslation();

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
          {t("screens.Dashboard.PermissionsDetails.title")}
        </Typography>
      </CardsSection.Header>

      <CardsSection.Body>
        {profile?.isStaff && (
          <AboutCard
            title={t("screens.Dashboard.PermissionsDetails.staff.title")}
            subtitle={t("screens.Dashboard.PermissionsDetails.staff.subtitle")}
            icon={GiWizardStaff}
            headerTitle={t(
              "screens.Dashboard.PermissionsDetails.staff.headerTitle"
            )}
            links={[{ label: "/accounts", to: "/dashboard/accounts" }]}
            aboutContent={
              <AboutContent
                t={t}
                tKey="screens.Dashboard.PermissionsDetails.staff.abountContent"
              />
            }
          />
        )}

        {profile?.isManager && (
          <AboutCard
            title={t("screens.Dashboard.PermissionsDetails.manager.title")}
            subtitle={t(
              "screens.Dashboard.PermissionsDetails.manager.subtitle"
            )}
            icon={GrUserAdmin}
            headerTitle={t(
              "screens.Dashboard.PermissionsDetails.manager.headerTitle"
            )}
            links={[
              { label: "/tenants", to: "/dashboard/tenants" },
              { label: "/guest-roles", to: "/dashboard/guest-roles" },
            ]}
            aboutContent={
              <AboutContent
                t={t}
                tKey="screens.Dashboard.PermissionsDetails.manager.abountContent"
              />
            }
          />
        )}

        {hasSystemAccountManager && (
          <AboutCard
            title={t(
              "screens.Dashboard.PermissionsDetails.accountManager.title"
            )}
            subtitle={t(
              "screens.Dashboard.PermissionsDetails.accountManager.subtitle"
            )}
            icon={VscAccount}
            headerTitle={t(
              "screens.Dashboard.PermissionsDetails.accountManager.headerTitle"
            )}
            links={[{ label: "/accounts", to: "/dashboard/accounts" }]}
            aboutContent={
              <AboutContent
                t={t}
                tKey="screens.Dashboard.PermissionsDetails.accountManager.abountContent"
              />
            }
          />
        )}

        {hasSystemGatewayManager && (
          <AboutCard
            title={t(
              "screens.Dashboard.PermissionsDetails.gatewayManager.title"
            )}
            subtitle={t(
              "screens.Dashboard.PermissionsDetails.gatewayManager.subtitle"
            )}
            icon={MdAltRoute}
            headerTitle={t(
              "screens.Dashboard.PermissionsDetails.gatewayManager.headerTitle"
            )}
            links={[{ label: "/gateways", to: "/dashboard/gateways" }]}
            aboutContent={
              <AboutContent
                t={t}
                tKey="screens.Dashboard.PermissionsDetails.gatewayManager.abountContent"
              />
            }
          />
        )}

        {hasSystemGuestsManager && (
          <AboutCard
            title={t("screens.Dashboard.PermissionsDetails.guestManager.title")}
            subtitle={t(
              "screens.Dashboard.PermissionsDetails.guestManager.subtitle"
            )}
            icon={FaUserCheck}
            headerTitle={t(
              "screens.Dashboard.PermissionsDetails.guestManager.headerTitle"
            )}
            links={[{ label: "/guest-roles", to: "/dashboard/guest-roles" }]}
            aboutContent={
              <AboutContent
                t={t}
                tKey="screens.Dashboard.PermissionsDetails.guestManager.abountContent"
              />
            }
          />
        )}

        {hasSystemSubscriptionsManager && (
          <AboutCard
            title={t(
              "screens.Dashboard.PermissionsDetails.subscriptionsManager.title"
            )}
            subtitle={t(
              "screens.Dashboard.PermissionsDetails.subscriptionsManager.subtitle"
            )}
            icon={GrOrganization}
            headerTitle={t(
              "screens.Dashboard.PermissionsDetails.subscriptionsManager.headerTitle"
            )}
            links={[
              { label: "/subscriptions", to: "/dashboard/subscriptions" },
            ]}
            aboutContent={
              <AboutContent
                t={t}
                tKey="screens.Dashboard.PermissionsDetails.subscriptionsManager.abountContent"
              />
            }
          />
        )}

        {hasSystemSystemManager && (
          <AboutCard
            title={t(
              "screens.Dashboard.PermissionsDetails.systemManager.title"
            )}
            subtitle={t(
              "screens.Dashboard.PermissionsDetails.systemManager.subtitle"
            )}
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
            headerTitle={t(
              "screens.Dashboard.PermissionsDetails.systemManager.headerTitle"
            )}
            links={[
              { label: "/error-codes", to: "/dashboard/error-codes" },
              { label: "/webhooks", to: "/dashboard/webhooks" },
            ]}
            aboutContent={
              <AboutContent
                t={t}
                tKey="screens.Dashboard.PermissionsDetails.systemManager.abountContent"
              />
            }
          />
        )}

        {tenantsOwnership && (
          <AboutCard
            title={t("screens.Dashboard.PermissionsDetails.tenantOwner.title")}
            subtitle={t(
              "screens.Dashboard.PermissionsDetails.tenantOwner.subtitle"
            )}
            icon={VscOrganization}
            headerTitle={t(
              "screens.Dashboard.PermissionsDetails.tenantOwner.headerTitle"
            )}
            links={[]}
            aboutContent={
              <AboutContent
                t={t}
                tKey="screens.Dashboard.PermissionsDetails.tenantOwner.abountContent"
              />
            }
          />
        )}

        {hasSystemTenantManager && (
          <AboutCard
            title={t(
              "screens.Dashboard.PermissionsDetails.tenantManager.title"
            )}
            subtitle={t(
              "screens.Dashboard.PermissionsDetails.tenantManager.subtitle"
            )}
            icon={SlOrganization}
            headerTitle={t(
              "screens.Dashboard.PermissionsDetails.tenantManager.headerTitle"
            )}
            links={[{ label: "/tenants", to: "/dashboard/tenants" }]}
            aboutContent={
              <AboutContent
                t={t}
                tKey="screens.Dashboard.PermissionsDetails.tenantManager.abountContent"
              />
            }
          />
        )}

        {hasNonSystemRole && (
          <AboutCard
            title={t("screens.Dashboard.PermissionsDetails.customRoles.title")}
            subtitle={t(
              "screens.Dashboard.PermissionsDetails.customRoles.subtitle"
            )}
            icon={LuListChecks}
            headerTitle={t(
              "screens.Dashboard.PermissionsDetails.customRoles.headerTitle"
            )}
            links={[]}
            aboutContent={
              <AboutContent
                t={t}
                tKey="screens.Dashboard.PermissionsDetails.customRoles.abountContent"
              >
                <div className="flex flex-col gap-2">
                  <SearchableNonSystemRolesList roles={hasNonSystemRole} />
                </div>
              </AboutContent>
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
            <MiniBox key={index} width="full">
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

function AboutContent({
  t,
  tKey,
  children,
}: { t: TFunction; tKey: string } & BaseProps) {
  return (
    <Typography as="div" width="xs">
      <Typography as="span" decoration="faded">
        <MarkdownViewer markdown={t(tKey)} />
      </Typography>

      {children}
    </Typography>
  );
}
