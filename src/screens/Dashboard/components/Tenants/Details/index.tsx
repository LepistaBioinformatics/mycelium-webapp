"use client";

import { TabItem, Tabs } from "flowbite-react";
import AuthorizedOr from "@/components/ui/AuthorizedOr";
import PageBody from "@/components/ui/PageBody";
import useProfile from "@/hooks/use-profile";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import ControlPanelBreadcrumbItem from "../../ControlPanelBreadcrumbItem";
import { SlOrganization } from "react-icons/sl";
import useTenantDetails from "@/hooks/use-tenant-details";
import { buildPath } from "@/services/openapi/mycelium-api";
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
import { useTranslation } from "react-i18next";
import {
  MdImagesearchRoller,
  MdManageAccounts,
  MdOutlineRealEstateAgent,
} from "react-icons/md";
import CreateConnectionStringModal from "../../CreateConnectionStringModal";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import CreateSubscriptionManagerAccountModal from "./CreateSubscriptionManagerAccountModal";
import { GoLaw } from "react-icons/go";
import { GrUserManager } from "react-icons/gr";
import Card from "@/components/ui/Card";

enum ActiveTab {
  LegalInformation = 0,
  Owners = 1,
  Managers = 2,
  Brand = 3,
  Advanced = 4,
}

export default function AdvancedManagement() {
  const { t } = useTranslation();

  const params = useParams();

  const dispatch = useDispatch();

  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = useMemo(() => {
    const tab = searchParams.get("tab");

    if (!tab) return ActiveTab.LegalInformation;

    return parseInt(tab) as ActiveTab;
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

  const { hasEnoughPermissions, isLoadingUser, isLoadingProfile } = useProfile({
    roles: [MycRole.TenantManager],
    permissions: [MycPermission.Read, MycPermission.Write],
    restrictSystemAccount: true,
    tenantOwnerNeeded: [tenantId ?? ""],
  });

  const customUrl = useMemo(() => {
    if (!tenantId) return null;

    return buildPath("/_adm/tenant-manager/tenants/{tenant_id}", {
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
          </Section.Body>
        </Section>

        {activeTenant && (
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-8 sm:gap-3 w-full h-full">
            <Tabs
              onActiveTabChange={(tab) => {
                setSearchParams({ tab: tab.toString() });
              }}
              aria-label=""
              variant="fullWidth"
              className="w-full overflow-x-auto"
              color="zinc"
              theme={{
                tablist: {
                  base: "flex text-center border dark:border-none",
                  variant: {
                    fullWidth:
                      "grid w-full grid-flow-col divide-x divide-zinc-200 rounded-none text-sm font-medium shadow dark:divide-zinc-700 text-zinc-500 dark:text-zinc-400",
                  },
                  tabitem: {
                    variant: {
                      fullWidth: {
                        active: {
                          on: "rounded-none bg-zinc-100 p-4 text-zinc-900 dark:bg-zinc-700 dark:text-white",
                          off: "rounded-none bg-white hover:bg-zinc-50 hover:text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-white",
                        },
                      },
                    },
                  },
                },
              }}
            >
              <TabItem
                active={activeTab === ActiveTab.LegalInformation}
                title={
                  <span className="whitespace-nowrap">
                    {t(
                      "screens.Dashboard.Tenants.AdvancedManagement.tabs.legalInformation"
                    )}
                  </span>
                }
                icon={GoLaw}
              >
                <LegalSettings
                  tenant={activeTenant}
                  mutateTenantStatus={mutateTenantStatus}
                />
              </TabItem>

              <TabItem
                active={activeTab === ActiveTab.Owners}
                title={
                  <span className="whitespace-nowrap">
                    {t(
                      "screens.Dashboard.Tenants.AdvancedManagement.tabs.owners"
                    )}
                  </span>
                }
                icon={MdOutlineRealEstateAgent}
              >
                <OwnersCard
                  tenant={activeTenant}
                  mutateTenantStatus={mutateTenantStatus}
                />
              </TabItem>

              <TabItem
                active={activeTab === ActiveTab.Managers}
                title={
                  <span className="whitespace-nowrap">
                    {t(
                      "screens.Dashboard.Tenants.AdvancedManagement.tabs.managers"
                    )}
                  </span>
                }
                icon={GrUserManager}
              >
                <ManagersCard
                  tenant={activeTenant}
                  mutateTenantStatus={mutateTenantStatus}
                />
              </TabItem>

              <TabItem
                active={activeTab === ActiveTab.Brand}
                title={
                  <span className="whitespace-nowrap">
                    {t(
                      "screens.Dashboard.Tenants.AdvancedManagement.tabs.brand"
                    )}
                  </span>
                }
                icon={MdImagesearchRoller}
              >
                <BrandCard
                  tenant={activeTenant}
                  mutateTenantStatus={mutateTenantStatus}
                />
              </TabItem>

              <TabItem
                active={activeTab === ActiveTab.Advanced}
                title={
                  <span className="whitespace-nowrap">
                    {t(
                      "screens.Dashboard.Tenants.AdvancedManagement.tabs.advanced"
                    )}
                  </span>
                }
                icon={MdManageAccounts}
              >
                <Card padding="sm" group>
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
                              rounded
                            >
                              {t(
                                "screens.Dashboard.Tenants.AdvancedManagement.createConnectionString.button"
                              )}
                            </Button>
                          </div>
                        </div>
                      </Banner>

                      <Banner intent="warning" width="full">
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
                              rounded
                            >
                              {t(
                                "screens.Dashboard.Tenants.AdvancedManagement.createSubscriptionManagerAccount.button"
                              )}
                            </Button>
                          </div>
                        </div>
                      </Banner>
                    </div>
                  </Card.Body>
                </Card>
              </TabItem>
            </Tabs>
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
    </>
  );
}
