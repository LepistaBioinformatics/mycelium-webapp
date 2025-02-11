/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateErrorCodeBody } from '../models/CreateErrorCodeBody';
import type { ErrorCode } from '../models/ErrorCode';
import type { UpdateErrorCodeMessageAndDetailsBody } from '../models/UpdateErrorCodeMessageAndDetailsBody';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SystemManagerErrorCodeService {
    /**
     * List available error codes.
     * List accounts with pagination. The `records` field contains a vector of
     * `ErrorCode` model.
     *
     *
     * @param prefix
     * @param code
     * @param isInternal
     * @param skip
     * @param pageSize
     * @returns ErrorCode Fetching success.
     * @throws ApiError
     */
    public static listErrorCodesUrl(
        prefix?: string | null,
        code?: number | null,
        isInternal?: boolean | null,
        skip?: number | null,
        pageSize?: number | null,
    ): CancelablePromise<Array<ErrorCode>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/adm/rs/system-manager/error-codes',
            query: {
                'prefix': prefix,
                'code': code,
                'isInternal': isInternal,
                'skip': skip,
                'pageSize': pageSize,
            },
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Register a new error code.
     * This action is restricted to manager users.
     * @param requestBody
     * @returns ErrorCode Error code created.
     * @throws ApiError
     */
    public static registerErrorCodeUrl(
        requestBody: CreateErrorCodeBody,
    ): CancelablePromise<ErrorCode> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/system-manager/error-codes',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Error code already exists.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Get an error code.
     * Get error code by prefix and code.
     *
     *
     * @param prefix The error prefix.
     * @param code The error code.
     * @returns ErrorCode Fetching success.
     * @throws ApiError
     */
    public static getErrorCodeUrl(
        prefix: string,
        code: number,
    ): CancelablePromise<ErrorCode> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/adm/rs/system-manager/error-codes/prefixes/{prefix}/codes/{code}',
            path: {
                'prefix': prefix,
                'code': code,
            },
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Delete an error code.
     * Delete error code by prefix and code.
     *
     *
     * @param prefix The error prefix.
     * @param code The error code.
     * @returns void
     * @throws ApiError
     */
    public static deleteErrorCodeUrl(
        prefix: string,
        code: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/adm/rs/system-manager/error-codes/prefixes/{prefix}/codes/{code}',
            path: {
                'prefix': prefix,
                'code': code,
            },
            errors: {
                400: `Error code not deleted.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Update an error code.
     * Update error code message and details.
     *
     *
     * @param prefix The error prefix.
     * @param code The error code.
     * @param requestBody
     * @returns ErrorCode Error code updated.
     * @throws ApiError
     */
    public static updateErrorCodeMessageAndDetailsUrl(
        prefix: string,
        code: number,
        requestBody: UpdateErrorCodeMessageAndDetailsBody,
    ): CancelablePromise<ErrorCode> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/adm/rs/system-manager/error-codes/prefixes/{prefix}/codes/{code}',
            path: {
                'prefix': prefix,
                'code': code,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Error code not updated.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
