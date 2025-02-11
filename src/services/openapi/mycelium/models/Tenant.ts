/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Children_Owner_String } from './Children_Owner_String';
import type { Parent_Account_String } from './Parent_Account_String';
export type Tenant = {
    /**
     * The unique identifier of the tenant
     */
    id?: string | null;
    /**
     * The name of the tenant
     */
    name: string;
    /**
     * The description of the tenant
     */
    description?: string | null;
    /**
     * The owner of the tenant
     *
     * This is the email of the tenant owner, which is also the pub owner. The
     * tenant owner should be set on tenant creation.
     */
    owners: Children_Owner_String;
    manager?: (null | Parent_Account_String);
    /**
     * The tags of the tenant
     *
     * This is the list of tags of the tenant. The tags are used to categorize
     * the tenant. The tags are used to categorize the tenant.
     */
    tags?: any[] | null;
    /**
     * Meta information
     *
     * This is the meta information of the tenant. The meta information is a
     * key-value pair of string. The key is the name of the meta information,
     * and the value is the value of the meta information.
     */
    meta?: any | null;
    /**
     * The status of the tenant
     *
     * This is the status of the tenant. The status is a key-value pair of
     * string. The key is the name of the status (defined in `StatusKey`), and
     * the value is the value of the status.
     */
    status?: any[] | null;
    /**
     * The date and time the tenant was created
     */
    created: string;
    /**
     * The date and time the tenant was last updated
     */
    updated?: string | null;
};

