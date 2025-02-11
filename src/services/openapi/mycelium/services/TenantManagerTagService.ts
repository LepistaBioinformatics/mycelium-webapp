/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTagBody } from '../models/CreateTagBody';
import type { Tag } from '../models/Tag';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TenantManagerTagService {
    /**
     * Create a user related account
     * @param xMyceliumTenantId The tenant unique id.
     * @param requestBody
     * @returns Tag Tag successfully registered.
     * @throws ApiError
     */
    public static registerTenantTagUrl(
        xMyceliumTenantId: string,
        requestBody: CreateTagBody,
    ): CancelablePromise<Tag> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/tenant-manager/tags',
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
     * @param xMyceliumTenantId The tenant unique id.
     * @param tagId The tag primary key.
     * @param requestBody
     * @returns Tag Tag successfully registered.
     * @throws ApiError
     */
    public static updateTenantTagUrl(
        xMyceliumTenantId: string,
        tagId: string,
        requestBody: CreateTagBody,
    ): CancelablePromise<Tag> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/adm/rs/tenant-manager/tags/{tag_id}',
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
     * @param xMyceliumTenantId The tenant unique id.
     * @param tagId The tag primary key.
     * @returns Tag Tag successfully registered.
     * @throws ApiError
     */
    public static deleteTenantTagUrl(
        xMyceliumTenantId: string,
        tagId: string,
    ): CancelablePromise<Tag> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/adm/rs/tenant-manager/tags/{tag_id}',
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
