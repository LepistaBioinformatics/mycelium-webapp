/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HealthCheckConfig } from './HealthCheckConfig';
import type { UntaggedChildren_Route_String } from './UntaggedChildren_Route_String';
/**
 * A parent record
 *
 * This enumerator allow represents the parent elements using their primary
 * key (Id option) or the true record (Record option).
 */
export type Parent_Service_String = ({
    /**
     * The Upstream Service
     *
     * The service is the upstream service that the route will proxy to.
     *
     */
    record: {
        /**
         * The service id
         */
        id?: string | null;
        /**
         * The service unique name
         */
        name: string;
        /**
         * The service host
         */
        host: string;
        healthCheck?: (null | HealthCheckConfig);
        /**
         * The service routes
         */
        routes: UntaggedChildren_Route_String;
        /**
         * The service secrets
         */
        secrets?: any[] | null;
    };
} | {
    id: string;
});

