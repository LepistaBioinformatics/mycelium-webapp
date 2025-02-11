/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RouteType = ('public' | 'protected' | {
    /**
     *
     * Protect the route with the user profile filtered by roles
     *
     */
    protectedByRoles: {
        roles: Array<string>;
    };
} | {
    /**
     *
     * Protect the route with the user profile filtered by roles and
     * permissions
     *
     */
    protectedByPermissionedRoles: {
        permissionedRoles: Array<any[]>;
    };
} | {
    /**
     *
     * Protect the route with service token associated to a specific role list
     *
     */
    protectedByServiceTokenWithRole: {
        roles: Array<string>;
    };
} | {
    /**
     *
     * Protect the route with service token associated to a specific role and
     * permissions
     *
     */
    protectedByServiceTokenWithPermissionedRoles: {
        permissionedRoles: Array<any[]>;
    };
});

