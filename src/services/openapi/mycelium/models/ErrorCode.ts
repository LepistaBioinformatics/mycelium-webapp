/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * ErrorCode is a struct that represents an error code.
 *
 * It is used to represent errors that occur in the system. Error should be
 * internal or external. Internal errors are errors that are not expected to
 * occur in the system. External errors are errors that are not expected to
 * occur in the system.
 */
export type ErrorCode = {
    /**
     * The prefix of the error.
     */
    prefix: string;
    /**
     * The code of the error.
     */
    errorNumber: number;
    /**
     * A compiled string of the prefix and code.
     */
    code?: string | null;
    /**
     * The message of the error.
     */
    message: string;
    /**
     * The details of the error.
     */
    details?: string | null;
    /**
     * Whether the error is internal or external.
     */
    isInternal: boolean;
    /**
     * Whether the error is native of mycelium or not.
     */
    isNative: boolean;
};

