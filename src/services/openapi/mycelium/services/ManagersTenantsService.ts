/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTenantBody } from '../models/CreateTenantBody';
import type { Tenant } from '../models/Tenant';
import type { TenantOwnerConnection } from '../models/TenantOwnerConnection';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ManagersTenantsService {
    /**
     * List tenants
     * @param name Filter tenants by name
     * @param owner Filter tenants by owner
     * @param metadata Filter tenants by metadata key
     * @param tag Filter tenants by tag
     *
     * Example: `key=value`
     * @param skip
     * @param pageSize
     * @returns Tenant Fetching success.
     * @throws ApiError
     */
    public static listTenantUrl(
        name?: string | null,
        owner?: string | null,
        metadata?: string | null,
        tag?: string | null,
        skip?: number | null,
        pageSize?: number | null,
    ): CancelablePromise<Array<Tenant>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/adm/su/managers/tenants',
            query: {
                'name': name,
                'owner': owner,
                'metadata': metadata,
                'tag': tag,
                'skip': skip,
                'pageSize': pageSize,
            },
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Create a new tenant
     * @param requestBody
     * @returns Tenant Tenant created.
     * @throws ApiError
     */
    public static createTenantUrl(
        requestBody: CreateTenantBody,
    ): CancelablePromise<Tenant> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/su/managers/tenants',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Tenant already exists.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Delete a tenant
     * @param id The tenant primary key.
     * @returns string Tenant successfully registered.
     * @throws ApiError
     */
    public static deleteTenantUrl(
        id: string,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/adm/su/managers/tenants/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Bad request.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Exclude a tenant owner
     * A single tenant can have multiple owners. This endpoint allows to exclude an
     * owner from the tenant.
     *
     *
     * @param id The tenant primary key.
     * @param ownerId
     * @returns void
     * @throws ApiError
     */
    public static excludeTenantOwnerUrl(
        id: string,
        ownerId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/adm/su/managers/tenants/{id}/owner/{owner_id}',
            path: {
                'id': id,
                'owner_id': ownerId,
            },
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Include a tenant owner
     * A single tenant can have multiple owners. This endpoint allows to include a
     * new owner to the tenant.
     *
     *
     * @param id The tenant primary key.
     * @param ownerId
     * @returns TenantOwnerConnection Owner included.
     * @throws ApiError
     */
    public static includeTenantOwnerUrl(
        id: string,
        ownerId: string,
    ): CancelablePromise<TenantOwnerConnection> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/adm/su/managers/tenants/{id}/owner/{owner_id}',
            path: {
                'id': id,
                'owner_id': ownerId,
            },
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
