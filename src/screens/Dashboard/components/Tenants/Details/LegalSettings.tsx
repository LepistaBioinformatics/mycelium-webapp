import Card from "@/components/ui/Card";
import IntroSection from "@/components/ui/IntroSection";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import { useMemo, useState } from "react";
import { MdEdit } from "react-icons/md";
import EditMetadataModal from "./EditMetadataModal";
import { useTranslation } from "react-i18next";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";

type Tenant = components["schemas"]["Tenant"];
type TenantMetaKey = components["schemas"]["TenantMetaKey"];

interface Props {
  tenant: Tenant;
  mutateTenantStatus: () => void;
}

export default function LegalSettings({ tenant, mutateTenantStatus }: Props) {
  const { t } = useTranslation();

  const [isEditMetadataModalOpen, setIsEditMetadataModalOpen] = useState(false);
  const [editMetadataKey, setEditMetadataKey] = useState<TenantMetaKey | null>(
    null
  );
  const [editMetadataValue, setEditMetadataValue] = useState<string | null>(
    null
  );

  const { hasEnoughPermissions } = useProfile({
    tenantOwnerNeeded: [tenant.id ?? ""],
    roles: [MycRole.TenantManager],
    permissions: [MycPermission.Read],
    restrictSystemAccount: true,
  });

  const handleEditMetadata = (key: TenantMetaKey, value: string) => {
    setEditMetadataKey(key);
    setEditMetadataValue(value);
    setIsEditMetadataModalOpen(true);
  };

  const handleOnSuccess = () => {
    setIsEditMetadataModalOpen(false);
    setEditMetadataKey(null);
    setEditMetadataValue(null);
    mutateTenantStatus();
  };

  const handleOnClose = () => {
    setIsEditMetadataModalOpen(false);
    setEditMetadataKey(null);
    setEditMetadataValue(null);
    mutateTenantStatus();
  };

  const frr = useMemo(() => {
    if (!tenant?.meta) return null;

    return tenant?.meta?.["federal_revenue_register"];
  }, [tenant?.meta]);

  const frrType = useMemo(() => {
    if (!tenant?.meta) return null;

    return tenant?.meta?.["federal_revenue_register_type"];
  }, [tenant?.meta]);

  const country = useMemo(() => {
    if (!tenant?.meta) return null;

    return tenant?.meta?.["country"];
  }, [tenant?.meta]);

  const state = useMemo(() => {
    if (!tenant?.meta) return null;

    return tenant?.meta?.["state"];
  }, [tenant?.meta]);

  const city = useMemo(() => {
    if (!tenant?.meta) return null;

    return tenant?.meta?.["city"];
  }, [tenant?.meta]);

  const address1 = useMemo(() => {
    if (!tenant?.meta) return null;

    return tenant?.meta?.["address1"];
  }, [tenant?.meta]);

  const address2 = useMemo(() => {
    if (!tenant?.meta) return null;

    return tenant?.meta?.["address2"];
  }, [tenant?.meta]);

  const zipCode = useMemo(() => {
    if (!tenant?.meta) return null;

    return tenant?.meta?.["zip_code"];
  }, [tenant?.meta]);

  if (!hasEnoughPermissions) {
    return null;
  }

  const NotSet = ({
    metadataKey,
    value,
  }: {
    metadataKey: TenantMetaKey;
    value: string;
  }) => (
    <MdEdit
      className="cursor-pointer text-indigo-500 dark:text-lime-400 hover:scale-150 transition-all duration-200"
      title="Edit"
      onClick={() => handleEditMetadata(metadataKey, value)}
    />
  );

  const Set = ({
    metaKey,
    value,
    children,
  }: { metaKey: TenantMetaKey; value: string } & BaseProps) => (
    <Typography as="span" decoration="light" width="xxs" truncate>
      <span
        className="lg:text-end gap-1 cursor-pointer hover:underline hover:text-indigo-500 dark:hover:text-lime-400 transition-all duration-200"
        onDoubleClick={() => handleEditMetadata(metaKey, value)}
        title="Double click to edit"
      >
        {children}
      </span>
    </Typography>
  );

  return (
    <>
      <Card padding="sm" height="adaptive" group>
        <Card.Header>
          <div className="flex flex-col gap-2">
            <Typography as="h5">
              {t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.title"
              )}
            </Typography>

            <Typography as="span" decoration="smooth" width="sm">
              {t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.description"
              )}
            </Typography>
          </div>
        </Card.Header>

        <Card.Body>
          <IntroSection
            prefix={t(
              "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.name.prefix"
            )}
            title={t(
              "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.name.title"
            )}
            content={tenant?.name}
            as="h3"
          >
            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.federalRevenueRegister.prefix"
              )}
              title={t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.federalRevenueRegister.title"
              )}
              fullWidth
              linkLine
            >
              {frr ? (
                <Set metaKey="federal_revenue_register" value={frr ?? ""}>
                  {frr}
                </Set>
              ) : (
                <NotSet
                  metadataKey="federal_revenue_register"
                  value={frr ?? ""}
                />
              )}
            </IntroSection.Item>

            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.federalRevenueRegisterType.prefix"
              )}
              title={t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.federalRevenueRegisterType.title"
              )}
              fullWidth
              linkLine
            >
              {frrType ? (
                <Set
                  metaKey="federal_revenue_register_type"
                  value={frrType ?? ""}
                >
                  {frrType}
                </Set>
              ) : (
                <NotSet
                  metadataKey="federal_revenue_register_type"
                  value={frrType ?? ""}
                />
              )}
            </IntroSection.Item>

            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.country.prefix"
              )}
              title={t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.country.title"
              )}
              fullWidth
              linkLine
            >
              {country ? (
                <Set metaKey="country" value={country ?? ""}>
                  {country}
                </Set>
              ) : (
                <NotSet metadataKey="country" value={country ?? ""} />
              )}
            </IntroSection.Item>

            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.state.prefix"
              )}
              title={t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.state.title"
              )}
              fullWidth
              linkLine
            >
              {state ? (
                <Set metaKey="state" value={state ?? ""}>
                  {state}
                </Set>
              ) : (
                <NotSet metadataKey="state" value={state ?? ""} />
              )}
            </IntroSection.Item>

            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.city.prefix"
              )}
              title={t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.city.title"
              )}
              fullWidth
              linkLine
            >
              {city ? (
                <Set metaKey="city" value={city ?? ""}>
                  {city}
                </Set>
              ) : (
                <NotSet metadataKey="city" value={city ?? ""} />
              )}
            </IntroSection.Item>

            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.zipCode.prefix"
              )}
              title={t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.zipCode.title"
              )}
              fullWidth
              linkLine
            >
              {zipCode ? (
                <Set metaKey="zip_code" value={zipCode ?? ""}>
                  {zipCode}
                </Set>
              ) : (
                <NotSet metadataKey="zip_code" value={zipCode ?? ""} />
              )}
            </IntroSection.Item>

            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.address1.prefix"
              )}
              title={t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.address1.title"
              )}
              fullWidth
              linkLine
              contentProps={{
                className: "text-sm text-base sm:text-end w-fit",
              }}
            >
              {address1 ? (
                <Set metaKey="address1" value={address1 ?? ""}>
                  {address1}
                </Set>
              ) : (
                <NotSet metadataKey="address1" value={address1 ?? ""} />
              )}
            </IntroSection.Item>

            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.address2.prefix"
              )}
              title={t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings.address2.title"
              )}
              fullWidth
              linkLine
              contentProps={{
                className: "text-sm text-base sm:text-end w-fit",
              }}
            >
              {address2 ? (
                <Set metaKey="address2" value={address2 ?? ""}>
                  {address2}
                </Set>
              ) : (
                <NotSet metadataKey="address2" value={address2 ?? ""} />
              )}
            </IntroSection.Item>
          </IntroSection>
        </Card.Body>
      </Card>

      {tenant.id && (
        <EditMetadataModal
          isOpen={isEditMetadataModalOpen}
          onClose={handleOnClose}
          onSuccess={handleOnSuccess}
          tenantId={tenant.id}
          editMetadataKey={editMetadataKey}
          editMetadataValue={editMetadataValue}
        />
      )}
    </>
  );
}
