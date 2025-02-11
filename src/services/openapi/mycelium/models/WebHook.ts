/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HttpSecret } from './HttpSecret';
import type { WebHookTrigger } from './WebHookTrigger';
export type WebHook = {
    /**
     * The webhook id
     */
    id?: string | null;
    /**
     * The webhook name
     */
    name: string;
    /**
     * The webhook description
     */
    description?: string | null;
    /**
     * The webhook url
     */
    url: string;
    /**
     * The webhook trigger
     */
    trigger: WebHookTrigger;
    /**
     * The webhook is active
     */
    isActive: boolean;
    /**
     * The webhook created date
     */
    created: string;
    /**
     * The webhook updated date
     */
    updated?: string | null;
    secret?: (null | HttpSecret);
};

