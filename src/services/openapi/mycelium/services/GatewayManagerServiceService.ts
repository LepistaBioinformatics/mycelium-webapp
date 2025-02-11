/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Service } from '../models/Service';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GatewayManagerServiceService {
    /**
     * List routes by service
     * This function is restricted to the GatewayManager users. List routes by
     * service name or service id.
     *
     *
     * @param id
     * @param name
     * @returns Service Fetching success.
     * @throws ApiError
     */
    public static listServicesUrl(
        id?: string | null,
        name?: string | null,
    ): CancelablePromise<Array<Service>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/adm/rs/gateway-manager/services',
            query: {
                'id': id,
                'name': name,
            },
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
