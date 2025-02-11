/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Route } from '../models/Route';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GatewayManagerRouteService {
    /**
     * List routes by service
     * This function is restricted to the GatewayManager users. List routes by
     * service name or service id.
     *
     *
     * @param id
     * @param name
     * @param includeServiceDetails
     * @returns Route Fetching success.
     * @throws ApiError
     */
    public static listRoutesUrl(
        id?: string | null,
        name?: string | null,
        includeServiceDetails?: boolean | null,
    ): CancelablePromise<Array<Route>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/adm/rs/gateway-manager/routes',
            query: {
                'id': id,
                'name': name,
                'includeServiceDetails': includeServiceDetails,
            },
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
