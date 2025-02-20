import { useAuth0 } from "@auth0/auth0-react";
import type { paths, operations } from "../services/openapi/mycelium-schema";
import { useEffect, useMemo } from "react";

export async function useQuery(
  path: keyof paths,
  params?: {
    method?: "get" | "post" | "put" | "delete" | "patch" | "options" | "head" | "trace",
    auth?: boolean,
    body?: any,
  }
) {
  const { method = "get", auth = false, body } = params || {};

  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const token = useMemo(() => {
    const getToken = async () => {
      if (!isAuthenticated) return null;

      return await getAccessTokenSilently();
    }

    if (!isAuthenticated) return null;

    return getToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  //
  // Build fetcher
  //
  const fetcher = async (url: string, options: RequestInit) => {
    const response = await fetch(
      url,
      {
        method,
        headers: {
          Authorization: `Bearer ${await token}`
        },
        ...options
      }
    );

    return response.json();
  };

  return { fetcher };
}
