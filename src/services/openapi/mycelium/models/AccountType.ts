/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SystemActor } from './SystemActor';
export type AccountType = ('staff' | 'manager' | 'user' | {
    /**
     * Subscription account type
     *
     * A subscription account is a special account type that is used to
     * represent legal entities that have a subscription to the service.
     */
    subscription: {
        tenantId: string;
    };
} | {
    /**
     * Role associated account type
     *
     * Role associated account type is an special type of account, created to
     * connect users to a specific standard role in the application.
     */
    roleAssociated: {
        tenantId: string;
        roleName: string;
        roleId: string;
    };
} | {
    /**
     * Actor associated account type
     */
    actorAssociated: {
        actor: SystemActor;
    };
} | {
    /**
     * Tenant manager account type
     */
    tenantManager: {
        tenantId: string;
    };
});

