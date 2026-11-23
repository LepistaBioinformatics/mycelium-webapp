import { ReactNode } from "react";
import Skeleton from "@/components/ui/Skeleton";
import { useTranslation } from "react-i18next";
import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";
import { MdManageAccounts, MdOutlineLinkOff, MdContactPhone } from "react-icons/md";
import { SlOrganization } from "react-icons/sl";
import { IoOptions } from "react-icons/io5";
import { ActiveTab } from "./active-tab";

type Profile = components["schemas"]["Profile"];

const BASE = "screens.Dashboard.Profile.Overview";

const CONTACT_INFO_FIELD_KEYS = [
  "phone_number",
  "job_title",
];

interface Props {
  profile: Profile | null;
  /** `undefined` while the account (which holds the contact info) loads. */
  contactInfo: Record<string, string> | undefined;
  licensedResourcesCount: number;
  tenantsOwnershipCount: number;
  onNavigate: (tab: ActiveTab) => void;
}

interface Tile {
  tab: ActiveTab;
  icon: ReactNode;
  labelKey: string;
  status: ReactNode;
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
    (key) => contactInfo?.[key]
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
      tab: ActiveTab.TelegramIdentity,
      icon: <MdOutlineLinkOff size={20} />,
      labelKey: "screens.Dashboard.TelegramIdentity.tabName",
      status: t(telegramLinked ? `${BASE}.telegramLinked` : `${BASE}.telegramNotLinked`),
    },
    {
      tab: ActiveTab.ContactInfo,
      icon: <MdContactPhone size={20} />,
      labelKey: "screens.Dashboard.Profile.ContactInfoSection.tabName",
      status: contactInfo ? (
        t(`${BASE}.contactInfoFieldsFilled`, {
          count: contactInfoCount,
          total: CONTACT_INFO_FIELD_KEYS.length,
        })
      ) : (
        <Skeleton className="w-28 mt-1" />
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {tiles.map((tile) => (
        <button
          key={tile.tab}
          type="button"
          onClick={() => onNavigate(tile.tab)}
          className="flex flex-col gap-1 text-left p-3 rounded-lg border border-border bg-card shadow-xs hover:shadow-card hover:border-brand-600/30 dark:hover:border-brand-400/30 transition-[box-shadow,border-color]"
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
