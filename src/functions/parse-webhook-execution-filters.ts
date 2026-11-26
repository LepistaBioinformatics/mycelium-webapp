import {
  WEBHOOK_EXECUTION_STATUSES,
  WEBHOOK_TRIGGERS,
} from "@/constants/webhook-triggers";
import { components } from "@/services/openapi/mycelium-schema";

type WebHookTrigger = components["schemas"]["WebHookTrigger"];
type WebHookExecutionStatus = components["schemas"]["WebHookExecutionStatus"];

export type WebhookExecutionFilterKey = "trigger" | "status";

export interface WebhookExecutionFilters {
  trigger?: WebHookTrigger;
  status?: WebHookExecutionStatus;
}

function tokenValue(term: string, key: WebhookExecutionFilterKey) {
  const prefix = `${key}:`;
  const token = term
    .split(/\s+/)
    .find((part) => part.toLowerCase().startsWith(prefix));

  return token?.slice(prefix.length);
}

/**
 * Read the `trigger:<name>` and `status:<name>` filters typed in the search
 * bar. Unknown values and other words are ignored.
 */
export function parseWebhookExecutionFilters(
  term: string | null | undefined
): WebhookExecutionFilters {
  if (!term) return {};

  const trigger = WEBHOOK_TRIGGERS.find(
    (option) => option === tokenValue(term, "trigger")
  );
  const status = WEBHOOK_EXECUTION_STATUSES.find(
    (option) => option === tokenValue(term, "status")?.toLowerCase()
  );

  return { trigger, status };
}

/** Set (or replace) one filter in the search term, keeping the others. */
export function withWebhookExecutionFilter(
  term: string | null | undefined,
  key: WebhookExecutionFilterKey,
  value: string
): string {
  const kept = (term ?? "")
    .split(/\s+/)
    .filter((part) => part && !part.toLowerCase().startsWith(`${key}:`));

  return [...kept, `${key}:${value}`].join(" ");
}
