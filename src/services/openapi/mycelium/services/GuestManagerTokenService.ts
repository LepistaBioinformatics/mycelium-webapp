/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTokenBody } from '../models/CreateTokenBody';
import type { CreateTokenResponse } from '../models/CreateTokenResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GuestManagerTokenService {
    /**
     * Create Account Associated Token
     * This action creates a token that is associated with the account specified
     * in the `account_id` argument. The token is scoped to the roles specified
     * in the `permissioned_roles` argument.
     *
     *
     * @param accountId The account unique id.
     * @param requestBody
     * @returns CreateTokenResponse Token created.
     * @throws ApiError
     */
    public static createDefaultAccountAssociatedConnectionStringUrl(
        accountId: string,
        requestBody: CreateTokenBody,
    ): CancelablePromise<CreateTokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/guests-manager/tokens/accounts/{account_id}',
            path: {
                'account_id': accountId,
            },
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
     * Create Role Associated Token
     * This action creates a token that is associated with the role specified
     * in the `role_id` argument. The token is scoped to the roles specified
     * in the `permissioned_roles` argument.
     *
     *
     * @param roleId The role unique id.
     * @param requestBody
     * @returns CreateTokenResponse Token created.
     * @throws ApiError
     */
    public static createRoleAssociatedConnectionStringUrl(
        roleId: string,
        requestBody: CreateTokenBody,
    ): CancelablePromise<CreateTokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/guests-manager/tokens/roles/{role_id}',
            path: {
                'role_id': roleId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
