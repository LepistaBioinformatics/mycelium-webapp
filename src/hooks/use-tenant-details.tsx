import useSWR from "swr";
import useProfile from "./use-profile";
import useSuspenseError from "./use-suspense-error";
import { TenantStatus } from "@/types/TenantStatus";
import { useMemo } from "react";
import { tenantsGetPublicInfo } from "@/services/rpc/beginners";
import { components } from "@/services/openapi/mycelium-schema";

type Tenant = components["schemas"]["Tenant"];

interface Props {
  tenantId?: string | null;
  /**
   * When provided, the hook fetches using a raw URL (REST) instead of RPC.
   * Used by screens that call a non-beginners endpoint (e.g. tenant-manager).
   */
  customUrl?: string | null;
}

/**
 * This hook is used to get the public details of a tenant.
 *
 * It will return the tenant status (active, deleted, unknown) and the
 * tenant details.
 *
 * When `tenantId` is provided (and no `customUrl`), uses the JSON-RPC
 * `beginners.tenants.getPublicInfo` method.
 *
 * When `customUrl` is provided, falls back to a raw REST GET request so that
 * non-beginners endpoints (e.g. tenant-manager) continue to work.
 */
export default function useTenantDetails({ tenantId, customUrl }: Props) {
  const { getAccessTokenSilently } = useProfile();

  const { parseHttpError } = useSuspenseError();

  // RPC path: tuple key so SWR can distinguish from other callers
  const rpcKey = useMemo(() => {
    if (customUrl) return null;
    if (tenantId) return ["rpc", "beginners.tenants.getPublicInfo", tenantId];
    return null;
  }, [tenantId, customUrl]);

  const {
    data: rpcTenantStatus,
    isLoading: rpcIsLoading,
    error: rpcError,
    mutate: rpcMutate,
  } = useSWR<TenantStatus>(
    rpcKey,
    async ([, , id]: [string, string, string]) => {
      const tenant: Tenant = await tenantsGetPublicInfo(
        { tenantId: id },
        getAccessTokenSilently
      );
      return { active: tenant };
    },
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      refreshInterval: 1000 * 60 * 2, // 2 minutes
    }
  );

  // REST fallback path (used when customUrl is provided)
  const {
    data: restTenantStatus,
    isLoading: restIsLoading,
    error: restError,
    mutate: restMutate,
  } = useSWR<TenantStatus>(
    customUrl ?? null,
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
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      refreshInterval: 1000 * 60 * 2, // 2 minutes
    }
  );

  if (customUrl) {
    return {
      tenantStatus: restTenantStatus,
      isLoading: restIsLoading,
      error: restError,
      mutate: restMutate,
    };
  }

  return {
    tenantStatus: rpcTenantStatus,
    isLoading: rpcIsLoading,
    error: rpcError,
    mutate: rpcMutate,
  };
}
