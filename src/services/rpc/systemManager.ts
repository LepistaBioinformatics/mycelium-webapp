import { components } from "@/services/openapi/mycelium-schema";
import PaginatedRecords from "@/types/PaginatedRecords";
import { rpcCall } from "./client";

type WebHook = components["schemas"]["WebHook"];
type ErrorCode = components["schemas"]["ErrorCode"];
type HttpSecret = components["schemas"]["HttpSecret"];
type WebHookTrigger = components["schemas"]["WebHookTrigger"];
type WebHookExecutionStatus = components["schemas"]["WebHookExecutionStatus"];
type WebHookExecutionEvent = components["schemas"]["WebHookExecutionEvent"];
type WebHookExecutionSummary =
  components["schemas"]["WebHookExecutionSummary"];

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

export interface WebhooksListParams {
  skip?: number;
  pageSize?: number;
  name?: string;
}

export function webhooksList(
  params: WebhooksListParams,
  getToken: () => Promise<string>
): Promise<PaginatedRecords<WebHook>> {
  return rpcCall<WebhooksListParams, PaginatedRecords<WebHook>>(
    "systemManager.webhooks.list",
    params,
    getToken
  );
}

export interface WebhooksCreateParams {
  name: string;
  description?: string | null;
  url: string;
  trigger: string;
  method?: string | null;
  secret?: HttpSecret | null;
}

export function webhooksCreate(
  params: WebhooksCreateParams,
  getToken: () => Promise<string>
): Promise<WebHook> {
  return rpcCall<WebhooksCreateParams, WebHook>(
    "systemManager.webhooks.create",
    params,
    getToken
  );
}

export interface WebhooksUpdateParams {
  webhookId: string;
  name?: string | null;
  description?: string | null;
  secret?: HttpSecret | null;
  isActive?: boolean | null;
}

export function webhooksUpdate(
  params: WebhooksUpdateParams,
  getToken: () => Promise<string>
): Promise<WebHook> {
  return rpcCall<WebhooksUpdateParams, WebHook>(
    "systemManager.webhooks.update",
    params,
    getToken
  );
}

export interface WebhooksDeleteParams {
  webhookId: string;
}

export function webhooksDelete(
  params: WebhooksDeleteParams,
  getToken: () => Promise<string>
): Promise<void> {
  return rpcCall<WebhooksDeleteParams, void>(
    "systemManager.webhooks.delete",
    params,
    getToken
  );
}

export interface WebhooksListExecutionsParams {
  trigger?: WebHookTrigger;
  status?: WebHookExecutionStatus;
  skip?: number;
  pageSize?: number;
}

/** Resolves to `null` when no execution event matches the filters. */
export function webhooksListExecutions(
  params: WebhooksListExecutionsParams,
  getToken: () => Promise<string>
): Promise<PaginatedRecords<WebHookExecutionEvent> | null> {
  return rpcCall<
    WebhooksListExecutionsParams,
    PaginatedRecords<WebHookExecutionEvent> | null
  >("systemManager.webhooks.listExecutions", params, getToken);
}

export interface WebhooksSummarizeExecutionsParams {
  /** RFC 3339 timestamp; only events created at or after it are counted. */
  since?: string;
}

/** Resolves to `null` when there are no execution events. */
export function webhooksSummarizeExecutions(
  params: WebhooksSummarizeExecutionsParams,
  getToken: () => Promise<string>
): Promise<WebHookExecutionSummary[] | null> {
  return rpcCall<
    WebhooksSummarizeExecutionsParams,
    WebHookExecutionSummary[] | null
  >("systemManager.webhooks.summarizeExecutions", params, getToken);
}

// ---------------------------------------------------------------------------
// Error codes
// ---------------------------------------------------------------------------

export interface ErrorCodesListParams {
  skip?: number;
  pageSize?: number;
  prefix?: string;
  code?: number;
  isInternal?: boolean;
}

export function errorCodesList(
  params: ErrorCodesListParams,
  getToken: () => Promise<string>
): Promise<PaginatedRecords<ErrorCode>> {
  return rpcCall<ErrorCodesListParams, PaginatedRecords<ErrorCode>>(
    "systemManager.errorCodes.list",
    params,
    getToken
  );
}
