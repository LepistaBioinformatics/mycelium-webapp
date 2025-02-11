/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuestUser } from '../models/GuestUser';
import type { GuestUserBody } from '../models/GuestUserBody';
import type { LicensedResources } from '../models/LicensedResources';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SubscriptionsManagerGuestService {
    /**
     * List subscription accounts which email was guest
     * @param xMyceliumTenantId The tenant unique id.
     * @param email The email which the guest user is connected to
     * @param roles The roles which the guest user was invited to
     * @param permissionedRoles The permissioned roles which the guest user was invited to
     * @param wasVerified The guest user was verified
     * @returns LicensedResources Fetching success.
     * @throws ApiError
     */
    public static listLicensedAccountsOfEmailUrl(
        xMyceliumTenantId: string,
        email: string,
        roles?: any[] | null,
        permissionedRoles?: any[] | null,
        wasVerified?: boolean | null,
    ): CancelablePromise<Array<LicensedResources>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/adm/rs/subscriptions-manager/guests',
            headers: {
                'x-mycelium-tenant-id': xMyceliumTenantId,
            },
            query: {
                'email': email,
                'roles': roles,
                'permissionedRoles': permissionedRoles,
                'wasVerified': wasVerified,
            },
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * List guest accounts related to a subscription account
     * This action fetches all non-subscription accounts related to the
     * informed subscription account.
     * @param xMyceliumTenantId The tenant unique id.
     * @param accountId The account primary key.
     * @returns GuestUser Fetching success.
     * @throws ApiError
     */
    public static listGuestOnSubscriptionAccountUrl(
        xMyceliumTenantId: string,
        accountId: string,
    ): CancelablePromise<GuestUser> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/adm/rs/subscriptions-manager/guests/accounts/{account_id}',
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
     * Guest a user to work on account.
     * This action gives the ability of the target account (specified through
     * the `account` argument) to perform actions specified in the `role`
     * path argument.
     * @param xMyceliumTenantId The tenant unique id.
     * @param accountId The account primary key.
     * @param roleId The guest-role unique id.
     * @param requestBody
     * @returns GuestUser Guest already exist.
     * @throws ApiError
     */
    public static guestUserUrl(
        xMyceliumTenantId: string,
        accountId: string,
        roleId: string,
        requestBody: GuestUserBody,
    ): CancelablePromise<GuestUser> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/subscriptions-manager/guests/accounts/{account_id}/roles/{role_id}',
            path: {
                'account_id': accountId,
                'role_id': roleId,
            },
            headers: {
                'x-mycelium-tenant-id': xMyceliumTenantId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Uninvite user to perform a role to account
     * @param xMyceliumTenantId The tenant unique id.
     * @param accountId The account primary key.
     * @param roleId The guest-role unique id.
     * @param email
     * @returns void
     * @throws ApiError
     */
    public static uninviteGuestUrl(
        xMyceliumTenantId: string,
        accountId: string,
        roleId: string,
        email: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/adm/rs/subscriptions-manager/guests/accounts/{account_id}/roles/{role_id}',
            path: {
                'account_id': accountId,
                'role_id': roleId,
            },
            headers: {
                'x-mycelium-tenant-id': xMyceliumTenantId,
            },
            query: {
                'email': email,
            },
            errors: {
                400: `Guest User not uninvited.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
