import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "./LogoutButton";
import { BeginnersProfileService, OpenAPI } from "../services/openapi/mycelium";

const { fetchProfileUrl } = BeginnersProfileService;

const Profile = () => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  const [profile, setProfile] = useState<any | null>(null);

  const fetchProfile = async () => {
    const profile = await getAccessTokenSilently({ detailedResponse: true }).then((token) => {
      console.log(token);
      OpenAPI.TOKEN = token.access_token;
      return fetchProfileUrl(true);
    });
    setProfile(profile);
  }

  useEffect(() => {
    async function setToken() {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently();
        OpenAPI.TOKEN = token;

        const profile = await fetchProfileUrl(true);
        setProfile(profile);
      }
    }

    setToken();
  }, [isAuthenticated]);

  useEffect(() => {
    console.log(profile);
  }, [profile]);

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    isAuthenticated && user
      ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="flex flex-col gap-8 items-center justify-center">
            <img src={user.picture} alt={user.name} />
            <h2>{user.name}</h2>
            <p>{user.email}</p>

            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
              onClick={fetchProfile}
            >
              Fetch Profile
            </button>

            <LogoutButton />
          </div>
        </div>
      ) : (
        <div>
          <p>Not authenticated</p>
        </div>
      )
  );
};

export default Profile;
