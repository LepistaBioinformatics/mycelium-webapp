/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuestRole } from '../models/GuestRole';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ManagersGuestRoleService {
    /**
     * Create system roles
     * System roles should be used to attribute permissions to actors who manage
     * specific parts of the system. This function creates the following roles:
     *
     * - Subscriptions Manager
     * - Users Manager
     * - Account Manager
     * - Guest Manager
     * - Gateway Manager
     * - System Manager
     * - Tenant Manager
     *
     *
     * @returns GuestRole Guest roles created.
     * @throws ApiError
     */
    public static createSystemRolesUrl(): CancelablePromise<Array<GuestRole>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/su/managers/guest-roles',
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
