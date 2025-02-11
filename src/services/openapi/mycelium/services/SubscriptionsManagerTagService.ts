/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateAccountTagBody } from '../models/CreateAccountTagBody';
import type { Tag } from '../models/Tag';
import type { UpdateAccountTagBody } from '../models/UpdateAccountTagBody';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SubscriptionsManagerTagService {
    /**
     * Register a tag
     * @param accountId The account unique id.
     * @param xMyceliumTenantId The tenant unique id.
     * @param requestBody
     * @returns Tag Tag successfully registered.
     * @throws ApiError
     */
    public static registerAccountTagUrl(
        accountId: string,
        xMyceliumTenantId: string,
        requestBody: CreateAccountTagBody,
    ): CancelablePromise<Tag> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/subscriptions-manager/tags',
            path: {
                'account_id': accountId,
            },
            headers: {
                'x-mycelium-tenant-id': xMyceliumTenantId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Update a tag
     * @param tagId The tag primary key.
     * @param xMyceliumTenantId The tenant unique id.
     * @param requestBody
     * @returns Tag Tag successfully registered.
     * @throws ApiError
     */
    public static updateAccountTagUrl(
        tagId: string,
        xMyceliumTenantId: string,
        requestBody: UpdateAccountTagBody,
    ): CancelablePromise<Tag> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/adm/rs/subscriptions-manager/tags/{tag_id}',
            path: {
                'tag_id': tagId,
            },
            headers: {
                'x-mycelium-tenant-id': xMyceliumTenantId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Delete a tag
     * @param tagId The tag primary key.
     * @param xMyceliumTenantId The tenant unique id.
     * @returns Tag Tag successfully registered.
     * @throws ApiError
     */
    public static deleteAccountTagUrl(
        tagId: string,
        xMyceliumTenantId: string,
    ): CancelablePromise<Tag> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/adm/rs/subscriptions-manager/tags/{tag_id}',
            path: {
                'tag_id': tagId,
            },
            headers: {
                'x-mycelium-tenant-id': xMyceliumTenantId,
            },
            errors: {
                400: `Bad request.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
