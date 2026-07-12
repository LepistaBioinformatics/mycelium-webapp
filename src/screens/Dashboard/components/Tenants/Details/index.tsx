"use client";

import AuthorizedOr from "@/components/ui/AuthorizedOr";
import PageBody from "@/components/ui/PageBody";
import useProfile from "@/hooks/use-profile";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import ControlPanelBreadcrumbItem from "../../ControlPanelBreadcrumbItem";
import { SlOrganization } from "react-icons/sl";
import useSWR from "swr";
import { tenantGet } from "@/services/rpc/tenantManager";
import { TenantStatus } from "@/types/TenantStatus";
import Typography from "@/components/ui/Typography";
import Section from "@/components/ui/Section";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import IntroSection from "@/components/ui/IntroSection";
import { useDispatch } from "react-redux";
import { setTenantInfo } from "@/states/tenant.state";
import OwnersCard from "./OwnersCard";
import ManagersCard from "./ManagersCard";
import BrandCard from "./BrandCard";
import LegalSettings from "./LegalSettings";
import NotificationsCard from "./NotificationsCard";
import TelegramConfigCard from "./TelegramConfigCard";
import { useTranslation } from "react-i18next";
import {
  MdImagesearchRoller,
  MdManageAccounts,
  MdOutlineRealEstateAgent,
  MdOutlineIntegrationInstructions,
  MdNotificationsNone,
  MdOutlineDashboard,
} from "react-icons/md";
import CreateConnectionStringModal from "../../CreateConnectionStringModal";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import CreateSubscriptionManagerAccountModal from "./CreateSubscriptionManagerAccountModal";
import CreateManagementAccount from "../CreateManagementAccount";
import DeleteTenant from "../DeleteTenant";
import { GoLaw } from "react-icons/go";
import { GrUserManager } from "react-icons/gr";
import Card from "@/components/ui/Card";
import VerticalTabNav from "@/components/ui/VerticalTabNav";
import Overview from "./Overview";
import { ActiveTab } from "./active-tab";
import { useEffect } from "react";

interface NavItem {
  tab: ActiveTab;
  labelKey: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    tab: ActiveTab.Overview,
    labelKey: "screens.Dashboard.Tenants.AdvancedManagement.tabs.overview",
    icon: <MdOutlineDashboard size={16} />,
  },
  {
    tab: ActiveTab.Notifications,
    labelKey: "screens.Dashboard.Tenants.AdvancedManagement.tabs.notifications",
    icon: <MdNotificationsNone size={16} />,
  },
  {
    tab: ActiveTab.Brand,
    labelKey: "screens.Dashboard.Tenants.AdvancedManagement.tabs.brand",
    icon: <MdImagesearchRoller size={16} />,
  },
  {
    tab: ActiveTab.LegalInformation,
    labelKey:
      "screens.Dashboard.Tenants.AdvancedManagement.tabs.legalInformation",
    icon: <GoLaw size={16} />,
  },
  {
    tab: ActiveTab.Owners,
    labelKey: "screens.Dashboard.Tenants.AdvancedManagement.tabs.owners",
    icon: <MdOutlineRealEstateAgent size={16} />,
  },
  {
    tab: ActiveTab.Managers,
    labelKey: "screens.Dashboard.Tenants.AdvancedManagement.tabs.managers",
    icon: <GrUserManager size={16} />,
  },
  {
    tab: ActiveTab.Advanced,
    labelKey: "screens.Dashboard.Tenants.AdvancedManagement.tabs.advanced",
    icon: <MdManageAccounts size={16} />,
  },
  {
    tab: ActiveTab.Integrations,
    labelKey: "screens.Dashboard.Tenants.AdvancedManagement.tabs.integrations",
    icon: <MdOutlineIntegrationInstructions size={16} />,
  },
];

