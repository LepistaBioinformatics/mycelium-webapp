/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
export type MyceliumLoginResponse = (User & {
    token: string;
    duration: string;
    totpRequired: boolean;
});

