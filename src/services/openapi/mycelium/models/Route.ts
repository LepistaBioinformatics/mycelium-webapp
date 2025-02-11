/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HttpMethod } from './HttpMethod';
import type { Parent_Service_String } from './Parent_Service_String';
import type { Protocol } from './Protocol';
import type { RouteType } from './RouteType';
export type Route = {
    /**
     * The route id
     */
    id?: string | null;
    /**
     * The route service
     */
    service: Parent_Service_String;
    /**
     * The route name
     */
    group: RouteType;
    /**
     * The route description
     */
    methods: Array<HttpMethod>;
    /**
     * The route url
     */
    path: string;
    /**
     * The route protocol
     */
    protocol: Protocol;
    /**
     * The route is active
     */
    allowedSources?: any[] | null;
    /**
     * The route secret name if it exists
     */
    secretName?: string | null;
    /**
     * The route without tls
     *
     * This field should be evaluated if the route should request a secret to
     * be send to the downstream service, if the route is not secure.
     *
     */
    acceptInsecureRouting?: boolean | null;
};

