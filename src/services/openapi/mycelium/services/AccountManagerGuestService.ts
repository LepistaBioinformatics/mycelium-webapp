/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuestUser } from '../models/GuestUser';
import type { GuestUserToChildrenBody } from '../models/GuestUserToChildrenBody';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AccountManagerGuestService {
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
    public static guestToChildrenAccountUrl(
        xMyceliumTenantId: string,
        accountId: string,
        roleId: string,
        requestBody: GuestUserToChildrenBody,
    ): CancelablePromise<GuestUser> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/accounts-manager/guests/accounts/{account_id}/roles/{role_id}',
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
}
