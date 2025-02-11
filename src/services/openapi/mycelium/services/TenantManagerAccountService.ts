/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TenantManagerAccountService {
    /**
     * Delete a subscription account.
     * @param xMyceliumTenantId The tenant unique id.
     * @param accountId The account primary key.
     * @returns void
     * @throws ApiError
     */
    public static deleteSubscriptionAccountUrl(
        xMyceliumTenantId: string,
        accountId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/adm/rs/tenant-manager/accounts/{account_id}',
            path: {
                'account_id': accountId,
            },
            headers: {
                'x-mycelium-tenant-id': xMyceliumTenantId,
            },
            errors: {
                400: `Account deleted.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
