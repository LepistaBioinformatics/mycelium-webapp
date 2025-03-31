import AuthorizedOr from "@/components/ui/AuthorizedOr";
import PageBody from "@/components/ui/PageBody";
import useProfile from "@/hooks/use-profile";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { useMemo } from "react";
import { useParams } from "react-router";
import ControlPanelBreadcrumbItem from "../ControlPanelBreadcrumbItem";
import { SlOrganization } from "react-icons/sl";
import useTenantDetails from "@/hooks/use-tenant-details";
import { buildPath } from "@/services/openapi/mycelium-api";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import CardsSection from "@/components/ui/CardsSection";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import IntroSection from "@/components/ui/IntroSection";
import MiniBox from "@/components/ui/MiniBox";
import { components } from "@/services/openapi/mycelium-schema";
import AccountInvitations from "../Accounts/AccountInvitations";

type Parent_Account_String = components["schemas"]["Parent_Account_String"];

export default function AdvancedManagement() {
  const params = useParams();

  const tenantId = useMemo(() => {
    if (!params.tenantId) return null;

    return params.tenantId as string;
  }, [params.tenantId]);

  const {
    hasEnoughPermissions,
    isLoadingUser,
    isLoadingProfile,
  } = useProfile({
    roles: [MycRole.TenantManager, MycRole.TenantOwner],
    permissions: [MycPermission.Read, MycPermission.Write],
    restrictSystemAccount: true,
  });

  const customUrl = useMemo(() => {
    if (!tenantId) return null;

    return buildPath(
      "/adm/rs/tenant-manager/tenants/{tenant_id}",
      { path: { tenant_id: tenantId } }
    );
  }, [tenantId]);

  const {
    tenantStatus,
    isLoading: isLoadingTenantStatus,
    error: tenantStatusError
  } = useTenantDetails({ customUrl });

  const activeTenant = useMemo(() => {
    if (!tenantStatus) return null;

    if (typeof tenantStatus === "object" && "active" in tenantStatus) {
      return tenantStatus.active;
    }

    return null;
  }, [tenantStatus]);

  const owners = useMemo(() => {
    if (!activeTenant) return null;

    if ("owners" in activeTenant) {
      if ("records" in activeTenant.owners) {
        return activeTenant.owners.records;
      }
    }

    return null;
  }, [activeTenant]);

  const manager = useMemo(() => {
    if (!activeTenant) return null;

    if ("manager" in activeTenant) {
      const manager = activeTenant.manager as Parent_Account_String;

      if ("record" in manager) {
        return manager.record;
      }
    }

    return null;
  }, [activeTenant]);

  if (isLoadingTenantStatus) {
    return <>Loading...</>;
  }

  if (tenantStatusError) {
    return <>Error: {tenantStatusError.message}</>;
  }

  if (tenantStatus === "deleted") {
    return <>Tenant deleted</>;
  }

  if (tenantStatus === "unknown") {
    return <>Unknown tenant</>;
  }

  if (tenantStatus === "unauthorized") {
    return <>Unauthorized</>;
  }

  return (
    <PageBody padding="md" height="fit">
      <PageBody.Breadcrumb>
        <ControlPanelBreadcrumbItem />
        <PageBody.Breadcrumb.Item href="/dashboard/tenants" icon={SlOrganization}>
          Tenants
        </PageBody.Breadcrumb.Item>
        <PageBody.Breadcrumb.Item>
          Advanced Management
        </PageBody.Breadcrumb.Item>
      </PageBody.Breadcrumb>

      <PageBody.Content padding="md" container flex="col" gap={12}>
        <AuthorizedOr
          authorized={hasEnoughPermissions}
          isLoading={isLoadingUser || isLoadingProfile}
        >
          <CardsSection>
            <CardsSection.Header>
              <IntroSection
                prefix="Seeing"
                content={activeTenant?.name}
                title="Tenant name"
                as="h1"
              >
                <IntroSection.Item
                  prefix="described as"
                  title="Tenant description"
                >
                  {activeTenant?.description}
                </IntroSection.Item>

                {activeTenant?.created && (
                  <IntroSection.Item
                    prefix="created at"
                    title="Tenant created at"
                  >
                    {formatDDMMYY(new Date(activeTenant?.created))}
                  </IntroSection.Item>
                )}

                {activeTenant?.updated && (
                  <IntroSection.Item
                    prefix="updated at"
                    title="Tenant updated at"
                  >
                    {formatDDMMYY(new Date(activeTenant?.updated))}
                  </IntroSection.Item>
                )}
              </IntroSection>
            </CardsSection.Header>

            <CardsSection.Body>
              <Card
                minHeight="50vh"
                maxHeight="50vh"
                padding="sm"
                width="6xl"
                flex1
              >
                <Card.Header>
                  <Typography as="h6" decoration="smooth">
                    Owners
                  </Typography>
                </Card.Header>

                <Card.Body>
                  <div className="flex flex-col gap-2">
                    {owners?.map((owner) => {
                      const ownerName = owner.firstName && owner.lastName
                        ? `${owner.firstName} ${owner.lastName}`
                        : owner.username;

                      return (
                        <MiniBox key={owner.id}>
                          <IntroSection
                            content={ownerName}
                            title="Owner name"
                            as="h3"
                          >
                            <IntroSection.Item
                              prefix="email"
                              title="Email"
                            >
                              {owner.email}
                            </IntroSection.Item>
                          </IntroSection>
                        </MiniBox>
                      )
                    })}
                  </div>
                </Card.Body>
              </Card>

              <Card
                minHeight="50vh"
                maxHeight="50vh"
                padding="sm"
                width="6xl"
                flex1
              >
                <Card.Header>
                  <Typography
                    as="h6"
                    decoration="smooth"
                    title="Peples listed here contains would perform management actions on the tenant"
                  >
                    Management account invitations
                  </Typography>
                </Card.Header>

                <Card.Body>
                  {activeTenant?.id && manager && (
                    <div className="flex flex-col gap-1">
                      <AccountInvitations
                        account={manager}
                        tenantId={activeTenant?.id}
                      />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </CardsSection.Body>
          </CardsSection>

          {tenantStatus && (
            <div className="flex flex-col gap-4 text-slate-500">
              <div className="w-full text-left">
                <pre>
                  {JSON.stringify(tenantStatus, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </AuthorizedOr>
      </PageBody.Content>
    </PageBody>
  )
}
