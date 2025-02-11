/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateTenantNameAndDescriptionBody } from '../models/UpdateTenantNameAndDescriptionBody';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TenantOwnerTenantService {
    /**
     * Update the name and description of a tenant
     * @param tenantId The tenant unique id.
     * @param requestBody
     * @returns any Tenant updated.
     * @throws ApiError
     */
    public static updateTenantNameAndDescriptionUrl(
        tenantId: string,
        requestBody: UpdateTenantNameAndDescriptionBody,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/adm/rs/tenant-owner/tenants/{tenant_id}/',
            path: {
                'tenant_id': tenantId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Tenant not updated.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Include an archive status to a tenant
     * @param tenantId The tenant unique id.
     * @returns any Tenant updated.
     * @throws ApiError
     */
    public static updateTenantArchivingStatusUrl(
        tenantId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/adm/rs/tenant-owner/tenants/{tenant_id}/archive',
            path: {
                'tenant_id': tenantId,
            },
            errors: {
                400: `Tenant not updated.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Include a trash status to a tenant
     * @param tenantId The tenant unique id.
     * @returns any Tenant updated.
     * @throws ApiError
     */
    public static updateTenantTrashingStatusUrl(
        tenantId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/adm/rs/tenant-owner/tenants/{tenant_id}/trash',
            path: {
                'tenant_id': tenantId,
            },
            errors: {
                400: `Tenant not updated.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Include a verified status to a tenant
     * @param tenantId The tenant unique id.
     * @returns any Tenant updated.
     * @throws ApiError
     */
    public static updateTenantVerifyingStatusUrl(
        tenantId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/adm/rs/tenant-owner/tenants/{tenant_id}/verify',
            path: {
                'tenant_id': tenantId,
            },
            errors: {
                400: `Tenant not updated.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
