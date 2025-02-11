/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AzureLoginResponse } from '../models/AzureLoginResponse';
import type { CallbackResponse } from '../models/CallbackResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthAzureService {
    /**
     * Generate the Azure OAuth authorize URL
     * Users should access this URL to start the OAuth2 flow.
     *
     *
     * @param jsonReturn
     * @returns AzureLoginResponse Returns the Azure OAuth authorize URL.
     * @throws ApiError
     */
    public static loginUrl(
        jsonReturn?: boolean | null,
    ): CancelablePromise<AzureLoginResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/adm/auth/azure/login',
            query: {
                'jsonReturn': jsonReturn,
            },
            errors: {
                500: `Azure OAuth is disabled.`,
            },
        });
    }
    /**
     * Callback URL for Azure OAuth2
     * This endpoint is called by Azure after the user authorizes the application.
     *
     *
     * @returns CallbackResponse Returns the Azure OAuth authorize URL.
     * @throws ApiError
     */
    public static tokenUrl(): CancelablePromise<CallbackResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/adm/auth/azure/token',
            errors: {
                400: `Code not found.`,
                401: `CSRF Token expired.`,
                500: `Error on token exchange.`,
            },
        });
    }
}
