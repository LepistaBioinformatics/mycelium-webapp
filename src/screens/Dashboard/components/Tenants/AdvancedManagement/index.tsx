import AuthorizedOr from "@/components/ui/AuthorizedOr";
import PageBody from "@/components/ui/PageBody";
import useProfile from "@/hooks/use-profile";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router";
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
import { useTranslation } from "react-i18next";
import { MdManageAccounts } from "react-icons/md";

export default function AdvancedManagement() {
  const { t } = useTranslation();

  const params = useParams();

  const dispatch = useDispatch();

  const tenantId = useMemo(() => {
    if (!params.tenantId) return null;

    return params.tenantId as string;
  }, [params.tenantId]);

  const { hasEnoughPermissions, isLoadingUser, isLoadingProfile } = useProfile({
    roles: [MycRole.TenantManager],
    permissions: [MycPermission.Read, MycPermission.Write],
    restrictSystemAccount: true,
    tenantOwnerNeeded: [tenantId ?? ""],
  });

  const customUrl = useMemo(() => {
    if (!tenantId) return null;

    return buildPath("/adm/rs/tenant-manager/tenants/{tenant_id}", {
      path: { tenant_id: tenantId },
    });
  }, [tenantId]);

  const {
    tenantStatus,
    isLoading: isLoadingTenantStatus,
    error: tenantStatusError,
    mutate: mutateTenantStatus,
  } = useTenantDetails({ customUrl });

  useEffect(() => {
    if (
      tenantStatus &&
      typeof tenantStatus === "object" &&
      "active" in tenantStatus
    ) {
      dispatch(setTenantInfo(tenantStatus.active));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <PageBody.Breadcrumb.Item
          href="/dashboard/tenants"
          icon={SlOrganization}
        >
          {t("screens.Dashboard.Tenants.AdvancedManagement.breadcrumb")}
        </PageBody.Breadcrumb.Item>
        <PageBody.Breadcrumb.Item>
          {t("screens.Dashboard.Tenants.AdvancedManagement.title")}
        </PageBody.Breadcrumb.Item>
        {activeTenant && (
          <PageBody.Breadcrumb.Item>
            {activeTenant.name}
          </PageBody.Breadcrumb.Item>
        )}
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
            prefix={t(
              "screens.Dashboard.Tenants.AdvancedManagement.name.prefix"
            )}
            content={activeTenant?.name}
            title={t("screens.Dashboard.Tenants.AdvancedManagement.name.title")}
            as="h1"
          >
            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.Tenants.AdvancedManagement.description.prefix"
              )}
              title={t(
                "screens.Dashboard.Tenants.AdvancedManagement.description.title"
              )}
            >
              {activeTenant?.description}
            </IntroSection.Item>

            {activeTenant?.created && (
              <IntroSection.Item
                prefix={t(
                  "screens.Dashboard.Tenants.AdvancedManagement.created.prefix"
                )}
                title={t(
                  "screens.Dashboard.Tenants.AdvancedManagement.created.title"
                )}
              >
                {formatDDMMYY(new Date(activeTenant?.created), true)}
              </IntroSection.Item>
            )}

            {activeTenant?.updated && (
              <IntroSection.Item
                prefix={t(
                  "screens.Dashboard.Tenants.AdvancedManagement.updated.prefix"
                )}
                title={t(
                  "screens.Dashboard.Tenants.AdvancedManagement.updated.title"
                )}
              >
                {formatDDMMYY(new Date(activeTenant?.updated), true)}
              </IntroSection.Item>
            )}

            <Link
              to={`/dashboard/accounts`}
              className="flex gap-2 items-center align-center hover:underline text-lg text-indigo-500 dark:text-lime-500 mt-2"
              title={t(
                "screens.Dashboard.Tenants.AdvancedManagement.manageAccountsDescription"
              )}
            >
              <MdManageAccounts
                size={24}
                className="inline text-indigo-500 dark:text-lime-500"
              />
              {t("screens.Dashboard.Tenants.AdvancedManagement.manageAccounts")}
            </Link>
          </IntroSection>
        </CardsSection.Header>

        <CardsSection.Body>
          <SeeMoreText
            text={t(
              "screens.Dashboard.Tenants.AdvancedManagement.longDescription"
            )}
            maxLength={100}
          />
        </CardsSection.Body>
      </CardsSection>

      {activeTenant && (
        <CardsSection>
          <CardsSection.Header>
            <Typography as="h3" decoration="smooth">
              {t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.title"
              )}
            </Typography>
          </CardsSection.Header>

          <CardsSection.Body>
            <div className="flex flex-col md:flex-row md:flex-wrap gap-3 w-full">
              <OwnersCard
                tenant={activeTenant}
                mutateTenantStatus={mutateTenantStatus}
              />

              <LegalSettings
                tenant={activeTenant}
                mutateTenantStatus={mutateTenantStatus}
              />
            </div>
          </CardsSection.Body>
        </CardsSection>
      )}

      <CardsSection>
        <CardsSection.Header>
          <Typography as="h3" decoration="smooth">
            <span>
              {t(
                "screens.Dashboard.Tenants.AdvancedManagement.customization.title"
              )}
            </span>
          </Typography>
        </CardsSection.Header>

        <CardsSection.Body>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {activeTenant && (
              <>
                <ManagersCard
                  tenant={activeTenant}
                  mutateTenantStatus={mutateTenantStatus}
                />

                <BrandCard
                  tenant={activeTenant}
                  mutateTenantStatus={mutateTenantStatus}
                />

                <ColorsCard
                  tenant={activeTenant}
                  mutateTenantStatus={mutateTenantStatus}
                />
              </>
            )}
          </div>
        </CardsSection.Body>
      </CardsSection>
    </BasePage>
  );
}
