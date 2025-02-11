/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Account } from '../models/Account';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersManagerAccountService {
    /**
     * Activate account
     * Any account could be activated and deactivated. This action turn an
     * account active.
     * @param accountId The account primary key.
     * @returns Account Account activated.
     * @throws ApiError
     */
    public static activateAccountUrl(
        accountId: string,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/adm/rs/users-manager/accounts/{account_id}/activate',
            path: {
                'account_id': accountId,
            },
            errors: {
                400: `Account not activated.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Approve account after creation
     * New accounts should be approved after has permissions to perform
     * operation on the system. These endpoint should approve such account.
     * @param accountId The account primary key.
     * @returns Account Account approved.
     * @throws ApiError
     */
    public static approveAccountUrl(
        accountId: string,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/adm/rs/users-manager/accounts/{account_id}/approve',
            path: {
                'account_id': accountId,
            },
            errors: {
                400: `Account not approved.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Archive account
     * Set target account as archived.
     * @param accountId The account primary key.
     * @returns Account Account activated.
     * @throws ApiError
     */
    public static archiveAccountUrl(
        accountId: string,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/adm/rs/users-manager/accounts/{account_id}/archive',
            path: {
                'account_id': accountId,
            },
            errors: {
                400: `Account not activated.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Deactivate account
     * Any account could be activated and deactivated. This action turn an
     * account deactivated.
     * @param accountId The account primary key.
     * @returns Account Account activated.
     * @throws ApiError
     */
    public static deactivateAccountUrl(
        accountId: string,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/adm/rs/users-manager/accounts/{account_id}/deactivate',
            path: {
                'account_id': accountId,
            },
            errors: {
                400: `Account not activated.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Disapprove account after creation
     * Also approved account should be disapproved at any time. These endpoint
     * work for this.
     * @param accountId The account primary key.
     * @returns Account Account disapproved.
     * @throws ApiError
     */
    public static disapproveAccountUrl(
        accountId: string,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/adm/rs/users-manager/accounts/{account_id}/disapprove',
            path: {
                'account_id': accountId,
            },
            errors: {
                400: `Account not disapproved.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Unarchive account
     * Set target account as un-archived.
     * @param accountId The account primary key.
     * @returns Account Account activated.
     * @throws ApiError
     */
    public static unarchiveAccountUrl(
        accountId: string,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/adm/rs/users-manager/accounts/{account_id}/unarchive',
            path: {
                'account_id': accountId,
            },
            errors: {
                400: `Account not activated.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
