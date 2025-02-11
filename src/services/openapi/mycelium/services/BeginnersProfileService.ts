/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Profile } from '../models/Profile';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BeginnersProfileService {
    /**
     * Fetch a user's profile.
     * @param withUrl
     * @returns Profile Profile fetching done.
     * @throws ApiError
     */
    public static fetchProfileUrl(
        withUrl?: boolean | null,
    ): CancelablePromise<Profile> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/adm/rs/beginners/profile',
            query: {
                'withUrl': withUrl,
            },
            errors: {
                400: `Bad request.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
