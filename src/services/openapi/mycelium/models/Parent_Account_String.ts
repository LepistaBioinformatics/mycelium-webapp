/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccountType } from './AccountType';
import type { Children_GuestUser_String } from './Children_GuestUser_String';
import type { Children_User_String } from './Children_User_String';
import type { VerboseStatus } from './VerboseStatus';
/**
 * A parent record
 *
 * This enumerator allow represents the parent elements using their primary
 * key (Id option) or the true record (Record option).
 */
export type Parent_Account_String = ({
    record: {
        /**
         * The Account ID
         */
        id?: string | null;
        /**
         * The Account Name
         */
        name: string;
        /**
         * The Account Slug
         *
         * This is generated from the account name. This is used for programmatic
         * access and verification of the account.
         *
         */
        slug: string;
        /**
         * Account Tags
         *
         * Information about the account. This is used for categorizing and filter
         * account.
         *
         */
        tags?: any[] | null;
        /**
         * Account is active
         *
         * If the account is active. This is used for logic trash and restore
         * account.
         *
         */
        isActive: boolean;
        /**
         * Account is checked
         *
         * If the account was verified by a human. This is used for account
         * verification.
         *
         */
        isChecked: boolean;
        /**
         * Account is archived
         *
         * If the account is archived. This is used for account archiving.
         *
         */
        isArchived: boolean;
        verboseStatus?: (null | VerboseStatus);
        isDefault: boolean;
        /**
         * The Account Owners
         *
         * This is the list of account owners. The account owners are the users who
         * have the account owner role.
         */
        owners: Children_User_String;
        /**
         * The Account Type
         *
         * Account type is the type of the account. The account type is used to
         * categorize the account.
         */
        accountType: AccountType;
        guestUsers?: (null | Children_GuestUser_String);
        /**
         * The Account Created Date
         */
        created: string;
        /**
         * The Account Updated Date
         */
        updated?: string | null;
        /**
         * The Account Meta
         *
         * Store metadata about the account.
         *
         */
        meta?: any | null;
    };
} | {
    id: string;
});

