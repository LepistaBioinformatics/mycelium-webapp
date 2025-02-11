/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuestTenantOwnerBody } from '../models/GuestTenantOwnerBody';
import type { TenantOwnerConnection } from '../models/TenantOwnerConnection';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TenantOwnerOwnerService {
    /**
     * Guest a user to work as a tenant owner
     * @param xMyceliumTenantId The tenant unique id.
     * @param requestBody
     * @returns TenantOwnerConnection Owner created.
     * @throws ApiError
     */
    public static guestTenantOwnerUrl(
        xMyceliumTenantId: string,
        requestBody: GuestTenantOwnerBody,
    ): CancelablePromise<TenantOwnerConnection> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/tenant-owner/owners',
            headers: {
                'x-mycelium-tenant-id': xMyceliumTenantId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Owner already exists.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Revoke a user from working as a tenant owner
     * @param xMyceliumTenantId The tenant unique id.
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static revokeTenantOwnerUrl(
        xMyceliumTenantId: string,
        requestBody: GuestTenantOwnerBody,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/adm/rs/tenant-owner/owners',
            headers: {
                'x-mycelium-tenant-id': xMyceliumTenantId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Owner deleted.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
