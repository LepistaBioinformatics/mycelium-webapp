"use client";

import PageBody from "@/components/ui/PageBody";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import { useMemo, useState } from "react";
import { RiDashboardFill } from "react-icons/ri";
import Section from "@/components/ui/Section";
import getTenantsOwnershipOrNull from "@/functions/get-tenant-ownership-or-null";
import getLicensedResourcesOrNull from "@/functions/get-licensed-resources-or-null";
import ControlPanelBreadcrumbItem from "../ControlPanelBreadcrumbItem";
import TenantOwnershipSection from "./TenantOwnershipSection";
import LicensedResourcesSection from "./LicensedResourcesSection";
import ListConnectionStringsSection from "./ListConnectionStringsSection";
import IdentitySection from "./IdentitySection";
import { GiWizardStaff } from "react-icons/gi";
import { GrUserAdmin } from "react-icons/gr";
import IntroSection from "@/components/ui/IntroSection";
import { useTranslation } from "react-i18next";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import CreateConnectionStringModal from "../CreateConnectionStringModal";
import Button from "@/components/ui/Button";
import Banner from "@/components/ui/Banner";
import Card from "@/components/ui/Card";
import { SlOrganization } from "react-icons/sl";
import { MdManageAccounts } from "react-icons/md";
import { IoOptions } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineLinkOff } from "react-icons/md";
import { useSearchParams } from "react-router";
import { useSWRConfig } from "swr";

enum ActiveTab {
  LicensedResources = 0,
  TenantOwnership = 1,
  ListConnectionStrings = 2,
  AdvancedOptions = 3,
  TelegramIdentity = 4,
}

type Profile = components["schemas"]["Profile"];

interface NavItem {
  tab: ActiveTab;
  labelKey: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    tab: ActiveTab.LicensedResources,
    labelKey: "screens.Dashboard.LicensedResourcesSection.tabName",
    icon: <MdManageAccounts size={16} />,
  },
  {
    tab: ActiveTab.TenantOwnership,
    labelKey: "screens.Dashboard.TenantOwnershipSection.tabName",
    icon: <SlOrganization size={16} />,
  },
  {
    tab: ActiveTab.ListConnectionStrings,
    labelKey: "screens.Dashboard.ListConnectionStringsSection.tabName",
    icon: <IoOptions size={16} />,
  },
  {
    tab: ActiveTab.AdvancedOptions,
    labelKey: "screens.Dashboard.AdvancedOptionsModal.tabName",
    icon: <IoSettingsOutline size={16} />,
  },
  {
    tab: ActiveTab.TelegramIdentity,
    labelKey: "screens.Dashboard.TelegramIdentity.tabName",
    icon: <MdOutlineLinkOff size={16} />,
  },
];

