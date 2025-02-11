/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Children_GuestRole_String } from './Children_GuestRole_String';
import type { Permission } from './Permission';
/**
 * A parent record
 *
 * This enumerator allow represents the parent elements using their primary
 * key (Id option) or the true record (Record option).
 */
export type Parent_GuestRole_String = ({
    record: {
        id?: string | null;
        name: string;
        slug: string;
        description?: string | null;
        permission: Permission;
        children?: (null | Children_GuestRole_String);
    };
} | {
    id: string;
});

