import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useNativeAuthContext } from "@/contexts/NativeAuthContext";

export default function useNativeAuth() {
  const { user, isAuthenticated, isLoading, clearAuth, getToken } =
    useNativeAuthContext();
  const navigate = useNavigate();

  const getAccessTokenSilently = useCallback(
    () => getToken(),
    [getToken]
  );

  const loginWithRedirect = useCallback(
    () => navigate("/"),
    [navigate]
  );

  const logout = useCallback(() => {
    clearAuth();
    navigate("/");
  }, [clearAuth, navigate]);

  return {
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    loginWithRedirect,
    logout,
    error: null,
  };
}
