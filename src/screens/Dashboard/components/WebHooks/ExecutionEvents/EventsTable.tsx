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

type WebHookExecutionEvent = components["schemas"]["WebHookExecutionEvent"];

const PREFIX = "screens.Dashboard.Webhooks.ExecutionEvents";

export default function EventsTable({
  events,
}: {
  events: WebHookExecutionEvent[];
}) {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto scrollbar w-full">
      <Table theme={tableTheme} data-testid="webhook-execution-events">
        <TableHead>
          <TableHeadCell>{t(`${PREFIX}.columns.created`)}</TableHeadCell>
          <TableHeadCell>{t(`${PREFIX}.columns.trigger`)}</TableHeadCell>
          <TableHeadCell>{t(`${PREFIX}.columns.status`)}</TableHeadCell>
          <TableHeadCell>{t(`${PREFIX}.columns.attempts`)}</TableHeadCell>
          <TableHeadCell>{t(`${PREFIX}.columns.deliveries`)}</TableHeadCell>
          <TableHeadCell>{t(`${PREFIX}.columns.lastResponse`)}</TableHeadCell>
          <TableHeadCell>{t(`${PREFIX}.columns.attempted`)}</TableHeadCell>
        </TableHead>
        <TableBody className="divide-y divide-zinc-200 dark:divide-surface-800">
          {events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EventRow({ event }: { event: WebHookExecutionEvent }) {
  const { t } = useTranslation();
  const { dispatch, propagations } = event;

  return (
    <TableRow className={rowClassName}>
      <TableCell className={cellClassName}>
        {formatDDMMYY(new Date(dispatch.created), true)}
      </TableCell>
      <TableCell className={cellClassName} title={event.payloadId}>
        {t(
          `screens.Dashboard.Webhooks.WebhookModal.formFields.trigger.options.${event.trigger}`
        )}
      </TableCell>
      <TableCell className={cellClassName}>
        <StatusBadge status={dispatch.status} />
      </TableCell>
      <TableCell className={`${cellClassName} font-mono`}>
        {dispatch.attempts}
      </TableCell>
      <TableCell className={`${cellClassName} font-mono`}>
        {t(`${PREFIX}.deliveries`, {
          failed: propagations.failed,
          total: propagations.total,
        })}
      </TableCell>
      <TableCell className={`${cellClassName} font-mono`}>
        {propagations.lastResponseStatus ?? "—"}
      </TableCell>
      <TableCell className={cellClassName}>
        {dispatch.attempted
          ? formatDDMMYY(new Date(dispatch.attempted), true)
          : "—"}
      </TableCell>
    </TableRow>
  );
}
