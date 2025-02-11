/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Account } from '../models/Account';
import type { ServiceGuestUserBody } from '../models/ServiceGuestUserBody';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ServiceGuestService {
    /**
     * Guest a user to work on account.
     * This action gives the ability of the target account (specified through
     * the `account` argument) to perform actions specified in the `role`
     * path argument.
     * @param roleId The guest-role unique id.
     * @param xMyceliumConnectionString The connection string to the role-scoped database.
     * @param requestBody
     * @returns Account Guest already exist.
     * @throws ApiError
     */
    public static guestToDefaultAccountUrl(
        roleId: string,
        xMyceliumConnectionString: string,
        requestBody: ServiceGuestUserBody,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/svc/guests/roles/{role_id}',
            path: {
                'role_id': roleId,
            },
            headers: {
                'x-mycelium-connection-string': xMyceliumConnectionString,
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
