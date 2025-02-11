/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Account } from '../models/Account';
import type { CreateDefaultAccountBody } from '../models/CreateDefaultAccountBody';
import type { UpdateOwnAccountNameAccountBody } from '../models/UpdateOwnAccountNameAccountBody';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BeginnersAccountService {
    /**
     * Create a user related account
     * A user related account is an account that is created for a physical person.
     *
     *
     * @param requestBody
     * @returns Account Account already exists.
     * @throws ApiError
     */
    public static createDefaultAccountUrl(
        requestBody: CreateDefaultAccountBody,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/beginners/accounts',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Update account name
     * Update the account name of the account owner.
     *
     *
     * @param accountId The account primary key.
     * @param requestBody
     * @returns Account Account name successfully updated.
     * @throws ApiError
     */
    public static updateOwnAccountNameUrl(
        accountId: string,
        requestBody: UpdateOwnAccountNameAccountBody,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/adm/rs/beginners/accounts/{account_id}/update-account-name',
            path: {
                'account_id': accountId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Account name not updated.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
