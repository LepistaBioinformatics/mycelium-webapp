/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIAccountType } from './APIAccountType';
import type { SystemActor } from './SystemActor';
import type { VerboseStatus } from './VerboseStatus';
export type ListSubscriptionAccountParams = {
    term?: string | null;
    tagValue?: string | null;
    accountType?: (null | APIAccountType);
    isOwnerActive?: boolean | null;
    status?: (null | VerboseStatus);
    roleName?: string | null;
    roleId?: string | null;
    actor?: (null | SystemActor);
};

