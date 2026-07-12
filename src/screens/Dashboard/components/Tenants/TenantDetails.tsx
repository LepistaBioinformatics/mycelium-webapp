import Button from "@/components/ui/Button";
import SideCurtain from "@/components/ui/SideCurtain";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import useProfile from "@/hooks/use-profile";
import { tenantsGetPublicInfo } from "@/services/rpc/beginners";
import { components } from "@/services/openapi/mycelium-schema";
import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaRegStar, FaStar } from "react-icons/fa";
import { RootState } from "@/states/store";
import { setTenantInfo } from "@/states/tenant.state";
import DetailsBox from "@/components/ui/DetailsBox";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import { useNavigate } from "react-router";
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
}

export default function TenantDetails({ isOpen, onClose, tenant }: Props) {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { profile, getAccessTokenSilently } = useProfile();

  const [openedSection, setOpenedSection] = useState<OpenedSection>(
    OpenedSection.Details
  );

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

      tenantsGetPublicInfo({ tenantId }, getAccessTokenSilently)
        .then((data) => dispatch(setTenantInfo(data)))
        .catch((err) => console.error(err));
    },
    [tenantInfo, getAccessTokenSilently, dispatch]
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
                  className="text-zinc-500"
                  onClick={() => setTokenPublicInformation(tenant.id)}
                />
              )}
            </span>

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
          {t("screens.Dashboard.Tenants.TenantDetails.details")}
        </DetailsBox.Summary>

        <DetailsBox.Content minHeight="50">
          <div className="flex flex-col gap-8">
            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.Tenants.TenantDetails.created.prefix"
              )}
              title={t("screens.Dashboard.Tenants.TenantDetails.created.title")}
            >
              {formatDDMMYY(new Date(tenant.created), true)}
            </IntroSection.Item>

            {tenant.updated && (
              <IntroSection.Item
                prefix={t(
                  "screens.Dashboard.Tenants.TenantDetails.updated.prefix"
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
                  "screens.Dashboard.Tenants.TenantDetails.owners.prefix"
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
                  "screens.Dashboard.Tenants.TenantDetails.manager.prefix"
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
                "screens.Dashboard.Tenants.TenantDetails.tenantId.prefix"
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

            <Button
              fullWidth
              onClick={() => navigate(`/dashboard/tenants/${tenant.id}`)}
            >
              <span className="flex items-center justify-center gap-2">
                <MdManageAccounts size={18} />
                {t(
                  "screens.Dashboard.Tenants.TenantDetails.name.viewDetailsButton"
                )}
              </span>
            </Button>
          </div>
        </DetailsBox.Content>
      </DetailsBox>
    </SideCurtain>
  );
}
