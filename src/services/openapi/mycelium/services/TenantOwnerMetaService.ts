/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTenantMetaBody } from '../models/CreateTenantMetaBody';
import type { DeleteTenantMetaBody } from '../models/DeleteTenantMetaBody';
import type { HashMap } from '../models/HashMap';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TenantOwnerMetaService {
    /**
     * Register a tenant metadata
     * @param xMyceliumTenantId The tenant unique id.
     * @param requestBody
     * @returns HashMap Meta created.
     * @throws ApiError
     */
    public static createTenantMetaUrl(
        xMyceliumTenantId: string,
        requestBody: CreateTenantMetaBody,
    ): CancelablePromise<HashMap> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/tenant-owner/meta',
            headers: {
                'x-mycelium-tenant-id': xMyceliumTenantId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Meta already exists.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Delete a tenant metadata
     * @param xMyceliumTenantId The tenant unique id.
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static deleteTenantMetaUrl(
        xMyceliumTenantId: string,
        requestBody: DeleteTenantMetaBody,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/adm/rs/tenant-owner/meta',
            headers: {
                'x-mycelium-tenant-id': xMyceliumTenantId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Meta not deleted.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
