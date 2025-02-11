/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LicensedResources } from './LicensedResources';
import type { Owner } from './Owner';
import type { TenantsOwnership } from './TenantsOwnership';
import type { VerboseStatus } from './VerboseStatus';
/**
 * This object should be used over the application layer operations.
 */
export type Profile = {
    owners: Array<Owner>;
    /**
     * The account unique id
     *
     * Such ID is related to the account primary-key instead of the owner
     * primary key. In the case of the subscription accounts (accounts flagged
     * with `is_subscription`) such ID should be propagated along the
     * application flow.
     */
    accId: string;
    /**
     * If profile belongs to a `subscription` account
     *
     * Subscription accounts should be used to manage legal entities. Only
     * subscription accounts should receive guest accounts.
     */
    isSubscription: boolean;
    /**
     * If profile belongs to a `manager` account
     *
     * Manager accounts should be used by users with elevated privileges inside
     * the Mycelium platform. Such user should perform actions like create
     * roles, guest-roles, guest default-user accounts to work into
     * subscription accounts.
     */
    isManager: boolean;
    /**
     * If profile belongs to a `staff` account
     *
     * Staff user has elevated roles into the application. Like managers, staff
     * users has elevated privileges. Only staff user has permission to
     * delegate other staffs.
     */
    isStaff: boolean;
    /**
     * If the account owner is active
     *
     * Profiles exists to abstract account privileges. If the profile is
     * related to an inactive owner the profile could not perform any action.
     * Only staff or manager user should perform the activation of such users.
     */
    ownerIsActive: boolean;
    /**
     * If the account itself is inactive
     *
     * When inactive accounts should not perform internal operations.
     */
    accountIsActive: boolean;
    /**
     * If the account was approved after registration
     *
     * New accounts should be approved by manager or staff users after their
     * registration into the Mycelium platform. Case the approval was
     * performed, this flag should be true.
     */
    accountWasApproved: boolean;
    /**
     * If the account was archived after registration
     *
     * New accounts should be archived. After archived accounts should not be
     * included at default filtering actions.
     */
    accountWasArchived: boolean;
    verboseStatus?: (null | VerboseStatus);
    licensedResources?: (null | LicensedResources);
    tenantsOwnership?: (null | TenantsOwnership);
    /**
     * This argument stores the licensed resources state
     *
     * The licensed_resources_state should store the current filtering state.
     * The filtering state should be populated when a filtering cascade is
     * performed. As example:
     *
     * If a profile with two licensed resources is filtered by the tenant_id
     * the state should store the tenant id used to filter licensed resources.
     *
     * State formatting:
     *
     * ```json
     * [
         * "1:tenantId:123e4567-e89b-12d3-a456-426614174000",
         * ]
         * ```
         *
         * And then, if the used apply a secondary filter, by permission, the state
         * should be updated to:
         *
         * ```json
         * [
             * "1:tenantId:123e4567-e89b-12d3-a456-426614174000",
             * "2:permission:1",
             * ]
             * ```
             *
             * If a consecutive filter with more one tenant is applied, the state
             * should be updated to:
             *
             * ```json
             * [
                 * "1:tenantId:123e4567-e89b-12d3-a456-426614174000",
                 * "2:permission:1",
                 * "3:tenantId:123e4567-e89b-12d3-a456-426614174001",
                 * ]
                 * ```
                 *
                 */
                filteringState?: any[] | null;
            };

