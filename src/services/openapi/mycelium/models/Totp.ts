/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Totp = ('unknown' | 'disabled' | {
    /**
     * The TOTP when enabled
     *
     * The TOTP is enabled when the user has verified the TOTP and the auth
     * url is set. The secret is not serialized to avoid that the secret is
     * exposed to the outside.
     *
     */
    enabled: {
        verified: boolean;
        issuer: string;
        secret?: string | null;
    };
});

