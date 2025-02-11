/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Email } from './Email';
import type { MultiFactorAuthentication } from './MultiFactorAuthentication';
import type { Parent_Account_String } from './Parent_Account_String';
import type { Provider } from './Provider';
/**
 * A children record
 *
 * This enumerator allow represents the children elements using their primary
 * keys (Ids option) or the true records (Record option).
 */
export type Children_User_String = ({
    records: Array<{
        id?: string | null;
        username: string;
        email: Email;
        firstName?: string | null;
        lastName?: string | null;
        isActive: boolean;
        created: string;
        updated?: string | null;
        account?: (null | Parent_Account_String);
        /**
         * If the user is the principal user of the account.
         *
         * The principal user contains information of the first email that created
         * the account. This information is used to send emails to the principal
         * user.
         *
         * Principal users should not be deleted or deactivated if the account has
         * other users connected.
         *
         */
        isPrincipal: boolean;
        provider?: (null | Provider);
        /**
         * The user TOTP
         *
         * When enabled the user has verified the TOTP and the auth url is set.
         *
         */
        mfa: MultiFactorAuthentication;
    }>;
} | {
    ids: Array<string>;
});

