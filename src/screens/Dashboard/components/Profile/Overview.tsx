import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";
import { MdManageAccounts, MdOutlineLinkOff, MdContactPhone } from "react-icons/md";
import { SlOrganization } from "react-icons/sl";
import { IoOptions, IoSettingsOutline } from "react-icons/io5";
import { ActiveTab } from "./active-tab";

type Profile = components["schemas"]["Profile"];

const BASE = "screens.Dashboard.Profile.Overview";

const CONTACT_INFO_FIELD_KEYS = [
  "phone_number",
  "emergency_contact_name",
  "emergency_contact_phone",
  "job_title",
];

interface Props {
  profile: Profile | null;
  contactInfo: Record<string, string>;
  licensedResourcesCount: number;
  tenantsOwnershipCount: number;
  onNavigate: (tab: ActiveTab) => void;
}

interface Tile {
  tab: ActiveTab;
  icon: ReactNode;
  labelKey: string;
  status: string;
}

export default function Overview({
  profile,
  contactInfo,
  licensedResourcesCount,
  tenantsOwnershipCount,
  onNavigate,
}: Props) {
  const { t } = useTranslation();

  const telegramLinked = !!profile?.meta?.["telegram_user"];

  const contactInfoCount = CONTACT_INFO_FIELD_KEYS.filter(
    (key) => contactInfo[key]
  ).length;

  const tiles: Tile[] = [
    {
      tab: ActiveTab.LicensedResources,
      icon: <MdManageAccounts size={20} />,
      labelKey: "screens.Dashboard.LicensedResourcesSection.tabName",
      status:
        licensedResourcesCount > 0
          ? t(`${BASE}.licensedResourcesCount`, {
              count: licensedResourcesCount,
            })
          : t(`${BASE}.noLicensedResources`),
    },
    {
      tab: ActiveTab.TenantOwnership,
      icon: <SlOrganization size={20} />,
      labelKey: "screens.Dashboard.TenantOwnershipSection.tabName",
      status:
        tenantsOwnershipCount > 0
          ? t(`${BASE}.tenantsCount`, { count: tenantsOwnershipCount })
          : t(`${BASE}.noTenants`),
    },
    {
      tab: ActiveTab.ListConnectionStrings,
      icon: <IoOptions size={20} />,
      labelKey: "screens.Dashboard.ListConnectionStringsSection.tabName",
      status: t(`${BASE}.manage`),
    },
    {
      tab: ActiveTab.AdvancedOptions,
      icon: <IoSettingsOutline size={20} />,
      labelKey: "screens.Dashboard.AdvancedOptionsModal.tabName",
      status: t(`${BASE}.manage`),
    },
    {
      tab: ActiveTab.TelegramIdentity,
      icon: <MdOutlineLinkOff size={20} />,
      labelKey: "screens.Dashboard.TelegramIdentity.tabName",
      status: t(telegramLinked ? `${BASE}.telegramLinked` : `${BASE}.telegramNotLinked`),
    },
    {
      tab: ActiveTab.ContactInfo,
      icon: <MdContactPhone size={20} />,
      labelKey: "screens.Dashboard.Profile.ContactInfoSection.tabName",
      status: t(`${BASE}.contactInfoFieldsFilled`, {
        count: contactInfoCount,
        total: CONTACT_INFO_FIELD_KEYS.length,
      }),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {tiles.map((tile) => (
        <button
          key={tile.tab}
          type="button"
          onClick={() => onNavigate(tile.tab)}
          className="flex flex-col gap-1 text-left p-3 rounded-lg border border-brand-600 shadow-sm dark:shadow-none bg-white dark:bg-brand-950 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            {tile.icon}
            <Typography as="h6">{t(tile.labelKey)}</Typography>
          </div>
          <Typography as="small" decoration="faded">
            {tile.status}
          </Typography>
        </button>
      ))}
    </div>
  );
}
