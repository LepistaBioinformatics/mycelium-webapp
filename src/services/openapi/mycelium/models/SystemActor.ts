/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * The System Actors
 *
 * Standard actors used to validate operations during the authorization process
 * in system use-cases.
 *
 */
export type SystemActor = ({
    customRole: string;
} | 'beginner' | 'subscriptionsManager' | 'usersManager' | 'accountManager' | 'guestsManager' | 'gatewayManager' | 'systemManager' | 'tenantOwner' | 'tenantManager' | 'service');

