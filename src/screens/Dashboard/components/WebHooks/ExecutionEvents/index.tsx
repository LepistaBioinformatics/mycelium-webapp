import Card from "@/components/ui/Card";
import Pager from "@/components/ui/Pager";
import Skeleton from "@/components/ui/Skeleton";
import Typography from "@/components/ui/Typography";
import {
  WEBHOOK_EXECUTION_STATUSES,
  WEBHOOK_TRIGGERS,
} from "@/constants/webhook-triggers";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import {
  webhooksListExecutions,
  webhooksSummarizeExecutions,
} from "@/services/rpc/systemManager";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { Select } from "flowbite-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import EventsTable from "./EventsTable";
import SummaryTable from "./SummaryTable";

type WebHookTrigger = components["schemas"]["WebHookTrigger"];
type WebHookExecutionStatus = components["schemas"]["WebHookExecutionStatus"];

const PREFIX = "screens.Dashboard.Webhooks.ExecutionEvents";
const PAGE_SIZE = 20;

const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateOnMount: true,
  refreshInterval: 1000 * 60,
};

const selectTheme = {
  field: {
    select: {
      colors: {
        custom:
          "border-brand-600 bg-white text-zinc-900 focus:border-infra-400 focus:ring-zinc-500 dark:bg-surface-950 dark:text-white dark:focus:border-brand-violet-500 dark:focus:ring-brand-violet-500",
      },
    },
  },
};

/**
 * Execution events of the webhook dispatcher: totals per trigger and status,
 * plus a filterable list. Payloads are never shown, only dispatch state.
 */
export default function ExecutionEvents() {
  const { t } = useTranslation();
  const [trigger, setTrigger] = useState<WebHookTrigger | "">("");
  const [status, setStatus] = useState<WebHookExecutionStatus | "">("");
  const [skip, setSkip] = useState(0);

  const { isAuthenticated, getAccessTokenSilently, hasEnoughPermissions } =
    useProfile({
      roles: [MycRole.SystemManager],
      permissions: [MycPermission.Read],
    });

  const canFetch = isAuthenticated && hasEnoughPermissions;

  const summary = useSWR(
    canFetch ? ["rpc", "systemManager.webhooks.summarizeExecutions"] : null,
    () => webhooksSummarizeExecutions({}, getAccessTokenSilently),
    swrOptions
  );

  const events = useSWR(
    canFetch
      ? ["rpc", "systemManager.webhooks.listExecutions", trigger, status, skip]
      : null,
    () =>
      webhooksListExecutions(
        {
          trigger: trigger || undefined,
          status: status || undefined,
          skip,
          pageSize: PAGE_SIZE,
        },
        getAccessTokenSilently
      ),
    swrOptions
  );

  const handleTriggerChange = (value: string) => {
    setSkip(0);
    setTrigger(value as WebHookTrigger | "");
  };

  const handleStatusChange = (value: string) => {
    setSkip(0);
    setStatus(value as WebHookExecutionStatus | "");
  };

  return (
    <Card padding="sm" width="alwaysFull" height="adaptive">
      <Card.Header>
        <Typography as="h5" decoration="faded">
          {t(`${PREFIX}.title`)}
        </Typography>
      </Card.Header>

      <Card.Body width="full">
        <div
          id="WebhookExecutionEvents"
          className="flex flex-col gap-6 w-full"
        >
          <section className="flex flex-col gap-2">
            <Typography as="h6">{t(`${PREFIX}.summaryTitle`)}</Typography>
            {summary.isLoading && <Skeleton.Table rows={3} cols={4} />}
            {summary.error && <LoadError />}
            {!summary.isLoading && !summary.error && !summary.data?.length && (
              <Typography decoration="smooth">{t(`${PREFIX}.empty`)}</Typography>
            )}
            {!!summary.data?.length && <SummaryTable summary={summary.data} />}
          </section>

          <section className="flex flex-col gap-3">
            <Typography as="h6">{t(`${PREFIX}.eventsTitle`)}</Typography>

            <div className="flex flex-wrap gap-3">
              <Select
                id="execution-trigger-filter"
                aria-label={t(`${PREFIX}.filters.trigger`)}
                color="custom"
                sizing="sm"
                theme={selectTheme}
                value={trigger}
                onChange={(e) => handleTriggerChange(e.target.value)}
              >
                <option value="">{t(`${PREFIX}.filters.allTriggers`)}</option>
                {WEBHOOK_TRIGGERS.map((option) => (
                  <option key={option} value={option}>
                    {t(
                      `screens.Dashboard.Webhooks.WebhookModal.formFields.trigger.options.${option}`
                    )}
                  </option>
                ))}
              </Select>

              <Select
                id="execution-status-filter"
                aria-label={t(`${PREFIX}.filters.status`)}
                color="custom"
                sizing="sm"
                theme={selectTheme}
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="">{t(`${PREFIX}.filters.allStatuses`)}</option>
                {WEBHOOK_EXECUTION_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {t(`${PREFIX}.statuses.${option}`)}
                  </option>
                ))}
              </Select>
            </div>

            {events.isLoading && <Skeleton.Table rows={5} cols={7} />}
            {events.error && <LoadError />}
            {!events.isLoading && !events.error && !events.data?.records?.length && (
              <Typography decoration="smooth">{t(`${PREFIX}.empty`)}</Typography>
            )}
            {events.data && events.data.records.length > 0 && (
              <>
                <EventsTable events={events.data.records} />
                <Pager
                  records={events.data}
                  mutation={events.mutate}
                  skip={skip}
                  setSkip={setSkip}
                  pageSize={PAGE_SIZE}
                />
              </>
            )}
          </section>
        </div>
      </Card.Body>
    </Card>
  );
}

function LoadError() {
  const { t } = useTranslation();

  return (
    <Typography decoration="smooth" as="p">
      <span className="text-red-600 dark:text-red-400">
        {t(`${PREFIX}.loadError`)}
      </span>
    </Typography>
  );
}
