/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Account } from '../models/Account';
import type { DowngradeAccountPrivilegesBody } from '../models/DowngradeAccountPrivilegesBody';
import type { UpgradeAccountPrivilegesBody } from '../models/UpgradeAccountPrivilegesBody';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StaffsAccountsService {
    /**
     * Downgrade account privileges
     * Decrease permissions of the refereed account.
     * @param accountId The account primary key.
     * @param requestBody
     * @returns Account Account downgraded.
     * @throws ApiError
     */
    public static downgradeAccountPrivilegesUrl(
        accountId: string,
        requestBody: DowngradeAccountPrivilegesBody,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/adm/su/staffs/accounts/{account_id}/downgrade',
            path: {
                'account_id': accountId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Account not downgraded.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Upgrade account privileges
     * Increase permissions of the refereed account.
     * @param accountId The account primary key.
     * @param requestBody
     * @returns Account Account upgraded.
     * @throws ApiError
     */
    public static upgradeAccountPrivilegesUrl(
        accountId: string,
        requestBody: UpgradeAccountPrivilegesBody,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/adm/su/staffs/accounts/{account_id}/upgrade',
            path: {
                'account_id': accountId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Account not upgraded.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
