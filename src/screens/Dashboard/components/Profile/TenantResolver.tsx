import { buildPath } from "@/services/openapi/mycelium-api";
import React, { useMemo } from "react";
import { SYSTEM_TENANT_ID } from "@/constants/zero-tenant";
import { TenantStatus } from "@/types/TenantStatus";
import useTenantDetails from "@/hooks/use-tenant-details";

export interface TenantResolverChildProps {
  tenantId: string;
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
  /**
   * This memoization prevents the SWR from being initialized if the tenantId
   * is the system tenant (a full zero tenant).
   */
  const memoizedUrl = useMemo(() => {
    if (tenantId === SYSTEM_TENANT_ID) return null;

    return buildPath("/_adm/beginners/tenants/{tenant_id}", {
      path: { tenant_id: tenantId },
    });
  }, [tenantId]);

  const { tenantStatus, isLoading, error } = useTenantDetails({
    customUrl: memoizedUrl,
  });

  if (memoizedUrl === null) {
    return children;
  }

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            tenantId,
            tenantStatus,
            isLoading,
            error,
          });
        }

        return child;
      })}
    </>
  );
}
