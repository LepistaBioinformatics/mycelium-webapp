/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Children_Account_String } from './Children_Account_String';
import type { Email } from './Email';
import type { Parent_GuestRole_String } from './Parent_GuestRole_String';
export type GuestUser = {
    /**
     * The guest user id
     */
    id?: string | null;
    /**
     * The guest user email
     *
     * The email is used to identify the guest user connection with the target
     * account.
     *
     */
    email: Email;
    /**
     * The guest user role
     */
    guestRole: Parent_GuestRole_String;
    /**
     * The guesting date
     */
    created: string;
    /**
     * The last updated date
     */
    updated?: string | null;
    accounts?: (null | Children_Account_String);
    /**
     * The guest user is verified
     *
     * WHile the user is not verified, the user will not be able to access
     * the account.
     *
     */
    wasVerified: boolean;
};

