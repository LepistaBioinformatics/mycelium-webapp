/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HttpSecret } from './HttpSecret';
import type { WebHookTrigger } from './WebHookTrigger';
export type CreateWebHookBody = {
    name: string;
    description?: string | null;
    url: string;
    trigger: WebHookTrigger;
    secret?: (null | HttpSecret);
};

