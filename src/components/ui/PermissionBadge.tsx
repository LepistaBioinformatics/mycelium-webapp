import { components } from "@/services/openapi/mycelium-schema";
import { Eye, PenLine } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type Permission = components["schemas"]["Permission"];

/** A read (green) / write (amber) permission chip */
export default function PermissionBadge({
  permission,
  className,
}: {
  permission: Permission;
  className?: string;
}) {
  const { t } = useTranslation();
  const isWrite = permission === "write";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide",
        isWrite
          ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
          : "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/60 dark:text-green-200",
        className
      )}
    >
      {isWrite ? <PenLine className="size-3" /> : <Eye className="size-3" />}
      {t(
        `screens.Dashboard.GuestRoles.GuestRoleSelector.permissions.${isWrite ? "write" : "read"}`
      )}
    </span>
  );
}
