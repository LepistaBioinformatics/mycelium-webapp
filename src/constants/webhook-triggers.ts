import { components } from "@/services/openapi/mycelium-schema";

type WebHookTrigger = components["schemas"]["WebHookTrigger"];
type WebHookExecutionStatus = components["schemas"]["WebHookExecutionStatus"];

export const WEBHOOK_TRIGGERS: WebHookTrigger[] = [
  "subscriptionAccount.created",
  "subscriptionAccount.updated",
  "subscriptionAccount.deleted",
  "userAccount.created",
  "userAccount.updated",
  "userAccount.deleted",
];

export const WEBHOOK_EXECUTION_STATUSES: WebHookExecutionStatus[] = [
  "pending",
  "processing",
  "success",
  "failed",
  "exhausted",
  "skipped",
  "unknown",
];