export default function Profile() {
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();

  const { mutate } = useSWRConfig();

  const { user, profile, isLoadingUser } = useProfile();

  const activeTab = useMemo(() => {
    const tab = searchParams.get("tab");

    if (!tab) return ActiveTab.LicensedResources;

    return parseInt(tab) as ActiveTab;
  }, [searchParams]);

  const tenantsOwnership = useMemo(
    () => getTenantsOwnershipOrNull(profile?.tenantsOwnership),
    [profile?.tenantsOwnership]
  );

  const licensedResources = useMemo(
    () => getLicensedResourcesOrNull(profile?.licensedResources),
    [profile?.licensedResources]
  );

  const [
    isCreateConnectionStringModalOpen,
    setIsCreateConnectionStringModalOpen,
  ] = useState(false);

  const handleCreateConnectionStringModalOpen = () => {
    setIsCreateConnectionStringModalOpen(true);
  };

  const handleCreateConnectionStringModalClose = () => {
    setIsCreateConnectionStringModalOpen(false);
  };

  const handleCreateConnectionStringModalSuccess = () => {
    setIsCreateConnectionStringModalOpen(false);
    mutate(["rpc", "beginners.tokens.list"]);
  };

  return (
    <>
      <PageBody padding="md" height="fit">
        <PageBody.Breadcrumb>
          <ControlPanelBreadcrumbItem />
          <PageBody.Breadcrumb.Item icon={RiDashboardFill}>
            {t("screens.Dashboard.Profile.title")}
          </PageBody.Breadcrumb.Item>
        </PageBody.Breadcrumb>

        <PageBody.Content padding="md" container flex="col" gap={12}>
          <Section>
            <Section.Header>
              {isLoadingUser ? (
                <Typography>
                  {t("screens.Dashboard.Profile.loading")}
                </Typography>
              ) : (
                <IntroSection
                  prefix={t("screens.Dashboard.Profile.loggedInAs.prefix")}
                  content={
                    <Typography
                      as="h1"
                      title={t("screens.Dashboard.Profile.loggedInAs.title")}
                    >
                      <div className="flex items-start sm:items-center flex-col sm:flex-row gap-3">
                        <Typography truncate>
                          {user
                            ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                            : ""}
                        </Typography>

                        <div className="flex items-center gap-3">
                          {profile?.isStaff && (
                            <GiWizardStaff
                              className="inline text-brand-violet-500 dark:text-brand-violet-500 hover:cursor-help p-0.5"
                              title={t(
                                "screens.Dashboard.Profile.loggedInAs.staff"
                              )}
                            />
                          )}
                          {profile?.isManager && (
                            <GrUserAdmin
                              className="inline text-brand-violet-500 dark:text-brand-violet-500 hover:cursor-help p-0.5"
                              title={t(
                                "screens.Dashboard.Profile.loggedInAs.manager"
                              )}
                            />
                          )}
                        </div>
                      </div>
                    </Typography>
                  }
                  as="div"
                >
                  <IntroSection.Item
                    prefix={t("screens.Dashboard.Profile.email.prefix")}
                    title={t("screens.Dashboard.Profile.email.title")}
                  >
                    <span className="group/clip flex items-center gap-1">
                      {user?.email
                        ? `${user.email.username}@${user.email.domain}`
                        : ""}
                      <CopyToClipboard
                        text={
                          user?.email
                            ? `${user.email.username}@${user.email.domain}`
                            : ""
                        }
                        groupHidden
                      />
                    </span>
                  </IntroSection.Item>
                </IntroSection>
              )}
            </Section.Header>

            <Section.Body>
              <div className="flex flex-col gap-3 w-full mt-12 h-full">
                <div>
                  <Typography decoration="smooth" as="h3">
                    {t("screens.Dashboard.Profile.relationship")}
                  </Typography>
                </div>

                <div className="flex flex-col sm:flex-row gap-0 w-full h-full">
                  {/* Vertical nav — desktop left rail, mobile top bar */}
                  <nav className="flex flex-row sm:flex-col sm:w-40 shrink-0 border-b sm:border-b-0 sm:border-r border-zinc-200 dark:border-zinc-800 overflow-x-auto sm:overflow-x-visible scrollbar">
                    {NAV_ITEMS.map(({ tab, labelKey, icon }) => {
                      const isActive = activeTab === tab;
                      return (
                        <button
                          key={tab}
                          onClick={() =>
                            setSearchParams({ tab: tab.toString() })
                          }
                          className={[
                            "flex items-center gap-2 px-3 py-2.5 text-sm whitespace-nowrap sm:whitespace-normal transition-colors w-full text-left",
                            "border-b-2 sm:border-b-0 sm:border-l-2",
                            isActive
                              ? "border-brand-violet-500 dark:border-brand-violet-400 text-brand-violet-700 dark:text-brand-violet-300 bg-brand-violet-50 dark:bg-brand-violet-950"
                              : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800",
                          ].join(" ")}
                        >
                          <span className="shrink-0">{icon}</span>
                          <span>{t(labelKey)}</span>
                        </button>
                      );
                    })}
                  </nav>

                  {/* Tab content */}
                  <div className="flex-1 min-w-0 pt-4 sm:pt-0 sm:pl-6">
                    {activeTab === ActiveTab.LicensedResources && (
                      <LicensedResourcesSection
                        licensedResources={licensedResources}
                      />
                    )}

                    {activeTab === ActiveTab.TenantOwnership && (
                      <TenantOwnershipSection
                        tenantsOwnership={tenantsOwnership}
                      />
                    )}

                    {activeTab === ActiveTab.ListConnectionStrings && (
                      <ListConnectionStringsSection />
                    )}

                    {activeTab === ActiveTab.TelegramIdentity && (
                      <IdentitySection profile={profile} />
                    )}

                    {activeTab === ActiveTab.AdvancedOptions && (
                      <Card padding="sm" width="alwaysFull" height="adaptive">
                        <Card.Header>
                          <Typography as="h5" decoration="faded">
                            {t(
                              "screens.Dashboard.LicensedResourcesSection.title"
                            )}
                          </Typography>
                        </Card.Header>

                        <Card.Body width="full">
                          <Banner intent="warning">
                            <div className="flex flex-col sm:flex-row justify-between gap-2 my-5">
                              <div className="flex flex-col gap-2">
                                <Typography as="h4" decoration="semibold">
                                  {t(
                                    "screens.Dashboard.Profile.createConnectionString.title"
                                  )}
                                </Typography>

                                <Typography
                                  decoration="smooth"
                                  as="p"
                                  width="md"
                                >
                                  {t(
                                    "screens.Dashboard.Profile.createConnectionString.description"
                                  )}
                                </Typography>
                              </div>

                              <div>
                                <Button
                                  onClick={handleCreateConnectionStringModalOpen}
                                >
                                  {t(
                                    "screens.Dashboard.Profile.createConnectionString.button"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </Banner>
                        </Card.Body>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </Section.Body>
          </Section>
        </PageBody.Content>
      </PageBody>

      <CreateConnectionStringModal
        isOpen={isCreateConnectionStringModalOpen}
        onClose={handleCreateConnectionStringModalClose}
        onSuccess={handleCreateConnectionStringModalSuccess}
      />
    </>
  );
}
