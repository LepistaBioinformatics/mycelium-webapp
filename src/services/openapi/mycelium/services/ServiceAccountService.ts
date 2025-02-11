/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Account } from '../models/Account';
import type { CreateSubscriptionAccountBody } from '../models/CreateSubscriptionAccountBody';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ServiceAccountService {
    /**
     * Create Subscription Account
     * Subscription accounts represents shared entities, like institutions,
     * groups, but not real persons.
     * @param xMyceliumConnectionString The connection string to the role-scoped database.
     * @param requestBody
     * @returns Account Account created.
     * @throws ApiError
     */
    public static createSubscriptionAccountFromServiceUrl(
        xMyceliumConnectionString: string,
        requestBody: CreateSubscriptionAccountBody,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/svc/accounts',
            headers: {
                'x-mycelium-connection-string': xMyceliumConnectionString,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Account already exists.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
