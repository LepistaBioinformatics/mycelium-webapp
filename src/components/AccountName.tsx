import { describeAccountName } from "@/functions/describe-account-name";
import { cn } from "@/lib/utils";
import { components } from "@/services/openapi/mycelium-schema";
import { Bot } from "lucide-react";
import { useTranslation } from "react-i18next";

type Account = components["schemas"]["Account"];

const PREFIX = "components.AccountName";

interface Props {
  account: Account;
  className?: string;
}

/**
 * The name of an account, rendered by its type. Service accounts (namespace
 * management, role and actor accounts, other system accounts) get a readable
 * label and a "Service account" badge; their technical name stays in the
 * tooltip.
 */
export default function AccountName({ account, className }: Props) {
  const { t } = useTranslation();
  const description = describeAccountName(account);

  if (description.kind === "regular") {
    return <span className={cn("truncate", className)}>{description.name}</span>;
  }

  const label = {
    tenantManager: () => t(`${PREFIX}.tenantManager`),
    role: () =>
      description.kind === "role"
        ? t(`${PREFIX}.role`, { role: description.role })
        : "",
    actor: () =>
      description.kind === "actor"
        ? t(`${PREFIX}.actor`, { actor: description.actor })
        : "",
    system: () => (description.kind === "system" ? description.name : ""),
  }[description.kind]();

  const technicalName =
    description.kind === "system" ? description.name : description.rawName;

  return (
    <span
      className={cn("inline-flex min-w-0 items-center gap-2", className)}
      title={technicalName}
    >
      <Bot aria-hidden className="size-[1em] shrink-0 opacity-80" />
      <span className="truncate">{label}</span>
      <span className="shrink-0 rounded-full border border-infra-200 bg-infra-50 px-2 py-0.5 font-mono text-[10px] font-normal uppercase tracking-wide text-infra-800 dark:border-infra-800 dark:bg-infra-900/50 dark:text-infra-200">
        {t(`${PREFIX}.serviceAccount`)}
      </span>
    </span>
  );
}
