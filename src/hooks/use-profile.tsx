//
// Try to fetch profile from the session storage. Case it not exists, fetch from
// the API and save it in the session storage.
//

import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const PROFILE_KEY = "myc-profile";

type Profile = components["schemas"]["Profile"];

interface ProfileWithTtl extends Profile {
  ttl: number;
}

/**
 * Hook to fetch the profile from the API.
 * 
 * @param args - Optional arguments.
 * @param args.withUrl - Whether to include the URL in the profile. Otherwise,
 * the profile will return licensed resources and tenant ownership as JSON
 * objects.
 */
interface Props {
  withUrl?: boolean;
}

export default function useProfile(args?: Props) {
  const {
    user,
    isAuthenticated,
    isLoading: isLoadingUser,
    getAccessTokenSilently,
    getAccessTokenWithPopup,
    getIdTokenClaims,
  } = useAuth0();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

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
      query: {
        withUrl: args?.withUrl ? "true" : "false",
      },
    });

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    setIsLoadingProfile(false);

    if (!response.ok) {
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
      .then((profile) => setProfile(profile))
      .catch((err) => {
        console.error(err);
      });
  }, [fetchProfile]);

  return {
    isAuthenticated,
    isLoadingUser,
    isLoadingProfile,
    user,
    profile,
    adminAccess: profile?.isStaff || profile?.isManager,
    getAccessTokenSilently,
    getAccessTokenWithPopup,
    getIdTokenClaims,
  };
}
