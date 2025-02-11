/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateGuestRoleBody } from '../models/CreateGuestRoleBody';
import type { GuestRole } from '../models/GuestRole';
import type { UpdateGuestRoleNameAndDescriptionBody } from '../models/UpdateGuestRoleNameAndDescriptionBody';
import type { UpdateGuestRolePermissionsBody } from '../models/UpdateGuestRolePermissionsBody';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GuestManagerGuestRoleService {
    /**
     * List Roles
     * @param name
     * @returns GuestRole Success.
     * @throws ApiError
     */
    public static listGuestRolesUrl(
        name?: string | null,
    ): CancelablePromise<Array<GuestRole>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/adm/rs/guests-manager/guest-roles',
            query: {
                'name': name,
            },
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Create Guest Role
     * Guest Roles provide permissions to simple Roles.
     * @param requestBody
     * @returns GuestRole Guest Role already exists.
     * @throws ApiError
     */
    public static crateGuestRoleUrl(
        requestBody: CreateGuestRoleBody,
    ): CancelablePromise<GuestRole> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/guests-manager/guest-roles',
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
     * Delete Guest Role
     * Delete a single guest role.
     * @param guestRoleId The guest-role primary key.
     * @returns void
     * @throws ApiError
     */
    public static deleteGuestRoleUrl(
        guestRoleId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/adm/rs/guests-manager/guest-roles/{guest_role_id}',
            path: {
                'guest_role_id': guestRoleId,
            },
            errors: {
                400: `Guest Role not deleted.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Partial Update Guest Role
     * Update name and description of a single Guest Role.
     * @param guestRoleId The guest-role primary key.
     * @param requestBody
     * @returns GuestRole Guest Role updated.
     * @throws ApiError
     */
    public static updateGuestRoleNameAndDescriptionUrl(
        guestRoleId: string,
        requestBody: UpdateGuestRoleNameAndDescriptionBody,
    ): CancelablePromise<GuestRole> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/adm/rs/guests-manager/guest-roles/{guest_role_id}',
            path: {
                'guest_role_id': guestRoleId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Guest Role not deleted.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Set Child Role
     * Insert a child role to a parent role.
     * @param guestRoleId The guest-role primary key.
     * @param childId The child guest-role primary key.
     * @param requestBody
     * @returns GuestRole Guest Role updated.
     * @throws ApiError
     */
    public static insertRoleChildUrl(
        guestRoleId: string,
        childId: string,
        requestBody: UpdateGuestRolePermissionsBody,
    ): CancelablePromise<GuestRole> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/guests-manager/guest-roles/{guest_role_id}/children/{child_id}',
            path: {
                'guest_role_id': guestRoleId,
                'child_id': childId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Guest Role not deleted.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Delete Child Role
     * Delete a child role to a parent role.
     * @param guestRoleId The guest-role primary key.
     * @param childId The child guest-role primary key.
     * @param requestBody
     * @returns GuestRole Guest Role updated.
     * @throws ApiError
     */
    public static removeRoleChildUrl(
        guestRoleId: string,
        childId: string,
        requestBody: UpdateGuestRolePermissionsBody,
    ): CancelablePromise<GuestRole> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/adm/rs/guests-manager/guest-roles/{guest_role_id}/children/{child_id}',
            path: {
                'guest_role_id': guestRoleId,
                'child_id': childId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Guest Role not deleted.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Change permissions of Guest Role
     * Upgrade or Downgrade permissions of Guest Role.
     * @param guestRoleId The guest-role primary key.
     * @param requestBody
     * @returns GuestRole Guest Role updated.
     * @throws ApiError
     */
    public static updateGuestRolePermissionsUrl(
        guestRoleId: string,
        requestBody: UpdateGuestRolePermissionsBody,
    ): CancelablePromise<GuestRole> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/adm/rs/guests-manager/guest-roles/{guest_role_id}/permissions',
            path: {
                'guest_role_id': guestRoleId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Guest Role not deleted.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
