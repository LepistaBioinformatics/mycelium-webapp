/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthGoogleService {
    /**
     * Callback URL for Google Oauth2
     * This endpoint is called by Google after the user authorizes the application.
     *
     *
     * @returns any Redirect user to auth url
     * @throws ApiError
     */
    public static googleCallbackUrl(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/adm/auth/google/callback',
        });
    }
}
