//
// Try to fetch profile from the session storage. Case it not exists, fetch from
// the API and save it in the session storage.
//

import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSuspenseError from "./use-suspense-error";

const PROFILE_KEY = "myc-profile";

type Profile = components["schemas"]["Profile"];

interface ProfileWithTtl extends Profile {
  ttl: number;
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
    getAccessTokenWithPopup,
    getIdTokenClaims,
    error,
  } = useAuth0();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const { parseHttpError, parseAuth0Error } = useSuspenseError();

  useEffect(() => {
    if (error) parseAuth0Error(error);
  }, [error]);

  /**
   * Filter the licensed resources based on specific roles or permissions
   */
  const hasEnoughPermissions = useMemo(
    () => {
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

        if (!tenantsOwnership) {
          return false;
        }

        if ("records" in tenantsOwnership) {
          if (tenantsOwnership.records.some((tenant) => args?.tenantOwnerNeeded?.includes(tenant.tenant))) {
            return true;
          }
        }

        return false;
      }

      if (!profile?.licensedResources) {
        return false;
      }

      if ("records" in profile?.licensedResources) {
        const roles = args?.roles ?? [];
        const permissions = args?.permissions ?? [];
        const restrictSystemAccount = args?.restrictSystemAccount ?? false;

        const filteredResources = profile?.licensedResources?.records
          ?.filter((resource) => {
            if (roles.length > 0 && permissions.length > 0) {
              return (
                roles.some((role) => resource.role.includes(role)) &&
                permissions.some((permission) => resource.perm.includes(permission))
              );
            }

            if (roles.length > 0) {
              return roles.some((role) => resource.role.includes(role));
            }

            if (permissions.length > 0) {
              return permissions.some((permission) => resource.perm.includes(permission));
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
    },
    [
      profile?.licensedResources,
      args?.roles,
      args?.permissions,
      args?.denyManager,
      args?.denyStaff
    ]
  );

  /**
   * Try to fetch profile from the session storage. Case it not exists, fetch
   * from the API and save it in the session storage.
   */
  const localProfile = useMemo(() => {
    if (!user || !user.email) {
      return null;
    }

    const profile = sessionStorage.getItem(PROFILE_KEY);

    if (profile) {
      let parsedProfile: ProfileWithTtl;

      try {
        parsedProfile = JSON.parse(profile);

        if (!parsedProfile?.owners.map((owner) => owner.email).includes(user.email)) {
          sessionStorage.removeItem(PROFILE_KEY);
          return null;
        }
      } catch (error) {
        return null;
      }

      if (parsedProfile.ttl < Date.now()) {
        sessionStorage.removeItem(PROFILE_KEY);
        return null;
      }

      return parsedProfile;
    }

    return null;
  }, [user]);

  /**
   * Fetch the profile from the API. If the profile is already in the session
   * storage, return it.
   */
  const fetchProfile = useCallback(async () => {
    if (!user || !user.email) {
      return null;
    }

    if (localProfile) {
      return localProfile;
    }

    const accessToken = await getAccessTokenSilently();

    setIsLoadingProfile(true);

    const url = buildPath("/adm/rs/beginners/profile", {
      query: { withUrl: "false" },
    });

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    setIsLoadingProfile(false);

    if (!response.ok) {
      parseHttpError(response);
      return null;
    }

    const profile = await response.json() as Profile;

    if (!profile.owners.map((owner) => owner.email).includes(user.email)) {
      return null;
    }

    const profileWithTtl = {
      ...profile,
      ttl: Date.now() + 1000 * 60 * 2,
    } as ProfileWithTtl;

    sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profileWithTtl));

    return profile;
  }, [user, localProfile]);

  /**
   * Observe the local profile and fetch the remote profile if it changes and
   * the localProfile response is null.
   */
  useEffect(() => {
    fetchProfile()
      .then(setProfile)
      .catch(console.error);
  }, [fetchProfile]);

  return {
    isAuthenticated,
    isLoadingUser,
    isLoadingProfile,
    user,
    profile,
    hasAdminPrivileges: profile?.isStaff || profile?.isManager,
    getAccessTokenSilently,
    getAccessTokenWithPopup,
    getIdTokenClaims,
    hasEnoughPermissions,
  };
}
