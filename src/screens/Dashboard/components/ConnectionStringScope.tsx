import CopyToClipboard from "@/components/ui/CopyToClipboard";
import PermissionBadge from "@/components/ui/PermissionBadge";
import { cn } from "@/lib/utils";
import { MycPermission } from "@/types/MyceliumPermission";
import { Building2, Check, ShieldAlert, UserRound, Users } from "lucide-react";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

const PREFIX = "screens.Dashboard.AdvancedOptionsModal.scope";

export type PermissionedRole = {
  role: string;
  permission: MycPermission;
};

interface Props {
  tenantId?: string | null;
  tenantName?: ReactNode;
  accountId?: string | null;
  accountName?: ReactNode;
  roles?: PermissionedRole[] | null;
  isRoleIncluded: (role: PermissionedRole) => boolean;
  onToggleRole: (role: PermissionedRole) => void;
  locked: boolean;
}

/**
 * What a connection string will be able to reach: the namespace, the account
 * and the roles it is restricted to, shown by name with the id underneath.
 */
export default function ConnectionStringScope({
  tenantId,
  tenantName,
  accountId,
  accountName,
  roles,
  isRoleIncluded,
  onToggleRole,
  locked,
}: Props) {
  const { t } = useTranslation();

  const hasRoles = !!roles && roles.length > 0;
  const isUnrestricted = !tenantId && !accountId && !hasRoles;
  const includedCount = roles?.filter(isRoleIncluded).length ?? 0;

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-background/60 p-4 dark:bg-surface-900/40">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {t(`${PREFIX}.title`)}
        </span>
        <span className="text-sm text-muted-foreground">
          {t(`${PREFIX}.description`)}
        </span>
      </div>

      {isUnrestricted && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <span>{t(`${PREFIX}.unrestricted`)}</span>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {tenantId && (
          <ScopeRow
            icon={<Building2 className="size-4" />}
            label={t(`${PREFIX}.tenant.label`)}
            hint={t(`${PREFIX}.tenant.hint`)}
            name={tenantName}
            id={tenantId}
          />
        )}

        {accountId && (
          <ScopeRow
            icon={<UserRound className="size-4" />}
            label={t(`${PREFIX}.account.label`)}
            hint={t(`${PREFIX}.account.hint`)}
            name={accountName}
            id={accountId}
          />
        )}

        {hasRoles && (
          <li className="flex flex-col gap-2 rounded-lg border border-border bg-card px-3 py-2.5 shadow-xs">
            <RowHeading
              icon={<Users className="size-4" />}
              label={t(`${PREFIX}.roles.label`)}
              aside={t(`${PREFIX}.roles.count`, {
                included: includedCount,
                total: roles.length,
              })}
            />
            <span className="text-xs text-muted-foreground">
              {t(`${PREFIX}.roles.hint`)}
            </span>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <RoleChip
                  key={`${role.role}-${role.permission}`}
                  role={role}
                  included={isRoleIncluded(role)}
                  disabled={locked}
                  onToggle={() => onToggleRole(role)}
                />
              ))}
            </div>
            {includedCount === 0 && (
              <span className="text-xs text-red-700 dark:text-red-300">
                {t(`${PREFIX}.roles.noneSelected`)}
              </span>
            )}
          </li>
        )}
      </ul>
    </section>
  );
}

function RowHeading({
  icon,
  label,
  aside,
}: {
  icon: ReactNode;
  label: string;
  aside?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-brand-700 dark:text-brand-300">
        {icon}
        {label}
      </span>
      {aside && (
        <span className="text-xs text-muted-foreground">{aside}</span>
      )}
    </div>
  );
}

function ScopeRow({
  icon,
  label,
  hint,
  name,
  id,
}: {
  icon: ReactNode;
  label: string;
  hint: string;
  name?: ReactNode;
  id: string;
}) {
  return (
    <li className="flex flex-col gap-1 rounded-lg border border-border bg-card px-3 py-2.5 shadow-xs group/clip">
      <RowHeading icon={icon} label={label} />
      <span className="min-w-0 truncate font-medium text-foreground">
        {name ?? (
          <span className="inline-block h-4 w-40 animate-pulse rounded bg-muted" />
        )}
      </span>
      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
        <span className="truncate">{id}</span>
        <CopyToClipboard text={id} inline size="sm" />
      </span>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </li>
  );
}

function RoleChip({
  role,
  included,
  disabled,
  onToggle,
}: {
  role: PermissionedRole;
  included: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      aria-pressed={included}
      disabled={disabled}
      onClick={onToggle}
      title={t(
        included ? `${PREFIX}.roles.remove` : `${PREFIX}.roles.include`,
        { role: role.role }
      )}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-2 py-1 text-sm transition-colors disabled:cursor-not-allowed outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        included
          ? "border-brand-600/30 bg-brand-50 text-foreground dark:border-brand-400/30 dark:bg-brand-900/40"
          : "border-dashed border-border bg-transparent text-muted-foreground line-through opacity-70"
      )}
    >
      <span
        className={cn(
          "inline-flex size-4 items-center justify-center rounded border",
          included
            ? "border-brand-600 bg-brand-600 text-white dark:border-brand-400 dark:bg-brand-400 dark:text-surface-950"
            : "border-border"
        )}
      >
        {included && <Check className="size-3" />}
      </span>
      <span className="font-mono text-xs">{role.role}</span>
      <PermissionBadge
        permission={role.permission === MycPermission.Write ? "write" : "read"}
      />
    </button>
  );
}
