/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSystemSubscriptionAccountBody } from '../models/CreateSystemSubscriptionAccountBody';
import type { GuestRole } from '../models/GuestRole';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ManagersAccountsService {
    /**
     * Create all system roles
     * @param requestBody
     * @returns GuestRole Account created.
     * @throws ApiError
     */
    public static createSystemAccountUrl(
        requestBody: CreateSystemSubscriptionAccountBody,
    ): CancelablePromise<Array<GuestRole>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/su/managers/accounts',
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
