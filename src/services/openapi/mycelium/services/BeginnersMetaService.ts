/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateAccountMetaBody } from '../models/CreateAccountMetaBody';
import type { DeleteAccountMetaParams } from '../models/DeleteAccountMetaParams';
import type { HashMap } from '../models/HashMap';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BeginnersMetaService {
    /**
     * Update a account metadata
     * @param requestBody
     * @returns any Meta updated.
     * @throws ApiError
     */
    public static updateAccountMetaUrl(
        requestBody: CreateAccountMetaBody,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/adm/rs/beginners/meta',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Meta not updated.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Register a account metadata
     * @param requestBody
     * @returns HashMap Meta created.
     * @throws ApiError
     */
    public static createAccountMetaUrl(
        requestBody: CreateAccountMetaBody,
    ): CancelablePromise<HashMap> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/beginners/meta',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Meta already exists.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Delete a account metadata
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static deleteAccountMetaUrl(
        requestBody: DeleteAccountMetaParams,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/adm/rs/beginners/meta',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Meta not deleted.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
