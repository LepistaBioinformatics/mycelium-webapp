/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Permission } from './Permission';
export type LicensedResource = {
    /**
     * The guest account unique id
     *
     * This is the unique identifier of the account that is own of the
     * resource to be managed.
     */
    accId: string;
    /**
     * If the guest account is a system account
     *
     * System accounts has permissions to act as special users into the
     * Mycelium system.
     */
    sysAcc: boolean;
    /**
     * The guest account tenant unique id
     *
     * This is the unique identifier of the tenant that is own of the resource
     * to be managed.
     */
    tenantId: string;
    /**
     * The guest account name
     *
     * This is the name of the account that is own of the resource to be
     * managed.
     */
    accName: string;
    /**
     * The guest account role verbose name
     *
     * This is the verbose name of the role that is own of the resource to be
     * managed.
     */
    role: string;
    /**
     * The guest role permissions
     *
     * This is the list of permissions that the guest role has.
     */
    perm: Permission;
    /**
     * If the guest account was verified
     *
     * If the user accepted the invitation to join the account, the account
     * should be verified.
     *
     */
    verified: boolean;
};

