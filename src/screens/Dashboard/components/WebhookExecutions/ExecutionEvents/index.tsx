import Card from "@/components/ui/Card";
import LoadMore from "@/components/ui/LoadMore";
import Skeleton from "@/components/ui/Skeleton";
import Typography from "@/components/ui/Typography";
import useLoadMore from "@/hooks/use-load-more";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import {
  webhooksListExecutions,
  webhooksSummarizeExecutions,
} from "@/services/rpc/systemManager";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import EventsTable from "./EventsTable";
import SummaryTable from "./SummaryTable";

type WebHookTrigger = components["schemas"]["WebHookTrigger"];
type WebHookExecutionStatus = components["schemas"]["WebHookExecutionStatus"];
type WebHookExecutionEvent = components["schemas"]["WebHookExecutionEvent"];

const PREFIX = "screens.Dashboard.Webhooks.ExecutionEvents";
const PAGE_SIZE = 20;

const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateOnMount: true,
  refreshInterval: 1000 * 60,
};


/**
 * Execution events of the webhook dispatcher: totals per trigger and status,
 * plus a filterable list. Payloads are never shown, only dispatch state.
 */
interface Props {
  trigger?: WebHookTrigger;
  status?: WebHookExecutionStatus;
}

export default function ExecutionEvents({ trigger, status }: Props) {
  const { t } = useTranslation();

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

  const events = useLoadMore<WebHookExecutionEvent>({
    baseKey: canFetch
      ? ["rpc", "systemManager.webhooks.listExecutions", trigger, status]
      : null,
    pageSize: PAGE_SIZE,
    fetchPage: (skip, pageSize) =>
      webhooksListExecutions(
        {
          trigger: trigger || undefined,
          status: status || undefined,
          skip,
          pageSize,
        },
        getAccessTokenSilently
      ),
  });

  return (
    <div id="WebhookExecutionEvents" className="flex flex-col gap-6 w-full">
      <Card padding="md" width="alwaysFull" height="adaptive" scroll={false}>
        <Card.Header>
          <Typography as="h5">{t(`${PREFIX}.summaryTitle`)}</Typography>
        </Card.Header>
        <Card.Body width="full">
          <div className="flex flex-col gap-2 w-full">
            {summary.isLoading && <Skeleton.Table rows={3} cols={4} />}
            {summary.error && <LoadError />}
            {!summary.isLoading && !summary.error && !summary.data?.length && (
              <Typography decoration="smooth">{t(`${PREFIX}.empty`)}</Typography>
            )}
            {!!summary.data?.length && <SummaryTable summary={summary.data} />}
          </div>
        </Card.Body>
      </Card>

      <Card padding="md" width="alwaysFull" height="adaptive" scroll={false}>
        <Card.Header>
          <Typography as="h5">{t(`${PREFIX}.eventsTitle`)}</Typography>
        </Card.Header>
        <Card.Body width="full">
          <div className="flex flex-col gap-3 w-full">
            {events.isLoading && <Skeleton.Table rows={5} cols={7} />}
            {events.error && <LoadError />}
            {!events.isLoading &&
              !events.error &&
              events.records.length === 0 && (
                <Typography decoration="smooth">
                  {t(`${PREFIX}.empty`)}
                </Typography>
              )}
            {events.records.length > 0 && (
              <>
                <EventsTable events={events.records} />
                <LoadMore
                  loaded={events.records.length}
                  total={events.count}
                  hasMore={events.hasMore}
                  isLoadingMore={events.isLoadingMore}
                  onLoadMore={events.loadMore}
                />
              </>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
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
