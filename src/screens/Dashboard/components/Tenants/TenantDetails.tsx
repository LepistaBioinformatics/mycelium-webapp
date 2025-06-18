import Button from "@/components/ui/Button";
import SideCurtain from "@/components/ui/SideCurtain";
import Typography from "@/components/ui/Typography";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import useProfile from "@/hooks/use-profile";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { useCallback, useMemo, useState } from "react";
import DeleteTenant from "./DeleteTenant";
import { useDispatch, useSelector } from "react-redux";
import { FaRegStar, FaStar } from "react-icons/fa";
import { RootState } from "@/states/store";
import { setTenantInfo } from "@/states/tenant.state";
import Banner from "@/components/ui/Banner";
import CreateManagementAccount from "./CreateManagementAccount";
import DetailsBox from "@/components/ui/DetailsBox";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import { Link } from "react-router";
import IntroSection from "@/components/ui/IntroSection";
import { useTranslation } from "react-i18next";
import { MdManageAccounts } from "react-icons/md";

type Tenant = components["schemas"]["Tenant"];

interface Props {
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
}

enum OpenedSection {
  Details,
  AssociatedAccounts,
  AdvancedActions,
}

export default function TenantDetails({ isOpen, onClose, tenant }: Props) {
  const { t } = useTranslation();

  const { profile, getAccessTokenSilently } = useProfile();

  const [openedSection, setOpenedSection] = useState<OpenedSection>(
    OpenedSection.Details
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [
    isCreateManagementAccountModalOpen,
    setIsCreateManagementAccountModalOpen,
  ] = useState(false);

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const dispatch = useDispatch();

  const handleToggleSection = (
    section: OpenedSection,
    state: "open" | "closed"
  ) => {
    if (state === "open") setOpenedSection(section);
  };

  const setTokenPublicInformation = useCallback(
    async (tenantId: string | null | undefined) => {
      if (!tenantId) return;

      if (tenantInfo?.id === tenantId) {
        dispatch(setTenantInfo(null));
        return;
      }

      const token = await getAccessTokenSilently();

      await fetch(
        buildPath("/adm/rs/beginners/tenants/{tenant_id}", {
          path: { tenant_id: tenantId },
        }),
        { headers: { Authorization: `Bearer ${token}` } }
      )
        .then((res) => res.json())
        .then((data) => dispatch(setTenantInfo(data)))
        .catch((err) => console.error(err));
    },
    [tenantInfo, getAccessTokenSilently]
  );

  const owners = useMemo(() => {
    if (!tenant) return null;

    if ("ids" in tenant.owners) {
      const tenantOwners = tenant.owners.ids;

      if (
        tenantOwners.includes(
          profile?.owners.find((owner) => owner.isPrincipal)?.id ?? ""
        )
      ) {
        if (tenantOwners.length === 1) {
          return "You";
        } else {
          return <>You and {tenantOwners.length - 1} other</>;
        }
      }

      return null;
    }
  }, [tenant, profile?.owners]);

  const manager = useMemo(() => {
    if (!tenant.manager) return null;

    if ("record" in tenant.manager) {
      return tenant.manager.record;
    }

    return null;
  }, [tenant.manager]);

  return (
    <SideCurtain
      open={isOpen}
      title={t("screens.Dashboard.Tenants.TenantDetails.title")}
      handleClose={onClose}
    >
      <IntroSection
        prefix={t("screens.Dashboard.Tenants.TenantDetails.name.prefix")}
        content={
          <div className="flex items-center gap-5">
            <span>{tenant.name}</span>
            <span
              className="cursor-pointer"
              title={t(
                "screens.Dashboard.Tenants.TenantDetails.name.makeTenantFavorite"
              )}
            >
              {tenantInfo?.id === tenant.id ? (
                <FaStar
                  className="text-yellow-300"
                  onClick={() => setTokenPublicInformation(tenant.id)}
                />
              ) : (
                <FaRegStar
                  className="text-gray-500"
                  onClick={() => setTokenPublicInformation(tenant.id)}
                />
              )}
            </span>

            <Link
              to={`/dashboard/tenants/${tenant.id}`}
              title={t(
                "screens.Dashboard.Tenants.TenantDetails.name.viewTenantAdvancedDetails"
              )}
              className="cursor-pointer"
            >
              <MdManageAccounts size={24} />
            </Link>
          </div>
        }
        title={t("screens.Dashboard.Tenants.TenantDetails.name.title")}
      >
        <IntroSection.Item
          prefix={t(
            "screens.Dashboard.Tenants.TenantDetails.description.prefix"
          )}
          title={t("screens.Dashboard.Tenants.TenantDetails.description.title")}
        >
          {tenant.description}
        </IntroSection.Item>
      </IntroSection>

      <DetailsBox
        open={openedSection === OpenedSection.Details}
        onToggle={(state) => handleToggleSection(OpenedSection.Details, state)}
      >
        <DetailsBox.Summary>
          <Typography as="span">
            {t("screens.Dashboard.Tenants.TenantDetails.details")}
          </Typography>
        </DetailsBox.Summary>

        <DetailsBox.Content minHeight="50">
          <div className="flex flex-col gap-8">
            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.Tenants.TenantDetails.created.title"
              )}
              title={t("screens.Dashboard.Tenants.TenantDetails.created.title")}
            >
              {formatDDMMYY(new Date(tenant.created), true)}
            </IntroSection.Item>

            {tenant.updated && (
              <IntroSection.Item
                prefix={t(
                  "screens.Dashboard.Tenants.TenantDetails.updated.title"
                )}
                title={t(
                  "screens.Dashboard.Tenants.TenantDetails.updated.title"
                )}
              >
                {formatDDMMYY(new Date(tenant.updated), true)}
              </IntroSection.Item>
            )}

            {owners && (
              <IntroSection.Item
                prefix={t(
                  "screens.Dashboard.Tenants.TenantDetails.owners.title"
                )}
                title={t(
                  "screens.Dashboard.Tenants.TenantDetails.owners.title"
                )}
              >
                {owners}
              </IntroSection.Item>
            )}

            {manager && (
              <IntroSection.Item
                prefix={t(
                  "screens.Dashboard.Tenants.TenantDetails.manager.title"
                )}
                title={t(
                  "screens.Dashboard.Tenants.TenantDetails.manager.title"
                )}
              >
                {manager.name}
              </IntroSection.Item>
            )}

            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.Tenants.TenantDetails.tenantId.title"
              )}
              title={t(
                "screens.Dashboard.Tenants.TenantDetails.tenantId.title"
              )}
            >
              <span className="flex items-center gap-2 group group/clip truncate">
                {tenant.id}
                <CopyToClipboard text={tenant.id ?? ""} groupHidden />
              </span>
            </IntroSection.Item>
          </div>
        </DetailsBox.Content>
      </DetailsBox>

      <DetailsBox
        open={openedSection === OpenedSection.AdvancedActions}
        onToggle={(state) =>
          handleToggleSection(OpenedSection.AdvancedActions, state)
        }
      >
        <DetailsBox.Summary>
          <Typography as="span">
            {t("screens.Dashboard.Tenants.TenantDetails.advancedActions")}
          </Typography>
        </DetailsBox.Summary>

        <DetailsBox.Content minHeight="50">
          <Banner intent="info">
            <div className="flex justify-between gap-2 my-5">
              <div className="flex flex-col gap-2">
                <Typography as="span">
                  {t(
                    "screens.Dashboard.Tenants.TenantDetails.createManagementAccount.title"
                  )}
                </Typography>

                <Typography as="small" decoration="smooth">
                  {t(
                    "screens.Dashboard.Tenants.TenantDetails.createManagementAccount.description"
                  )}
                </Typography>
              </div>

              <div>
                <Button
                  rounded
                  intent="info"
                  onClick={() => setIsCreateManagementAccountModalOpen(true)}
                >
                  {t(
                    "screens.Dashboard.Tenants.TenantDetails.createManagementAccount.button"
                  )}
                </Button>
              </div>
            </div>
          </Banner>

          <Banner intent="error">
            <div className="flex justify-between gap-2 my-5">
              <div className="flex flex-col gap-2">
                <Typography as="span">
                  {t(
                    "screens.Dashboard.Tenants.TenantDetails.deleteTenant.title"
                  )}
                </Typography>

                <Typography as="small" decoration="smooth">
                  {t(
                    "screens.Dashboard.Tenants.TenantDetails.deleteTenant.description"
                  )}
                </Typography>
              </div>

              <div>
                <Button
                  rounded
                  intent="danger"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  {t(
                    "screens.Dashboard.Tenants.TenantDetails.deleteTenant.button"
                  )}
                </Button>
              </div>
            </div>
          </Banner>
        </DetailsBox.Content>
      </DetailsBox>

      <CreateManagementAccount
        isOpen={isCreateManagementAccountModalOpen}
        tenantId={tenant.id}
        onClose={() => setIsCreateManagementAccountModalOpen(false)}
      />

      <DeleteTenant
        tenant={tenant}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </SideCurtain>
  );
}
