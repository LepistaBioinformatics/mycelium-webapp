import { components } from "@/services/openapi/mycelium-schema";
import useSWR from "swr";
import { buildPath } from "@/services/openapi/mycelium-api";
import React from "react";
import useProfile from "@/hooks/use-profile";

type Tenant = components["schemas"]["Tenant"];

export type TenantStatus = "deleted" | "unknown" | { active: Tenant };

export interface TenantResolverChildProps {
  tenantStatus?: TenantStatus;
  isLoading?: boolean;
  error?: Error;
}

interface Props {
  tenantId: string;
  children:
  | React.ReactElement<TenantResolverChildProps>
  | React.ReactElement<TenantResolverChildProps>[];
}

export default function TenantResolver({ tenantId, children }: Props) {
  const { getAccessTokenSilently } = useProfile();

  const { data: tenantStatus, isLoading, error } = useSWR<TenantStatus>(
    buildPath(
      "/adm/rs/beginners/tenants/{tenant_id}",
      { path: { tenant_id: tenantId } }
    ),
    async (url: string) => {
      const token = await getAccessTokenSilently();
      return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then(async (res) => {
          if (res.status === 204) {
            return "deleted";
          }

          if (res.status === 200) {
            return { active: await res.json() };
          }

          return "unknown";
        });
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      refreshInterval: 1000 * 60 * 5, // 5 minutes
    }
  );

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { tenantStatus, isLoading, error });
        }

        return child;
      })}
    </>
  );
}
