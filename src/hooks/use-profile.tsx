//
// Fetch the requester profile through SWR, shared by every component that
// calls `useProfile`.
//

import { components } from "@/services/openapi/mycelium-schema";
import { profileGet } from "@/services/rpc/beginners";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import useNativeAuth from "@/hooks/use-native-auth";
import { useCallback, useEffect, useMemo } from "react";
import useSWR, { mutate as mutateGlobal } from "swr";
import useSuspenseError from "./use-suspense-error";

const PROFILE_SWR_KEY = "myc-profile";

type Profile = components["schemas"]["Profile"];

/**
 * Refetch the profile in every mounted `useProfile`.
 *
 * Call it right after anything that changes the current user's profile, e.g.
 * creating the account: otherwise the app keeps the profile it loaded before
 * (`null` for a user who had no account yet, leaving the dashboard routes
 * unregistered) until the next revalidation.
 */
export async function invalidateProfile(): Promise<void> {
  await mutateGlobal(
    (key) => Array.isArray(key) && key[0] === PROFILE_SWR_KEY
  );
}

interface Props {
  /**
   * The roles to filter the licensed resources
   */
  roles?: MycRole[];
  /**
   * Should be tenant owner
   */
  tenantOwnerNeeded?: string[];
  /**
   * The permissions to filter the licensed resources
   */
  permissions?: MycPermission[];
  /**
   * Should be a system account. Default is false.
   */
  restrictSystemAccount?: boolean;
  /**
   * Whether to deny manager access. Default is false.
   */
  denyManager?: boolean;
  /**
   * Whether to deny staff access. Default is false.
   */
  denyStaff?: boolean;
  /**
   * Whether the user should be a manager. Default is false.
   */
  shouldBeManager?: boolean;
  /**
   * Whether the user should be a staff. Default is false.
   */
  shouldBeStaff?: boolean;
}

/**
 * Hook to fetch the profile from the API.
 *
 * @param args - Optional arguments.
 * @param args.withUrl - Whether to include the URL in the profile. Otherwise,
 * the profile will return licensed resources and tenant ownership as JSON
 * objects.
 */
export default function useProfile(args?: Props) {
  const {
    user,
    isAuthenticated,
    isLoading: isLoadingUser,
    getAccessTokenSilently,
    logout,
    loginWithRedirect,
    error,
  } = useNativeAuth();


  const { parseAuthError } = useSuspenseError();

  const emailKey = user?.email
    ? `${user.email.username}@${user.email.domain}`
    : null;

  const fetchProfile = useCallback(async (): Promise<Profile | null> => {
    if (!emailKey) return null;

    const profile = await profileGet({ withUrl: false }, getAccessTokenSilently);

    if (!profile.owners.map((owner) => owner.email).includes(emailKey)) {
      return null;
    }

    return profile;
  }, [emailKey, getAccessTokenSilently]);

  // No browser-side TTL cache: profile changes (an invitation, a tenant
  // ownership) must show up quickly. SWR keeps the last profile in memory
  // while it revalidates — when a screen mounts (deduped across the many
  // `useProfile` callers) and when the tab regains focus — so screens never
  // flash empty. A user without an account gets an error here (403) and no
  // profile; the onboarding creates the account and calls
  // `invalidateProfile`.
  const { data, isLoading: isLoadingProfile } = useSWR(
    emailKey ? [PROFILE_SWR_KEY, emailKey] : null,
    fetchProfile,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
    }
  );

  const profile = data ?? null;

  useEffect(() => {
    if (error) parseAuthError(error);
  }, [error, parseAuthError]);

  /**
   * Filter the licensed resources based on specific roles or permissions
   */
  const hasEnoughPermissions = useMemo(() => {
    if (
      (profile?.isStaff && !args?.denyStaff) ||
      (args?.shouldBeStaff && profile?.isStaff && !args?.denyStaff)
    ) {
      return true;
    }

    if (
      (profile?.isManager && !args?.denyManager) ||
      (args?.shouldBeManager && profile?.isManager && !args?.denyManager)
    ) {
      return true;
    }

    if (args?.tenantOwnerNeeded) {
      const tenantsOwnership = profile?.tenantsOwnership;

      if (tenantsOwnership && "records" in tenantsOwnership) {
        if (
          tenantsOwnership.records.some((tenant) =>
            args?.tenantOwnerNeeded?.includes(tenant.id)
          )
        ) {
          return true;
        }
      }
    }

    // eslint-disable-next-line no-unsafe-optional-chaining
    if (profile?.licensedResources && "records" in profile?.licensedResources) {
      const roles = args?.roles ?? [];
      const permissions = args?.permissions ?? [];
      const restrictSystemAccount = args?.restrictSystemAccount ?? false;

      const filteredResources = profile?.licensedResources?.records
        ?.filter((resource) => {
          if (roles.length > 0 && permissions.length > 0) {
            return (
              roles.some((role) => resource.role.includes(role)) &&
              permissions.some(
                (permission) =>
                  getNumericPermission(resource.perm) >=
                  getNumericPermission(permission)
              )
            );
          }

          if (roles.length > 0) {
            return roles.some((role) => resource.role.includes(role));
          }

          if (permissions.length > 0) {
            return permissions.some((permission) =>
              resource.perm.includes(permission)
            );
          }

          return false;
        })
        ?.filter((resource) => {
          if (restrictSystemAccount && !resource.sysAcc) {
            return false;
          }

          return true;
        });

      return filteredResources.length > 0;
    }

    return false;
  }, [
    profile?.isStaff,
    profile?.isManager,
    profile?.licensedResources,
    profile?.tenantsOwnership,
    args?.denyStaff,
    args?.shouldBeStaff,
    args?.denyManager,
    args?.shouldBeManager,
    args?.tenantOwnerNeeded,
    args?.roles,
    args?.permissions,
    args?.restrictSystemAccount,
  ]);


  return {
    isAuthenticated,
    isLoadingUser,
    isLoadingProfile,
    user,
    profile,
    hasAdminPrivileges: profile?.isStaff || profile?.isManager,
    getAccessTokenSilently,
    logout,
    loginWithRedirect,
    hasEnoughPermissions,
  };
}

function getNumericPermission(permission: MycPermission | string): number {
  switch (permission) {
    case MycPermission.Read:
      return 0;
    case MycPermission.Write:
      return 1;
    default:
      return 0;
  }
}
