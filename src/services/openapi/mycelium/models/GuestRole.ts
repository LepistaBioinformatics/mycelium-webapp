/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Children_GuestRole_String } from './Children_GuestRole_String';
import type { Permission } from './Permission';
export type GuestRole = {
    id?: string | null;
    name: string;
    slug: string;
    description?: string | null;
    permission: Permission;
    children?: (null | Children_GuestRole_String);
};

