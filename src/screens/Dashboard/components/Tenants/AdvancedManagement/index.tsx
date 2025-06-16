import AuthorizedOr from "@/components/ui/AuthorizedOr";
import PageBody from "@/components/ui/PageBody";
import useProfile from "@/hooks/use-profile";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router";
import ControlPanelBreadcrumbItem from "../../ControlPanelBreadcrumbItem";
import { SlOrganization } from "react-icons/sl";
import useTenantDetails from "@/hooks/use-tenant-details";
import { buildPath } from "@/services/openapi/mycelium-api";
import Typography from "@/components/ui/Typography";
import CardsSection from "@/components/ui/CardsSection";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import IntroSection from "@/components/ui/IntroSection";
import { useDispatch } from "react-redux";
import { setTenantInfo } from "@/states/tenant.state";
import SeeMoreText from "@/components/ui/SeeMoreText";
import OwnersCard from "./OwnersCard";
import ManagersCard from "./ManagersCard";
import BrandCard from "./BrandCard";
import ColorsCard from "./ColorsCard";
import LegalSettings from "./LegalSettings";

export default function AdvancedManagement() {
  const params = useParams();

  const dispatch = useDispatch();

  const tenantId = useMemo(() => {
    if (!params.tenantId) return null;

    return params.tenantId as string;
  }, [params.tenantId]);

  const {
    hasEnoughPermissions,
    isLoadingUser,
    isLoadingProfile,
  } = useProfile({
    roles: [MycRole.TenantManager],
    permissions: [MycPermission.Read, MycPermission.Write],
    restrictSystemAccount: true,
    tenantOwnerNeeded: [tenantId ?? ""],
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
    error: tenantStatusError,
    mutate: mutateTenantStatus,
  } = useTenantDetails({ customUrl });

  useEffect(() => {
    if (tenantStatus && typeof tenantStatus === "object" && "active" in tenantStatus) {
      dispatch(setTenantInfo(tenantStatus.active));
    }
  }, [tenantStatus]);

  const activeTenant = useMemo(() => {
    if (!tenantStatus) return null;

    if (typeof tenantStatus === "object" && "active" in tenantStatus) {
      return tenantStatus.active;
    }

    return null;
  }, [tenantStatus]);

  /**
   * Base page component that contains the breadcrumb and the content
   * 
   * @param param0
   * @returns 
   */
  const BasePage = ({ children }: BaseProps) => (
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
          {children}
        </AuthorizedOr>
      </PageBody.Content>
    </PageBody>
  );

  if (isLoadingTenantStatus) {
    return <BasePage>Loading...</BasePage>;
  }

  if (tenantStatusError) {
    return <BasePage>Error: {tenantStatusError.message}</BasePage>;
  }

  if (tenantStatus === "deleted" || tenantStatus === "unknown") {
    return (
      <BasePage>
        <div className="flex flex-col items-center gap-12 h-[70vh] justify-center">
          <Typography as="h1" decoration="smooth" center margin="auto">
            Sorry! This tenant was deleted or not exists
          </Typography>

          <img
            src="/undraw.co/undraw_towing_e407.svg"
            alt="403"
            className="mx-auto"
            width={300}
            height={300}
          />
        </div>
      </BasePage>
    );
  }

  if (tenantStatus === "unauthorized") {
    return (
      <BasePage>
        <div className="flex flex-col items-center gap-12 h-[70vh] justify-center">
          <Typography as="h1" decoration="smooth" center margin="auto">
            You are not authorized to access this tenant
          </Typography>

          <img
            src="/undraw.co/undraw_secure-login_m11a.svg"
            alt="403"
            className="mx-auto"
            width={300}
            height={300}
          />
        </div>
      </BasePage>
    );
  }

  return (
    <BasePage>
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
                {formatDDMMYY(new Date(activeTenant?.created), true)}
              </IntroSection.Item>
            )}

            {activeTenant?.updated && (
              <IntroSection.Item
                prefix="updated at"
                title="Tenant updated at"
              >
                {formatDDMMYY(new Date(activeTenant?.updated), true)}
              </IntroSection.Item>
            )}
          </IntroSection>
        </CardsSection.Header>

        <CardsSection.Body>
          <SeeMoreText
            text="You can manage the people and settings for your tenant here. 
            Start by adding owners and management accounts to configure the 
            tenant, then invite additional users as needed. Any other 
            configuration options are available in the Tenant Settings section."
            maxLength={100}
          />
        </CardsSection.Body>
      </CardsSection>

      <CardsSection>
        <CardsSection.Header>
          <Typography as="h6" decoration="smooth">
            Legal Settings and People's
          </Typography>
        </CardsSection.Header>

        <CardsSection.Body>
          {activeTenant && (
            <LegalSettings
              tenant={activeTenant}
              mutateTenantStatus={mutateTenantStatus}
            />
          )}

          {activeTenant && (
            <OwnersCard
              tenant={activeTenant}
              mutateTenantStatus={mutateTenantStatus}
            />
          )}

          {activeTenant && (
            <ManagersCard
              tenant={activeTenant}
              mutateTenantStatus={mutateTenantStatus}
            />
          )}
        </CardsSection.Body>
      </CardsSection>

      <CardsSection>
        <CardsSection.Header>
          <Typography as="h6" decoration="smooth">
            <span>Customization</span>
          </Typography>
        </CardsSection.Header>

        <CardsSection.Body>
          {activeTenant && (
            <BrandCard
              tenant={activeTenant}
              mutateTenantStatus={mutateTenantStatus}
            />
          )}

          {activeTenant && (
            <ColorsCard
              tenant={activeTenant}
              mutateTenantStatus={mutateTenantStatus}
            />
          )}
        </CardsSection.Body>
      </CardsSection>
    </BasePage>
  )
}
