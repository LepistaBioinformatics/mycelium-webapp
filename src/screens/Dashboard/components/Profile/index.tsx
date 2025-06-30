import PageBody from "@/components/ui/PageBody";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import { useMemo } from "react";
import { RiDashboardFill } from "react-icons/ri";
import CardsSection from "@/components/ui/CardsSection";
import getTenantsOwnershipOrNull from "@/functions/get-tenant-ownership-or-null";
import getLicensedResourcesOrNull from "@/functions/get-licensed-resources-or-null";
import PermissionsDetails from "./PermissionsDetails";
import ControlPanelBreadcrumbItem from "../ControlPanelBreadcrumbItem";
import TenantOwnershipSection from "./TenantOwnershipSection";
import LicensedResourcesSection from "./LicensedResourcesSection";
import { GiWizardStaff } from "react-icons/gi";
import { GrUserAdmin } from "react-icons/gr";
import IntroSection from "@/components/ui/IntroSection";
import { useTranslation } from "react-i18next";
import SeeMoreText from "@/components/ui/SeeMoreText";
import CopyToClipboard from "@/components/ui/CopyToClipboard";

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

  return (
    <PageBody padding="md" height="fit">
      <PageBody.Breadcrumb>
        <ControlPanelBreadcrumbItem />
        <PageBody.Breadcrumb.Item icon={RiDashboardFill}>
          {t("screens.Dashboard.Profile.title")}
        </PageBody.Breadcrumb.Item>
      </PageBody.Breadcrumb>

      <PageBody.Content padding="md" container flex="col" gap={12}>
        <CardsSection>
          <CardsSection.Header>
            {isLoadingUser ? (
              <Typography>{t("screens.Dashboard.Profile.loading")}</Typography>
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
          </CardsSection.Header>

          <CardsSection.Body>
            <div className="flex flex-col gap-3 w-full mt-12 h-full">
              <div>
                <Typography decoration="smooth" as="h3">
                  {t("screens.Dashboard.Profile.relationship")}
                </Typography>

                <Typography decoration="smooth" width="md">
                  <SeeMoreText
                    text={t(
                      "screens.Dashboard.Profile.relationshipDescription"
                    )}
                    maxLength={100}
                  />
                </Typography>
              </div>

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-8 sm:gap-3 w-full h-full">
                <TenantOwnershipSection tenantsOwnership={tenantsOwnership} />
                <LicensedResourcesSection
                  licensedResources={licensedResources}
                />
              </div>
            </div>
          </CardsSection.Body>
        </CardsSection>

        {licensedResources && profile && (
          <PermissionsDetails profile={profile} />
        )}
      </PageBody.Content>
    </PageBody>
  );
}
