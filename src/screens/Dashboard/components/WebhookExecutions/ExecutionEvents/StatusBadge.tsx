import { components } from "@/services/openapi/mycelium-schema";
import { useTranslation } from "react-i18next";

type WebHookExecutionStatus = components["schemas"]["WebHookExecutionStatus"];

const TONES: Record<WebHookExecutionStatus, string> = {
  success:
    "border-status-production text-status-production bg-status-production/10",
  pending: "border-status-research text-status-research bg-status-research/10",
  processing:
    "border-status-stable text-status-stable bg-status-stable/10",
  failed:
    "border-red-300 text-red-600 bg-red-50 dark:border-red-700 dark:text-red-400 dark:bg-red-900/20",
  exhausted:
    "border-red-300 text-red-600 bg-red-50 dark:border-red-700 dark:text-red-400 dark:bg-red-900/20",
  skipped:
    "border-zinc-300 text-zinc-600 bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:bg-surface-900",
  unknown:
    "border-zinc-300 text-zinc-600 bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:bg-surface-900",
};

export default function StatusBadge({
  status,
}: {
  status: WebHookExecutionStatus;
}) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-block rounded-lg border px-1.5 py-0.5 font-mono text-xs uppercase ${TONES[status]}`}
    >
      {t(`screens.Dashboard.Webhooks.ExecutionEvents.statuses.${status}`)}
    </span>
  );
}
