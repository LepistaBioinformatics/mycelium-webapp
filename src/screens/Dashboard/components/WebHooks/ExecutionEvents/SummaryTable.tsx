import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import { components } from "@/services/openapi/mycelium-schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { useTranslation } from "react-i18next";
import StatusBadge from "./StatusBadge";
import { cellClassName, rowClassName, tableTheme } from "./table-theme";

type WebHookExecutionSummary =
  components["schemas"]["WebHookExecutionSummary"];

const PREFIX = "screens.Dashboard.Webhooks.ExecutionEvents";

export default function SummaryTable({
  summary,
}: {
  summary: WebHookExecutionSummary[];
}) {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto scrollbar w-full">
      <Table theme={tableTheme} data-testid="webhook-execution-summary">
        <TableHead>
          <TableHeadCell>{t(`${PREFIX}.columns.trigger`)}</TableHeadCell>
          <TableHeadCell>{t(`${PREFIX}.columns.status`)}</TableHeadCell>
          <TableHeadCell>{t(`${PREFIX}.columns.count`)}</TableHeadCell>
          <TableHeadCell>{t(`${PREFIX}.columns.latest`)}</TableHeadCell>
        </TableHead>
        <TableBody className="divide-y divide-zinc-200 dark:divide-surface-800">
          {summary.map((group) => (
            <TableRow
              key={`${group.trigger}-${group.status}`}
              className={rowClassName}
            >
              <TableCell className={cellClassName}>
                {t(
                  `screens.Dashboard.Webhooks.WebhookModal.formFields.trigger.options.${group.trigger}`
                )}
              </TableCell>
              <TableCell className={cellClassName}>
                <StatusBadge status={group.status} />
              </TableCell>
              <TableCell className={`${cellClassName} font-mono`}>
                {group.count}
              </TableCell>
              <TableCell className={cellClassName}>
                {formatDDMMYY(new Date(group.latest), true)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
