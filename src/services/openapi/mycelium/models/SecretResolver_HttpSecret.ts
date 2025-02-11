/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * A secret resolver
 *
 * The secret resolver is a way to resolve a secret value from different
 * sources.
 *
 */
export type SecretResolver_HttpSecret = ({
    /**
     * Retrieve the value from the environment variable
     *
     * The value should be the name of the environment variable.
     *
     * # Example
     *
     * ```bash
     * export MY_ENV_VAR="my_value"
     * ```
     *
     * ```yaml
     * databaseUrl:
     * env: "MY_ENV_VAR"
     * ```
     *
     * The value of `databaseUrl` will be `my_value`
     *
     */
    env: string;
} | {
    /**
     * Retrieve the value from the vault
     *
     * The value should be the name of the vault secret.
     *
     * # Example
     *
     * ```yaml
     * databaseUrl:
     * vault:
     * path: "my_vault_secret"
     * key: "my_key"
     * ```
     *
     * The value of `databaseUrl` will be the value of the secret located at
     * `path/my_vault_secret` in the vault.
     *
     */
    vault: {
        path: string;
        key: string;
    };
} | {
    value: ({
        /**
         * Authentication header
         *
         * The secret is passed as an authentication header.
         *
         */
        authorizationHeader: {
            /**
             * The header name
             *
             * The name of the header. For example, if the name is `Authorization`,
             * the header will be `Authorization Bear: <token value>`. The default
             * value is `Authorization`.
             *
             */
            headerName?: string | null;
            /**
             * The header prefix
             *
             * If present the prefix is added to the header. For example, if the
             * prefix is `Bearer`, the header will be `Authorization Bearer: <token
             * value>`.
             *
             */
            prefix?: string | null;
            /**
             * The header token
             *
             * The token is the value of the header. For example, if the token is
             * `1234`, the header will be `Authorization Bearer: 123
             *
             */
            token: string;
        };
    } | {
        queryParameter: {
            /**
             * The query parameter name
             *
             * The name of the query parameter. For example, if the name is `token`,
             * the query parameter will be `?token=<token value>`.
             *
             */
            name: string;
            /**
             * The query parameter value
             *
             * The value of the query parameter. For example, if the value is `1234`,
             * the query parameter will be `?token=1234`.
             *
             */
            token: string;
        };
    });
});

