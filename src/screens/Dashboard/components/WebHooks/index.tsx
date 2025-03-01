import PageBody from "@/components/ui/PageBody";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import PaginatedRecords from "@/types/PaginatedRecords";
import { useMemo } from "react";
import useSWR from "swr";
import DashBoardBody from "../DashBoardBody";
import Button from "@/components/ui/Button";
import PaginatedContent from "../PaginatedContent";
import CopyToClipboard from "@/components/ui/CopyToClipboard";

type WebHook = components["schemas"]["WebHook"];

export default function Webhooks() {
  const {
    profile,
    isLoadingUser,
    isAuthenticated,
    getAccessTokenSilently,
  } = useProfile();

  const {
    skip,
    pageSize,
    setSkip,
    setPageSize,
    searchTerm,
    setSearchTerm,
  } = useSearchBarParams({
    initialSkip: 0,
    initialPageSize: 10,
  });

  const memoizedUrl = useMemo(() => {
    if (!isAuthenticated) return null;

    let searchParams: Record<string, string> = {};

    if (skip) searchParams.skip = skip.toString();
    if (searchTerm && searchTerm !== "") searchParams.name = searchTerm;
    if (pageSize) searchParams.pageSize = pageSize.toString();

    return buildPath("/adm/rs/system-manager/webhooks", {
      query: searchParams
    });
  }, [searchTerm, skip, pageSize, isAuthenticated]);

  const {
    data: webhooks,
    isLoading: isLoadingWebhooks,
    mutate: mutateWebhooks,
  } = useSWR<PaginatedRecords<WebHook>>(
    memoizedUrl,
    async (url: string) => {
      const token = await getAccessTokenSilently();

      return await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch tenants");
          }

          return res.json();
        })
        .catch((err) => {
          console.error(err);
        });
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      refreshInterval: 1000 * 60,
    }
  );

  const onSubmit = (term?: string, _?: string) => {
    setSkip(0);

    if (term !== undefined) setSearchTerm(term);

    mutateWebhooks(webhooks, { rollbackOnError: true });
  }

  return (
    <DashBoardBody
      breadcrumb={
        <PageBody.Breadcrumb.Item>
          Webhooks
        </PageBody.Breadcrumb.Item>
      }
      onSubmit={onSubmit}
      setSkip={setSkip}
      setPageSize={setPageSize}
      authorized={!isLoadingUser && (profile?.isStaff || profile?.isManager)}
    >
      <div id="TenantsContent" className="flex flex-col justify-center gap-4 w-full mx-auto">
        <div className="flex justify-start mx-auto w-full xl:max-w-4xl">
          <Button
            onClick={() => console.log("clicked")}
            size="sm"
            rounded="full"
            intent="info"
          >
            <span className="mx-2">Create webhook</span>
          </Button>
        </div>

        <PaginatedContent
          isLoading={isLoadingWebhooks}
          records={webhooks}
          mutation={mutateWebhooks}
          skip={skip}
          setSkip={setSkip}
          pageSize={pageSize}
        >
          {webhooks?.records?.map((webhook) => (
            <div
              key={webhook?.id}
              className="flex flex-col text-left gap-2 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-md mx-auto w-full xl:max-w-4xl bg-slate-100 dark:bg-slate-800"
            >
              <div className="flex justify-between gap-3">
                <Typography as="h3">
                  <button
                    className="hover:underline text-blue-500 dark:text-lime-400"
                    onClick={() => console.log(webhook)}
                  >
                    {webhook?.name}
                  </button>
                </Typography>
                <div className="flex gap-5">
                  <CopyToClipboard text={webhook?.url} />
                </div>
              </div>
              <Typography as="span">{webhook?.description}</Typography>

              <div className="flex flex-col gap-2">
                <Typography as="small" decoration="smooth">
                  Trigger: <span className="font-bold">{webhook?.trigger}</span>
                </Typography>
                <Typography as="small" decoration="smooth">
                  Active: <span className="font-bold">{webhook?.isActive ? "Yes" : "No"}</span>
                </Typography>
              </div>
            </div>
          ))}
        </PaginatedContent>

        <pre>
          {JSON.stringify(webhooks, null, 2)}
        </pre>
      </div>
    </DashBoardBody>
  );
}
