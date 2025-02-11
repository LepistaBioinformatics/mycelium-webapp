/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ListLicensedAccountsOfEmailParams = {
    /**
     * The email which the guest user is connected to
     */
    email: string;
    /**
     * The roles which the guest user was invited to
     */
    roles?: any[] | null;
    /**
     * The permissioned roles which the guest user was invited to
     */
    permissionedRoles?: any[] | null;
    /**
     * The guest user was verified
     */
    wasVerified?: boolean | null;
};

