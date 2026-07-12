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
import ContactInfoSection from "./ContactInfoSection";
import { GiWizardStaff } from "react-icons/gi";
import { GrUserAdmin } from "react-icons/gr";
import IntroSection from "@/components/ui/IntroSection";
import { useTranslation } from "react-i18next";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import CreateConnectionStringModal from "../CreateConnectionStringModal";
import Button from "@/components/ui/Button";
import Banner from "@/components/ui/Banner";
import Card from "@/components/ui/Card";
import VerticalTabNav from "@/components/ui/VerticalTabNav";
import { SlOrganization } from "react-icons/sl";
import { MdManageAccounts } from "react-icons/md";
import { IoOptions } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineLinkOff } from "react-icons/md";
import { MdContactPhone } from "react-icons/md";
import { MdOutlineDashboard } from "react-icons/md";
import { useSearchParams } from "react-router";
import useSWR, { useSWRConfig } from "swr";
import { accountsGet } from "@/services/rpc/beginners";
import HoldToReveal from "@/components/ui/HoldToReveal";
import Overview from "./Overview";
import { ActiveTab } from "./active-tab";

type Profile = components["schemas"]["Profile"];
type Account = components["schemas"]["Account"];

interface NavItem {
  tab: ActiveTab;
  labelKey: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    tab: ActiveTab.Overview,
    labelKey: "screens.Dashboard.Profile.Overview.tabName",
    icon: <MdOutlineDashboard size={16} />,
  },
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
  {
    tab: ActiveTab.ContactInfo,
    labelKey: "screens.Dashboard.Profile.ContactInfoSection.tabName",
    icon: <MdContactPhone size={16} />,
  },
];

export default function Profile() {
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();

  const { mutate } = useSWRConfig();

  const { user, profile, isLoadingUser, getAccessTokenSilently } =
    useProfile();

  const { data: account } = useSWR<Account | null>(
    "rpc:beginners.accounts.get",
    () => accountsGet(getAccessTokenSilently),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const contactInfo = (account?.meta ?? {}) as Record<string, string>;

  const principalOwner = useMemo(() => {
    if (!profile?.owners || profile.owners.length === 0) return null;
    return (
      profile.owners.find((owner) => owner.isPrincipal) ??
      profile.owners[0] ??
      null
    );
  }, [profile?.owners]);

  const displayName = useMemo(() => {
    // account.name defaults to the user's email at signup (see
    // Onboarding/index.tsx's accountsCreate call) — only treat it as a
    // registered display name once it's been edited away from that default.
    const email = user?.email
      ? `${user.email.username}@${user.email.domain}`
      : "";
    if (account?.name && account.name !== email) return account.name;

    const firstName = principalOwner?.firstName ?? user?.firstName ?? "";
    const lastName = principalOwner?.lastName ?? user?.lastName ?? "";
    return `${firstName} ${lastName}`.trim();
  }, [account?.name, principalOwner, user]);

  const activeTab = useMemo(() => {
    const tab = searchParams.get("tab");

    if (!tab || !Object.values(ActiveTab).includes(tab as ActiveTab)) {
      return ActiveTab.Overview;
    }

    return tab as ActiveTab;
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
                        <Typography truncate>{displayName}</Typography>

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

                  {contactInfo.phone_number && (
                    <IntroSection.Item
                      prefix={t(
                        "screens.Dashboard.Profile.personalInfo.phoneNumber"
                      )}
                    >
                      <HoldToReveal value={contactInfo.phone_number} />
                    </IntroSection.Item>
                  )}

                  {contactInfo.emergency_contact_name && (
                    <IntroSection.Item
                      prefix={t(
                        "screens.Dashboard.Profile.personalInfo.emergencyContactName"
                      )}
                    >
                      <HoldToReveal
                        value={contactInfo.emergency_contact_name}
                      />
                    </IntroSection.Item>
                  )}

                  {contactInfo.emergency_contact_phone && (
                    <IntroSection.Item
                      prefix={t(
                        "screens.Dashboard.Profile.personalInfo.emergencyContactPhone"
                      )}
                    >
                      <HoldToReveal
                        value={contactInfo.emergency_contact_phone}
                      />
                    </IntroSection.Item>
                  )}
                </IntroSection>
              )}
            </Section.Header>
          </Section>

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
                  profile={profile}
                  contactInfo={contactInfo}
                  licensedResourcesCount={licensedResources?.length ?? 0}
                  tenantsOwnershipCount={tenantsOwnership?.length ?? 0}
                  onNavigate={(tab) => setSearchParams({ tab })}
                />
              )}

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

              {activeTab === ActiveTab.ContactInfo && <ContactInfoSection />}

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
