import { MdLogout } from "react-icons/md";
import Typography from "@/components/ui/Typography";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import { useCallback } from "react";
import { TenantResolverChildProps } from "./TenantResolver";
import MiniBox from "@/components/ui/MiniBox";
import IntroSection from "@/components/ui/IntroSection";
import { Link } from "react-router";
import { TenantTagTypes } from "@/types/TenantTagTypes";
import { useTranslation } from "react-i18next";

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
            className="w-full h-full object-cover hover:scale-[3] hover:translate-x-3 hover:translate-y-3 rounded-full hover:rounded-sm transition-all duration-200 hover:border-[0.1px] border-blue-500 dark:border-lime-500 hover:shadow-lg bg-white dark:bg-gray-800"
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
  }, [tenantStatus]);

  return (
    <MiniBox>
      <div className="flex items-center justify-between gap-3">
        <TenantData />
        <Link to={`/dashboard/tenants/${tenantId}`}>
          <MdLogout className="text-blue-500 dark:text-lime-500" />
        </Link>
      </div>

      {error && (
        <Typography as="small" isError>
          {error.message}
        </Typography>
      )}
    </MiniBox>
  );
}
