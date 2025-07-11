import { MdManageAccounts } from "react-icons/md";
import Typography from "@/components/ui/Typography";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import { useCallback } from "react";
import { TenantResolverChildProps } from "./TenantResolver";
import MiniBox from "@/components/ui/MiniBox";
import IntroSection from "@/components/ui/IntroSection";
import { Link } from "react-router";
import { TenantTagTypes } from "@/types/TenantTagTypes";
import { useTranslation } from "react-i18next";
import { IoMdMore } from "react-icons/io";
import { FaGear } from "react-icons/fa6";

interface Props extends TenantResolverChildProps {
  since: string;
}

export default function TenantOwnershipInfo({
  since,
  tenantId,
  tenantStatus,
  isLoading,
  error,
}: Props) {
  const { t } = useTranslation();

  const title = t("screens.Dashboard.TenantOwnershipInfo.title", {
    tenantId,
  });

  const Since = () => (
    <IntroSection.Item
      prefix={t("screens.Dashboard.TenantOwnershipInfo.since.prefix")}
      title={t("screens.Dashboard.TenantOwnershipInfo.since.title", {
        tenantId,
      })}
    >
      {formatDDMMYY(new Date(since), true)}
    </IntroSection.Item>
  );

  const TenantData = useCallback(() => {
    if (isLoading || !tenantStatus || error) {
      return <Since />;
    }

    if (tenantStatus === "deleted" || tenantStatus === "unknown") {
      return (
        <div>
          <Since />
          <IntroSection.Item prefix="status" title={title}>
            {tenantStatus === "deleted"
              ? t("screens.Dashboard.TenantOwnershipInfo.deleted")
              : t("screens.Dashboard.TenantOwnershipInfo.unknown")}
          </IntroSection.Item>
        </div>
      );
    }

    if (tenantStatus === "unauthorized") {
      return (
        <div>
          <Since />
          <IntroSection.Item prefix="status" title={title} isError>
            {t("screens.Dashboard.TenantOwnershipInfo.unauthorized")}
          </IntroSection.Item>
        </div>
      );
    }

    const TenantLogo = () => {
      const tags = tenantStatus.active.tags;
      if (!tags) return null;

      const tenantLogo = tags?.find(
        (tag: any) => tag?.value === TenantTagTypes.Brand
      )?.meta?.base64Logo;

      if (tenantLogo) {
        return (
          <img
            src={tenantLogo}
            alt="Tenant logo"
            title={t("screens.Dashboard.TenantOwnershipInfo.logo")}
            className="w-full h-full object-cover rounded-full transition-all duration-200 hover:border-[0.1px] border-indigo-500 dark:border-lime-500 hover:shadow-lg bg-white dark:bg-gray-800"
            style={{
              width: "24px",
              height: "24px",
              objectFit: "cover",
            }}
          />
        );
      }

      return null;
    };

    return (
      <div>
        <IntroSection
          content={
            <div className="flex items-center gap-2">
              <TenantLogo />
              <span
                title={t("screens.Dashboard.TenantOwnershipInfo.name")}
                className="cursor-help"
              >
                {tenantStatus.active.name}
              </span>
            </div>
          }
          as="h3"
        >
          <Since />
          <IntroSection.Item
            prefixProps={{ nowrap: true }}
            prefix={t(
              "screens.Dashboard.TenantOwnershipInfo.description.prefix"
            )}
            title={t("screens.Dashboard.TenantOwnershipInfo.description.title")}
          >
            {tenantStatus.active.description}
          </IntroSection.Item>
        </IntroSection>
      </div>
    );
  }, [Since, error, isLoading, t, tenantStatus, title]);

  return (
    <MiniBox>
      <div className="flex items-center justify-between gap-3 group">
        <TenantData />
        <div className="h-full flex items-center justify-center">
          <IoMdMore className="text-3xl hidden sm:block group-hover:hidden transition-all duration-500" />

          <div className="min-h-full sm:hidden sm:group-hover:block transition-all duration-500">
            <div className="flex flex-col items-center gap-12 sm:gap-4">
              <Link
                to={`/dashboard/tenants/${tenantId}`}
                className="flex flex-col items-center gap-2 p-1 rounded-lg bg-indigo-500 dark:bg-lime-500"
                title={t("screens.Dashboard.TenantOwnershipInfo.manageTenant")}
              >
                <FaGear size={18} className="text-zinc-50 dark:text-zinc-900" />
              </Link>

              <Link
                to={`/dashboard/tenants/${tenantId}/accounts`}
                className="flex flex-col items-center gap-2 p-1 rounded-lg bg-indigo-500 dark:bg-lime-500"
                title={t(
                  "screens.Dashboard.TenantOwnershipInfo.manageAccounts"
                )}
              >
                <MdManageAccounts
                  size={18}
                  className="text-zinc-50 dark:text-zinc-900"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Typography as="small" isError>
          {error.message}
        </Typography>
      )}
    </MiniBox>
  );
}
