import { buttonStyles } from "@/components/ui/button-styles";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import { ArrowRight } from "lucide-react";
import { MdManageAccounts } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

interface Props {
  since: string;
  tenantId: string;
  tenantName?: string;
}

/**
 * One namespace the user owns. The row opens the namespace; "See accounts"
 * goes straight to its accounts.
 */
export function TenantOwnershipListItem({ since, tenantId, tenantName }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <li
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-xs transition-[box-shadow,border-color] hover:shadow-card hover:border-brand-600/40 dark:hover:border-brand-400/30 cursor-pointer"
      onClick={() => navigate(`/dashboard/tenants/${tenantId}`)}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <Link
          to={`/dashboard/tenants/${tenantId}`}
          onClick={(event) => event.stopPropagation()}
          className="font-display text-lg font-semibold text-primary dark:text-brand-300 hover:underline truncate rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {tenantName || "---"}
        </Link>
        <span
          className="text-sm text-muted-foreground"
          title={t("screens.Dashboard.TenantOwnershipInfo.since.title", {
            tenantId,
          })}
        >
          {t("screens.Dashboard.TenantOwnershipInfo.since.prefix")}{" "}
          {formatDDMMYY(new Date(since), true)}
        </span>
      </div>

      <Link
        to={`/dashboard/tenants/${tenantId}/accounts`}
        onClick={(event) => event.stopPropagation()}
        title={t("screens.Dashboard.TenantOwnershipInfo.manageAccounts")}
        className={`${buttonStyles({ intent: "primary", size: "xs" })} group/link w-fit shrink-0`}
      >
        <MdManageAccounts size={16} />
        {t("screens.Dashboard.TenantOwnershipInfo.manageAccounts")}
        <ArrowRight
          aria-hidden
          className="size-3.5 transition-transform group-hover/link:translate-x-0.5"
        />
      </Link>
    </li>
  );
}
