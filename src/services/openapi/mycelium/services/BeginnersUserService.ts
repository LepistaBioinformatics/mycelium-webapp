/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CheckTokenBody } from '../models/CheckTokenBody';
import type { CheckUserCredentialsBody } from '../models/CheckUserCredentialsBody';
import type { CreateDefaultUserBody } from '../models/CreateDefaultUserBody';
import type { MyceliumLoginResponse } from '../models/MyceliumLoginResponse';
import type { ResetPasswordBody } from '../models/ResetPasswordBody';
import type { StartPasswordResetBody } from '../models/StartPasswordResetBody';
import type { TotpUpdatingValidationBody } from '../models/TotpUpdatingValidationBody';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BeginnersUserService {
    /**
     * Register user
     * This route should be used to register a new user. If the Bearer token is
     * included in the request, the user will be registered with the provider
     * informed in the token. Otherwise, the password is required.
     *
     *
     * @param requestBody
     * @param authorization An optional Bearer token. When included, the user will be registered with the provider informed in the token.
     * @returns User User successfully created.
     * @throws ApiError
     */
    public static createDefaultUserUrl(
        requestBody: CreateDefaultUserBody,
        authorization?: string | null,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/beginners/users',
            headers: {
                'Authorization': authorization,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Login with email and password
     * This route should be used to login with email and password. If the user has
     * enabled the TOTP app, the user will be redirected to the TOTP activation
     * route.
     *
     *
     * @param requestBody
     * @returns MyceliumLoginResponse Credentials are valid.
     * @throws ApiError
     */
    public static checkEmailPasswordValidityUrl(
        requestBody: CheckUserCredentialsBody,
    ): CancelablePromise<MyceliumLoginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/beginners/users/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Check token and reset password
     * This route should be used to check the token and reset the password.
     *
     *
     * @param requestBody
     * @returns boolean Password change requested.
     * @throws ApiError
     */
    public static checkTokenAndResetPasswordUrl(
        requestBody: ResetPasswordBody,
    ): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/beginners/users/reset-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Start password redefinition
     * This route should be used to start the password redefinition process.
     *
     *
     * @param requestBody
     * @returns boolean Password change requested.
     * @throws ApiError
     */
    public static startPasswordRedefinitionUrl(
        requestBody: StartPasswordResetBody,
    ): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/beginners/users/start-password-reset',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Check email status
     * Check if the email is already registered.
     *
     *
     * @param email The email to be checked.
     * @returns string Success.
     * @throws ApiError
     */
    public static checkEmailRegistrationStatusUrl(
        email: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/adm/rs/beginners/users/status',
            query: {
                'email': email,
            },
            responseHeader: 'X-Account-Created',
            errors: {
                400: `Bad request.`,
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Check TOTP token
     * This route should be used to check the TOTP token when tht totp app is
     * enabled.
     *
     *
     * @param requestBody
     * @returns MyceliumLoginResponse Credentials are valid.
     * @throws ApiError
     */
    public static totpCheckTokenUrl(
        requestBody: TotpUpdatingValidationBody,
    ): CancelablePromise<MyceliumLoginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/beginners/users/totp/check-token',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Disable TOTP
     * This route should be used to disable the TOTP app.
     *
     *
     * @param requestBody
     * @returns MyceliumLoginResponse Credentials are valid.
     * @throws ApiError
     */
    public static totpDisableUrl(
        requestBody: TotpUpdatingValidationBody,
    ): CancelablePromise<MyceliumLoginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/beginners/users/totp/disable',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Enable TOTP
     * This route should be used to enable the TOTP app. Before enabling the TOTP
     * the user must be authenticated using the `/login/` route.
     *
     *
     * @param qrCode
     * @returns string Totp Activation Started.
     * @throws ApiError
     */
    public static totpStartActivationUrl(
        qrCode?: boolean | null,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/beginners/users/totp/enable',
            query: {
                'qrCode': qrCode,
            },
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Validate TOTP app
     * This route should be used to validate the TOTP app after enabling it.
     *
     *
     * @param requestBody
     * @returns MyceliumLoginResponse Credentials are valid.
     * @throws ApiError
     */
    public static totpFinishActivationUrl(
        requestBody: TotpUpdatingValidationBody,
    ): CancelablePromise<MyceliumLoginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/beginners/users/totp/validate-app',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
    /**
     * Check token and activate user
     * This route should be used to check the token and activate the user.
     *
     *
     * @param requestBody
     * @returns boolean Activation token is valid.
     * @throws ApiError
     */
    public static checkUserTokenUrl(
        requestBody: CheckTokenBody,
    ): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/adm/rs/beginners/users/validate-activation-token',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized.`,
                403: `Forbidden.`,
                500: `Unknown internal server error.`,
            },
        });
    }
}
