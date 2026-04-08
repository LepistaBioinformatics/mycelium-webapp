import useProfile from "@/hooks/use-profile";

const LogoutButton = () => {
  const { logout } = useProfile();

  return (
    <button onClick={() => logout()}>
      Log Out
    </button>
  );
};

export default LogoutButton;
