import useProfile from "@/hooks/use-profile";
import { tenantsGetPublicInfo } from "@/services/rpc/beginners";
import useSWR from "swr";

/**
 * A tenant's name by id. Shares the cache key of `useTenantDetails`, so a
 * tenant already loaded elsewhere is not fetched again.
 */
export default function useTenantName(
  tenantId?: string | null
): string | undefined {
  const { getAccessTokenSilently } = useProfile();

  const { data } = useSWR(
    tenantId ? ["rpc", "beginners.tenants.getPublicInfo", tenantId] : null,
    ([, , id]: [string, string, string]) =>
      tenantsGetPublicInfo({ tenantId: id }, getAccessTokenSilently).then(
        (tenant) => ({ active: tenant })
      ),
    { revalidateOnFocus: false, revalidateIfStale: false }
  );

  return data?.active?.name;
}