export default function AdvancedManagement() {
  const { t } = useTranslation();

  const params = useParams();

  const dispatch = useDispatch();

  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = useMemo(() => {
    const tab = searchParams.get("tab");

    if (!tab || !Object.values(ActiveTab).includes(tab as ActiveTab)) {
      return ActiveTab.Overview;
    }

    return tab as ActiveTab;
  }, [searchParams]);

  const tenantId = useMemo(() => {
    if (!params.tenantId) return null;

    return params.tenantId as string;
  }, [params.tenantId]);

  const [
    isCreateConnectionStringModalOpen,
    setIsCreateConnectionStringModalOpen,
  ] = useState(false);

  const [
    isCreateSubscriptionManagerAccountModalOpen,
    setIsCreateSubscriptionManagerAccountModalOpen,
  ] = useState(false);

  const handleCreateConnectionStringModalOpen = () => {
    setIsCreateConnectionStringModalOpen(true);
  };

  const handleCreateConnectionStringModalClose = () => {
    setIsCreateConnectionStringModalOpen(false);
  };

  const handleCreateConnectionStringModalSuccess = () => {
    setIsCreateConnectionStringModalOpen(false);
  };

  const handleCreateSubscriptionManagerAccountModalOpen = () => {
    setIsCreateSubscriptionManagerAccountModalOpen(true);
  };

  const handleCreateSubscriptionManagerAccountModalClose = () => {
    setIsCreateSubscriptionManagerAccountModalOpen(false);
  };

  const handleCreateSubscriptionManagerAccountModalSuccess = () => {
    setIsCreateSubscriptionManagerAccountModalOpen(false);
  };

  const [
    isCreateManagementAccountModalOpen,
    setIsCreateManagementAccountModalOpen,
  ] = useState(false);

  const [isDeleteTenantModalOpen, setIsDeleteTenantModalOpen] =
    useState(false);

  const handleDeleteTenantModalClose = () => {
    setIsDeleteTenantModalOpen(false);
    // Re-checks tenant status on close (cancel or actual delete) — if it was
    // deleted, this flips tenantStatus to "unknown" and the existing
    // deleted-tenant screen below takes over, instead of waiting up to 2min
    // for the next scheduled refresh.
    mutateTenantStatus();
  };

  const {
    hasEnoughPermissions,
    isLoadingUser,
    isLoadingProfile,
    getAccessTokenSilently,
  } = useProfile({
    roles: [MycRole.TenantManager],
    permissions: [MycPermission.Read, MycPermission.Write],
    restrictSystemAccount: true,
    tenantOwnerNeeded: [tenantId ?? ""],
  });

  const swrKey = useMemo(
    () =>
      tenantId ? ["rpc", "tenantManager.tenant.get", tenantId] : null,
    [tenantId]
  );

  const {
    data: tenantStatus,
    isLoading: isLoadingTenantStatus,
    error: tenantStatusError,
    mutate: mutateTenantStatus,
  } = useSWR<TenantStatus>(
    swrKey,
    async ([, , id]: [string, string, string]) => {
      try {
        const tenant = await tenantGet(
          { tenantId: id },
          getAccessTokenSilently
        );
        return { active: tenant };
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : String(err);
        if (msg.includes("403") || msg.includes("Unauthorized")) {
          return "unauthorized";
        }
        return "unknown";
      }
    },
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      refreshInterval: 1000 * 60 * 2,
    }
  );

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
    <>
      <BasePage>
        <Section gap="fixed">
          <Section.Header>
            <IntroSection
              prefix={t(
                "screens.Dashboard.Tenants.AdvancedManagement.name.prefix"
              )}
              content={activeTenant?.name}
              title={t(
                "screens.Dashboard.Tenants.AdvancedManagement.name.title"
              )}
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
            </IntroSection>
          </Section.Header>

          <Section.Body>
            <Link
              to={`/dashboard/tenants/${tenantId}/accounts`}
              className="flex gap-2 items-center align-center hover:underline text-lg text-brand-violet-500 dark:text-brand-violet-500 mt-2"
              title={t(
                "screens.Dashboard.Tenants.AdvancedManagement.manageAccountsDescription"
              )}
            >
              <MdManageAccounts
                size={24}
                className="inline text-brand-violet-500 dark:text-brand-violet-500"
              />
              {t("screens.Dashboard.Tenants.AdvancedManagement.manageAccounts")}
            </Link>
          </Section.Body>
        </Section>

        {activeTenant && (
          <div className="flex flex-col sm:flex-row gap-0 w-full h-full">
            <VerticalTabNav
              items={NAV_ITEMS}
              activeTab={activeTab}
              onSelect={(tab) => setSearchParams({ tab })}
              t={t}
            />

            {/* Tab content */}
            <div className="flex-1 min-w-0 pt-4 sm:pt-0 sm:pl-6">
              {activeTab === ActiveTab.Overview && (
                <Overview
                  tenant={activeTenant}
                  onNavigate={(tab) => setSearchParams({ tab })}
                />
              )}

              {activeTab === ActiveTab.Notifications && (
                <NotificationsCard
                  tenant={activeTenant}
                  mutateTenantStatus={mutateTenantStatus}
                />
              )}

              {activeTab === ActiveTab.Brand && (
                <BrandCard
                  tenant={activeTenant}
                  mutateTenantStatus={mutateTenantStatus}
                />
              )}

              {activeTab === ActiveTab.LegalInformation && (
                <LegalSettings
                  tenant={activeTenant}
                  mutateTenantStatus={mutateTenantStatus}
                />
              )}

              {activeTab === ActiveTab.Owners && (
                <OwnersCard
                  tenant={activeTenant}
                  mutateTenantStatus={mutateTenantStatus}
                />
              )}

              {activeTab === ActiveTab.Managers && (
                <ManagersCard
                  tenant={activeTenant}
                  mutateTenantStatus={mutateTenantStatus}
                />
              )}

              {activeTab === ActiveTab.Integrations && activeTenant && (
                <TelegramConfigCard tenant={activeTenant} />
              )}

              {activeTab === ActiveTab.Advanced && (
                <Card padding="sm" group scroll={false}>
                  <Card.Header>
                    <div className="flex flex-col gap-2">
                      <Typography as="h6">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {t(
                              "screens.Dashboard.Tenants.AdvancedManagement.advanced.title"
                            )}
                          </div>
                        </div>
                      </Typography>
                    </div>
                  </Card.Header>

                  <Card.Body>
                    <div className="flex flex-col gap-4">
                      <Banner intent="warning" width="full">
                        <div className="flex flex-col sm:flex-row justify-between gap-2 my-5">
                          <div className="flex flex-col gap-2">
                            <Typography as="h4" decoration="semibold">
                              {t(
                                "screens.Dashboard.Tenants.AdvancedManagement.createConnectionString.title"
                              )}
                            </Typography>

                            <Typography decoration="smooth" as="p" width="md">
                              {t(
                                "screens.Dashboard.Tenants.AdvancedManagement.createConnectionString.description"
                              )}
                            </Typography>
                          </div>

                          <div>
                            <Button
                              onClick={handleCreateConnectionStringModalOpen}
                            >
                              {t(
                                "screens.Dashboard.Tenants.AdvancedManagement.createConnectionString.button"
                              )}
                            </Button>
                          </div>
                        </div>
                      </Banner>

                      <Banner intent="info" width="full">
                        <div className="flex justify-between gap-2 my-5">
                          <div className="flex flex-col gap-2">
                            <Typography as="h4" decoration="semibold">
                              {t(
                                "screens.Dashboard.Tenants.AdvancedManagement.createSubscriptionManagerAccount.title"
                              )}
                            </Typography>

                            <Typography decoration="smooth" as="p" width="md">
                              {t(
                                "screens.Dashboard.Tenants.AdvancedManagement.createSubscriptionManagerAccount.description"
                              )}
                            </Typography>
                          </div>

                          <div>
                            <Button
                              onClick={
                                handleCreateSubscriptionManagerAccountModalOpen
                              }
                            >
                              {t(
                                "screens.Dashboard.Tenants.AdvancedManagement.createSubscriptionManagerAccount.button"
                              )}
                            </Button>
                          </div>
                        </div>
                      </Banner>

                      <Banner intent="info" width="full">
                        <div className="flex justify-between gap-2 my-5">
                          <div className="flex flex-col gap-2">
                            <Typography as="h4" decoration="semibold">
                              {t(
                                "screens.Dashboard.Tenants.TenantDetails.createManagementAccount.title"
                              )}
                            </Typography>

                            <Typography decoration="smooth" as="p" width="md">
                              {t(
                                "screens.Dashboard.Tenants.TenantDetails.createManagementAccount.description"
                              )}
                            </Typography>
                          </div>

                          <div>
                            <Button
                              intent="info"
                              onClick={() =>
                                setIsCreateManagementAccountModalOpen(true)
                              }
                            >
                              {t(
                                "screens.Dashboard.Tenants.TenantDetails.createManagementAccount.button"
                              )}
                            </Button>
                          </div>
                        </div>
                      </Banner>

                      <Banner intent="error" width="full">
                        <div className="flex justify-between gap-2 my-5">
                          <div className="flex flex-col gap-2">
                            <Typography as="h4" decoration="semibold">
                              {t(
                                "screens.Dashboard.Tenants.TenantDetails.deleteTenant.title"
                              )}
                            </Typography>

                            <Typography decoration="smooth" as="p" width="md">
                              {t(
                                "screens.Dashboard.Tenants.TenantDetails.deleteTenant.description"
                              )}
                            </Typography>
                          </div>

                          <div>
                            <Button
                              intent="danger"
                              onClick={() => setIsDeleteTenantModalOpen(true)}
                            >
                              {t(
                                "screens.Dashboard.Tenants.TenantDetails.deleteTenant.button"
                              )}
                            </Button>
                          </div>
                        </div>
                      </Banner>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </div>
          </div>
        )}
      </BasePage>

      <CreateConnectionStringModal
        isOpen={isCreateConnectionStringModalOpen}
        onClose={handleCreateConnectionStringModalClose}
        onSuccess={handleCreateConnectionStringModalSuccess}
        tenantId={tenantId}
      />

      <CreateSubscriptionManagerAccountModal
        isOpen={isCreateSubscriptionManagerAccountModalOpen}
        onClose={handleCreateSubscriptionManagerAccountModalClose}
        onSuccess={handleCreateSubscriptionManagerAccountModalSuccess}
      />

      <CreateManagementAccount
        isOpen={isCreateManagementAccountModalOpen}
        tenantId={tenantId}
        onClose={() => setIsCreateManagementAccountModalOpen(false)}
      />

      {activeTenant && (
        <DeleteTenant
          tenant={activeTenant}
          isOpen={isDeleteTenantModalOpen}
          onClose={handleDeleteTenantModalClose}
        />
      )}
    </>
  );
}
