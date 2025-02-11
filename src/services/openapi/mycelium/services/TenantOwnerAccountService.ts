/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Account } from '../models/Account';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TenantOwnerAccountService {
    /**
     * Create a management account.
     * @param xMyceliumTenantId The tenant unique id.
     * @returns Account Account created.
     * @throws ApiError
     */
    public static createManagementAccountUrl(
        xMyceliumTenantId: string,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/tenant-owner/accounts',
            headers: {
                'x-mycelium-tenant-id': xMyceliumTenantId,
            },
            errors: {
                400: `Account already exists.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
