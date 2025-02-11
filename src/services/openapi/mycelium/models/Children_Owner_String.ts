/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * A children record
 *
 * This enumerator allow represents the children elements using their primary
 * keys (Ids option) or the true records (Record option).
 */
export type Children_Owner_String = ({
    records: Array<{
        id: string;
        /**
         * The owner email
         *
         * The email of the user that administrate the profile. Email denotes the
         * central part of the profile management. Email should be used to collect
         * licensed IDs and perform guest operations. Thus, it should be unique in
         * the Mycelium platform.
         */
        email: string;
        /**
         * The owner first name
         */
        firstName?: string | null;
        /**
         * The owner last name
         */
        lastName?: string | null;
        /**
         * The owner username
         */
        username?: string | null;
        /**
         * If the owner is the principal account owner
         */
        isPrincipal: boolean;
    }>;
} | {
    ids: Array<string>;
});

