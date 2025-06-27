import useSWR from "swr";
import useProfile from "./use-profile";
import useSuspenseError from "./use-suspense-error";
import { TenantStatus } from "@/types/TenantStatus";
import { buildPath } from "@/services/openapi/mycelium-api";
import { useMemo } from "react";

interface Props {
  tenantId?: string | null;
  customUrl?: string | null;
}

/**
 * This hook is used to get the public details of a tenant.
 *
 * It will return the tenant status (active, deleted, unknown) and the
 * tenant details.
 */
export default function useTenantDetails({ tenantId, customUrl }: Props) {
  const { getAccessTokenSilently } = useProfile();

  const { parseHttpError } = useSuspenseError();

  /**
   * 1. If customUrl is provided, it will be used instead of the default URL.
   *
   * 2. If tenantId is provided, it will be used to build the default URL.
   *
   * 3. If neither is provided, the hook will return null and the SWR will not
   *    be initialized.
   */
  const memoizedUrl = useMemo(() => {
    if (customUrl) return customUrl;

    if (tenantId) {
      return buildPath("/adm/rs/beginners/tenants/{tenant_id}", {
        path: { tenant_id: tenantId },
      });
    }

    return null;
  }, [tenantId, customUrl]);

  const {
    data: tenantStatus,
    isLoading,
    error,
    mutate,
  } = useSWR<TenantStatus>(
    memoizedUrl,
    async (url: string) => {
      const token = await getAccessTokenSilently();

      return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => parseHttpError(res, { rawResponse: true }))
        .then(async (res) => {
          if (res.status === 204) return "unknown";
          if (res.status === 200) return { active: await res.json() };
          if (res.status === 403) return "unauthorized";
          return "unknown";
        });
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      revalidateIfStale: true,
    }
  );

  return {
    tenantStatus,
    isLoading,
    error,
    mutate,
  };
}
