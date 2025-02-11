/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Permission } from './Permission';
/**
 * A children record
 *
 * This enumerator allow represents the children elements using their primary
 * keys (Ids option) or the true records (Record option).
 */
export type Children_GuestRole_String = ({
    records: Array<{
        id?: string | null;
        name: string;
        slug: string;
        description?: string | null;
        permission: Permission;
        children?: (null | Children_GuestRole_String);
    }>;
} | {
    ids: Array<string>;
});

