import useProfile from "@/hooks/use-profile";

const LoginButton = () => {
  const { loginWithRedirect } = useProfile();

  return (
    <button
      onClick={() => loginWithRedirect()}
      className="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded uppercase"
    >
      Log In
    </button>
  );
};

export default LoginButton;
