import { useCallback } from "react";
import { To, useLocation } from "react-router";

/**
 * Links that open an account's details side curtain on top of the current
 * page (it is mounted once by the dashboard layout), keeping the page's own
 * query params (e.g. `?tab=`). `tenantId` is for an account of a namespace
 * other than the selected one.
 */
export default function useAccountDetailsLink() {
  const location = useLocation();

  return useCallback(
    (accountId: string, tenantId?: string | null): To => {
      const params = new URLSearchParams(location.search);
      params.set("accountId", accountId);
      if (tenantId) params.set("tenantId", tenantId);
      if (!tenantId) params.delete("tenantId");

      return { pathname: location.pathname, search: `?${params.toString()}` };
    },
    [location.pathname, location.search]
  );
}
