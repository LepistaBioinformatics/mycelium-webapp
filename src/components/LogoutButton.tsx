import useProfile from "@/hooks/use-profile";

const LogoutButton = () => {
  const { logout } = useProfile();

  return (
    <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
      Log Out
    </button>
  );
};

export default LogoutButton;
