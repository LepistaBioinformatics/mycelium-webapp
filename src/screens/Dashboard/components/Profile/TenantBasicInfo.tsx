import { SYSTEM_TENANT_ID } from "@/constants/zero-tenant";
import IntroSection from "@/components/ui/IntroSection";
import { useTranslation } from "react-i18next";

interface Props {
  tenantId: string;
  omitPrefix?: boolean;
  tenantName?: string;
}

export default function TenantBasicInfo({
  tenantId,
  tenantName,
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
      {tenantName}
    </IntroSection.Item>
  );
}
