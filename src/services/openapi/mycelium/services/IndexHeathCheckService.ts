/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IndexHeathCheckService {
    /**
     * Provide a health check endpoint.
     * If the server is running it returns a 200 response with a JSON body
     * containing the success message.
     * @returns string Health check passed.
     * @throws ApiError
     */
    public static healthUrl(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/health',
        });
    }
    /**
     * Provide a datetime with the server's timezone.
     * This is usual during system checks.
     * @returns string The current datetime with timezone.
     * @throws ApiError
     */
    public static nowUrl(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/health/now',
        });
    }
}
