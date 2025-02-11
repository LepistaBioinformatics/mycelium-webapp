/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Account } from '../models/Account';
import type { APIAccountType } from '../models/APIAccountType';
import type { CreateSubscriptionAccountBody } from '../models/CreateSubscriptionAccountBody';
import type { SystemActor } from '../models/SystemActor';
import type { UpdateSubscriptionAccountNameAndFlagsBody } from '../models/UpdateSubscriptionAccountNameAndFlagsBody';
import type { VerboseStatus } from '../models/VerboseStatus';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SubscriptionsManagerAccountService {
    /**
     * List account given an account-type
     * Get a filtered (or not) list of accounts.
     *
     * List accounts with pagination. The `records` field contains a vector of
     * `Account` model.
     *
     *
     * @param xMyceliumTenantId The tenant unique id.
     * @param term
     * @param tagValue
     * @param accountType
     * @param isOwnerActive
     * @param status
     * @param roleName
     * @param roleId
     * @param actor
     * @param skip
     * @param pageSize
     * @returns Account Fetching success.
     * @throws ApiError
     */
    public static listAccountsByTypeUrl(
        xMyceliumTenantId: string,
        term?: string | null,
        tagValue?: string | null,
        accountType?: (null | APIAccountType),
        isOwnerActive?: boolean | null,
        status?: (null | VerboseStatus),
        roleName?: string | null,
        roleId?: string | null,
        actor?: (null | SystemActor),
        skip?: number | null,
        pageSize?: number | null,
    ): CancelablePromise<Array<Account>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/adm/rs/subscriptions-manager/accounts',
            headers: {
                'x-mycelium-tenant-id': xMyceliumTenantId,
            },
            query: {
                'term': term,
                'tagValue': tagValue,
                'accountType': accountType,
                'isOwnerActive': isOwnerActive,
                'status': status,
                'roleName': roleName,
                'roleId': roleId,
                'actor': actor,
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
     * Create Subscription Account
     * Subscription accounts represents shared entities, like institutions,
     * groups, but not real persons.
     * @param xMyceliumTenantId The tenant unique id.
     * @param requestBody
     * @returns Account Account created.
     * @throws ApiError
     */
    public static createSubscriptionAccountUrl(
        xMyceliumTenantId: string,
        requestBody: CreateSubscriptionAccountBody,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/subscriptions-manager/accounts',
            headers: {
                'x-mycelium-tenant-id': xMyceliumTenantId,
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
    /**
     * Get Subscription Account
     * Get a single subscription account.
     * @param xMyceliumTenantId The tenant unique id.
     * @param accountId The account primary key.
     * @returns Account Fetching success.
     * @throws ApiError
     */
    public static getAccountDetailsUrl(
        xMyceliumTenantId: string,
        accountId: string,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/adm/rs/subscriptions-manager/accounts/{account_id}',
            path: {
                'account_id': accountId,
            },
            headers: {
                'x-mycelium-tenant-id': xMyceliumTenantId,
            },
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Create Subscription Account
     * Subscription accounts represents shared entities, like institutions,
     * groups, but not real persons.
     * @param xMyceliumTenantId The tenant unique id.
     * @param accountId The account primary key.
     * @param requestBody
     * @returns Account Account created.
     * @throws ApiError
     */
    public static updateAccountNameAndFlagsUrl(
        xMyceliumTenantId: string,
        accountId: string,
        requestBody: UpdateSubscriptionAccountNameAndFlagsBody,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/adm/rs/subscriptions-manager/accounts/{account_id}',
            path: {
                'account_id': accountId,
            },
            headers: {
                'x-mycelium-tenant-id': xMyceliumTenantId,
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
    /**
     * Propagate Subscription Account
     * Propagate a single subscription account.
     * @param xMyceliumTenantId The tenant unique id.
     * @param accountId The account primary key.
     * @returns Account Propagating success.
     * @throws ApiError
     */
    public static propagateExistingSubscriptionAccountUrl(
        xMyceliumTenantId: string,
        accountId: string,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/subscriptions-manager/accounts/{account_id}/propagate',
            path: {
                'account_id': accountId,
            },
            headers: {
                'x-mycelium-tenant-id': xMyceliumTenantId,
            },
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
