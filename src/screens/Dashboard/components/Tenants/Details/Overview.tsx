import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";
import { TenantTagTypes } from "@/types/TenantTagTypes";
import { LEGAL_FIELD_KEYS } from "./legal-field-keys";
import {
  MdImagesearchRoller,
  MdOutlineRealEstateAgent,
  MdOutlineIntegrationInstructions,
  MdNotificationsNone,
} from "react-icons/md";
import { GoLaw } from "react-icons/go";
import { GrUserManager } from "react-icons/gr";
import { ActiveTab } from "./active-tab";

type Tenant = components["schemas"]["Tenant"];
type Parent_Account_String = components["schemas"]["Parent_Account_String"];

const NOTIFICATIONS_FIELD_KEYS = ["locale", "website_url", "support_email"];

const BASE = "screens.Dashboard.Tenants.AdvancedManagement";

interface Props {
  tenant: Tenant;
  onNavigate: (tab: ActiveTab) => void;
}

interface Tile {
  tab: ActiveTab;
  icon: ReactNode;
  labelKey: string;
  status: string;
}

export default function Overview({ tenant, onNavigate }: Props) {
  const { t } = useTranslation();

  const meta = (tenant.meta ?? {}) as Record<string, string>;

  const notificationsCount = NOTIFICATIONS_FIELD_KEYS.filter(
    (key) => meta[key]
  ).length;

  const legalCount = LEGAL_FIELD_KEYS.filter(
    (key) => meta[key as string]
  ).length;

  const brandConfigured =
    tenant.tags?.some((tag) => tag.value === TenantTagTypes.Brand) ?? false;

  const ownersCount =
    tenant.owners && "records" in tenant.owners
      ? tenant.owners.records.length
      : 0;

  const managerConfigured =
    "manager" in tenant &&
    "record" in (tenant.manager as Parent_Account_String);

  const tiles: Tile[] = [
    {
      tab: ActiveTab.Notifications,
      icon: <MdNotificationsNone size={20} />,
      labelKey: `${BASE}.tabs.notifications`,
      status: t(`${BASE}.overview.fieldsFilled`, {
        count: notificationsCount,
        total: NOTIFICATIONS_FIELD_KEYS.length,
      }),
    },
    {
      tab: ActiveTab.Brand,
      icon: <MdImagesearchRoller size={20} />,
      labelKey: `${BASE}.tabs.brand`,
      status: t(
        brandConfigured
          ? `${BASE}.overview.configured`
          : `${BASE}.overview.notConfigured`
      ),
    },
    {
      tab: ActiveTab.LegalInformation,
      icon: <GoLaw size={20} />,
      labelKey: `${BASE}.tabs.legalInformation`,
      status: t(`${BASE}.overview.fieldsFilled`, {
        count: legalCount,
        total: LEGAL_FIELD_KEYS.length,
      }),
    },
    {
      tab: ActiveTab.Owners,
      icon: <MdOutlineRealEstateAgent size={20} />,
      labelKey: `${BASE}.tabs.owners`,
      status:
        ownersCount > 0
          ? t(`${BASE}.overview.ownersCount`, { count: ownersCount })
          : t(`${BASE}.overview.noOwners`),
    },
    {
      tab: ActiveTab.Managers,
      icon: <GrUserManager size={20} />,
      labelKey: `${BASE}.tabs.managers`,
      status: t(
        managerConfigured
          ? `${BASE}.overview.managerConfigured`
          : `${BASE}.overview.managerNotConfigured`
      ),
    },
    {
      tab: ActiveTab.Integrations,
      icon: <MdOutlineIntegrationInstructions size={20} />,
      labelKey: `${BASE}.tabs.integrations`,
      status: t(`${BASE}.overview.manageIntegration`),
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
