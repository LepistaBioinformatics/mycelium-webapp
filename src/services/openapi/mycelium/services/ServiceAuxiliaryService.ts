/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ServiceAuxiliaryService {
    /**
     * Provide a datetime with the server's timezone.
     * This is usual during system checks.
     * @returns string The current datetime with timezone.
     * @throws ApiError
     */
    public static listActorsUrl(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/adm/svc/auxiliary/actors',
        });
    }
}
