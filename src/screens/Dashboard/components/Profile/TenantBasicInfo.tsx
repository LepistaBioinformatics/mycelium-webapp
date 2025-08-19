import { TenantResolverChildProps } from "./TenantResolver";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import { SYSTEM_TENANT_ID } from "@/constants/zero-tenant";
import IntroSection from "@/components/ui/IntroSection";
import { useTranslation } from "react-i18next";

interface Props extends TenantResolverChildProps {
  tenantId: string;
  omitPrefix?: boolean;
}

export default function TenantBasicInfo({
  tenantStatus,
  isLoading,
  error,
  tenantId,
  omitPrefix,
}: Props) {
  const { t } = useTranslation();

  //
  // System accounts with system roles receives a zero-uuid as tenantId
  //
  if (tenantId === SYSTEM_TENANT_ID) {
    return null;
  }

  //
  // If the tenant is unknown or the tenant is being loaded, don't show anything
  //
  if (isLoading || !tenantStatus || error) {
    return null;
  }

  const Item = ({ status }: { status: string }) => (
    <IntroSection.Item
      title={t("screens.Dashboard.TenantBasicInfo.from.title", {
        tenantId,
      })}
    >
      <span className="flex items-center justify-start gap-1">
        <span>{status}</span>
        <CopyToClipboard text={tenantId} />
      </span>
    </IntroSection.Item>
  );

  //
  // If the tenant is deleted, show the tenantId
  //
  if (tenantStatus === "deleted") {
    return <Item status="Tenant Deleted" />;
  }

  //
  // If the tenant is unknown, show the tenantId
  //
  if (tenantStatus === "unknown") {
    return <Item status="Copy ID to Clipboard" />;
  }

  //
  // If the tenant is unauthorized, show the tenantId
  //
  if (tenantStatus === "unauthorized") {
    return <Item status="Copy ID to Clipboard" />;
  }

  //
  // If the tenant is known, show the tenant name
  //
  return (
    <IntroSection.Item
      prefix={
        omitPrefix
          ? undefined
          : t("screens.Dashboard.TenantBasicInfo.from.prefix")
      }
      title={t("screens.Dashboard.TenantBasicInfo.from.title", {
        tenantId,
      })}
    >
      {tenantStatus?.active?.name}
    </IntroSection.Item>
  );
}
