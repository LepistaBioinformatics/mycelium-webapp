/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GuestUserToChildrenBody = {
    /**
     * The email of the guest user
     */
    email: string;
    /**
     * The parent role id
     *
     * The parent related to the guest role to be created. Example, if the
     * guest role is a child of the account manager role, the parent role id
     * should be this role id.
     *
     * The child role id should be passed as the `role_id` path argument.
     */
    parentRoleId: string;
};

