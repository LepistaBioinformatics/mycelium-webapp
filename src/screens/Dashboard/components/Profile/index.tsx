"use client";

import PageBody from "@/components/ui/PageBody";
import { TabItem, Tabs } from "flowbite-react";
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

type Profile = components["schemas"]["Profile"];

export default function Profile() {
  const { t } = useTranslation();

  const { user, profile, isLoadingUser } = useProfile();

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
                        <Typography truncate>{user?.name}</Typography>

                        <div className="flex items-center gap-3">
                          {profile?.isStaff && (
                            <GiWizardStaff
                              className="inline text-indigo-500 dark:text-lime-500 hover:cursor-help p-0.5"
                              title={t(
                                "screens.Dashboard.Profile.loggedInAs.staff"
                              )}
                            />
                          )}
                          {profile?.isManager && (
                            <GrUserAdmin
                              className="inline text-indigo-500 dark:text-lime-500 hover:cursor-help p-0.5"
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
                      {user?.email}
                      <CopyToClipboard text={user?.email || ""} groupHidden />
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
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-8 sm:gap-3 w-full h-full">
                  <Tabs
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
                      active
                      title={
                        <span className="whitespace-nowrap">
                          {t(
                            "screens.Dashboard.LicensedResourcesSection.tabName"
                          )}
                        </span>
                      }
                      icon={MdManageAccounts}
                    >
                      <LicensedResourcesSection
                        licensedResources={licensedResources}
                      />
                    </TabItem>

                    <TabItem
                      title={
                        <span className="whitespace-nowrap">
                          {t(
                            "screens.Dashboard.TenantOwnershipSection.tabName"
                          )}
                        </span>
                      }
                      icon={SlOrganization}
                      className="mx-2"
                    >
                      <TenantOwnershipSection
                        tenantsOwnership={tenantsOwnership}
                      />
                    </TabItem>

                    <TabItem
                      title={
                        <span className="whitespace-nowrap">
                          {t(
                            "screens.Dashboard.CreateConnectionStringModal.tabName"
                          )}
                        </span>
                      }
                      icon={IoOptions}
                    >
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
                                  onClick={
                                    handleCreateConnectionStringModalOpen
                                  }
                                  rounded
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
                    </TabItem>
                  </Tabs>
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
