import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";
import useSWR from "swr";
import { buildPath } from "@/services/openapi/mycelium-api";
import { useAuth0 } from "@auth0/auth0-react";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import { useCallback } from "react";

type Tenant = components["schemas"]["Tenant"];

type TenantStatus = "deleted" | "unknown" | { active: Tenant };

export default function TenantOwnership({
  tenantId,
  since,
}: {
  tenantId: string;
  since: string;
}) {
  const { getAccessTokenSilently } = useAuth0();

  const { data, isLoading, error } = useSWR<TenantStatus>(
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

  const Since = () => (
    <Typography as="small">
      Since {formatDDMMYY(new Date(since), true)}
    </Typography>
  );

  const TenantData = useCallback(() => {
    if (isLoading || !data || error) {
      return <Since />;
    }

    if (data === "deleted" || data === "unknown") {
      return (
        <>
          <Since />
          <Typography as="small" isError>
            {data === "deleted" ? "Tenant deleted" : "Unknown tenant"}
          </Typography>
        </>);
    }

    return (
      <>
        <Typography as="h4">
          {data.active.name}
        </Typography>
        <Since />
        <Typography as="small">
          {data.active.description}
        </Typography>
      </>
    );
  }, [data]);

  return (
    <div key={tenantId}>
      <div>
        {isLoading ? "Loading..." : (
          <div className="flex flex-col gap-2 max-w-xs bg-gray-50 dark:bg-slate-900 bg-opacity-40 rounded-md p-2 border-2 border-gray-200 dark:border-gray-700">
            <TenantData />

            {error && (
              <Typography as="small" isError>
                {error.message}
              </Typography>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
