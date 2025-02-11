// HomePage
//
// Here the user should be prompted to login. The login page should use the
// Auth0 login page. After login, the component should check if the user has an
// account created in backend. It should be performed using the function
// `checkEmailRegistrationStatusUrl`. If the user has an account, the user
// should be redirected to the dashboard. If the user does not have an account,
// the user should be redirected to the registration page.
//

import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router";
import LoginButton from "../components/LoginButton";
import { BeginnersProfileService, BeginnersUserService, OpenAPI } from "../services/openapi/mycelium";
import { useState } from "react";

const { checkEmailRegistrationStatusUrl } = BeginnersUserService;
const { fetchProfileUrl } = BeginnersProfileService;

const HomePage = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [profile, setProfile] = useState<any | null>(null);

  const navigate = useNavigate();

  const fetchProfile = async () => {
    const profile = await getAccessTokenSilently({ detailedResponse: true }).then((token) => {
      console.log(token);
      OpenAPI.TOKEN = token.access_token;
      return fetchProfileUrl(true);
    });
    setProfile(profile);
  }

  const checkForTheNextPage = async () => {
    if (isAuthenticated && user?.email) {
      //
      // This function performs a HEAD request to the backend to check if the
      // user has an account created. The returning headers contains information
      // about the user's status, if their account was already created or not,
      // and more.
      //
      let res = await checkEmailRegistrationStatusUrl(user?.email);
      console.log(res);

      //
      // Try to fetch profile from the backend
      //
      let profile = await fetchProfile();
      console.log(profile);

      /* if (profile) {
        navigate("/dashboard");
      } else {
        navigate("/register");
      } */
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <h1>Home Page</h1>
      <button onClick={checkForTheNextPage}>checkForTheNextPage</button>
      <LoginButton />
    </div>
  );
};

export default HomePage;
