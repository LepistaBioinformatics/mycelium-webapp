/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateWebHookBody } from '../models/CreateWebHookBody';
import type { UpdateWebHookBody } from '../models/UpdateWebHookBody';
import type { WebHook } from '../models/WebHook';
import type { WebHookTrigger } from '../models/WebHookTrigger';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SystemManagerWebhookService {
    /**
     * List webhooks
     * @param name
     * @param trigger
     * @returns WebHook Fetching success.
     * @throws ApiError
     */
    public static listWebhooksUrl(
        name?: string | null,
        trigger?: (null | WebHookTrigger),
    ): CancelablePromise<WebHook> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/adm/rs/system-manager/webhooks',
            query: {
                'name': name,
                'trigger': trigger,
            },
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Create a webhook
     * @param requestBody
     * @returns WebHook WebHook already exists.
     * @throws ApiError
     */
    public static crateWebhookUrl(
        requestBody: CreateWebHookBody,
    ): CancelablePromise<WebHook> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/system-manager/webhooks',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Delete a webhook
     * @param webhookId The webhook primary key.
     * @returns void
     * @throws ApiError
     */
    public static deleteWebhookUrl(
        webhookId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/adm/rs/system-manager/webhooks/{webhook_id}',
            path: {
                'webhook_id': webhookId,
            },
            errors: {
                400: `Webhook not deleted.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Update a webhook
     * @param webhookId The webhook primary key.
     * @param requestBody
     * @returns WebHook WebHook created.
     * @throws ApiError
     */
    public static updateWebhookUrl(
        webhookId: string,
        requestBody: UpdateWebHookBody,
    ): CancelablePromise<WebHook> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/adm/rs/system-manager/webhooks/{webhook_id}',
            path: {
                'webhook_id': webhookId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
