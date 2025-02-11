/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type HttpSecret = ({
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

