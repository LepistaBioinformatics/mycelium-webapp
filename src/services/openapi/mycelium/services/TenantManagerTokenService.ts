/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTenantScopedTokenBody } from '../models/CreateTenantScopedTokenBody';
import type { CreateTokenResponse } from '../models/CreateTokenResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TenantManagerTokenService {
    /**
     * Create Tenant Associated Token
     * @param tenantId The tenant unique id.
     * @param requestBody
     * @returns CreateTokenResponse Token created.
     * @throws ApiError
     */
    public static createTenantAssociatedConnectionStringUrl(
        tenantId: string,
        requestBody: CreateTenantScopedTokenBody,
    ): CancelablePromise<CreateTokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/tenant-manager/tokens/tenants/{tenant_id}',
            path: {
                'tenant_id': tenantId,
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
