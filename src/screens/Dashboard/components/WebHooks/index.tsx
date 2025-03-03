import PageBody from "@/components/ui/PageBody";
import { VscGistSecret } from "react-icons/vsc";
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
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import ListItem from "@/components/ui/ListItem";

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
      isLoading={isLoadingUser}
      authorized={(profile?.isStaff || profile?.isManager)}
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
            <ListItem key={webhook?.id}>
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
              <Typography as="span" decoration="smooth">
                Trigger: <span className="font-bold">{webhook?.trigger}</span>
              </Typography>
              <Typography as="small" decoration="smooth">
                Created: <span className="font-bold">{formatDDMMYY(new Date(webhook?.created), true)}</span>
              </Typography>
              {webhook?.updated && (
                <Typography as="small" decoration="smooth">
                  Updated: <span className="font-bold">{formatDDMMYY(new Date(webhook?.updated || ""), true)}</span>
                </Typography>
              )}
              <Typography as="small" decoration="smooth">
                Active: <span className="font-bold">{webhook?.isActive ? "Yes" : "No"}</span>
              </Typography>

              {webhook?.secret && (
                <details className="flex flex-col justify-center gap-4 w-full xl:max-w-4xl mx-auto">
                  <summary className="flex gap-2 items-center cursor-pointer text-left border-2 border-transparent border-dashed hover:border-slate-500 px-2 -mx-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <VscGistSecret className="w-4 h-4 inline-block text-green-500" />
                    <Typography as="span" decoration="smooth">Secure</Typography>
                  </summary>

                  <div className="bg-slate-200 dark:bg-slate-700 rounded-lg p-2 mt-2">
                    <Secret secret={webhook?.secret} />
                  </div>
                </details>
              )}

            </ListItem>
          ))}
        </PaginatedContent>
      </div>
    </DashBoardBody>
  );
}

const Secret = ({ secret }: { secret: components["schemas"]["HttpSecret"] }) => {
  if ("authorizationHeader" in secret) {
    const { authorizationHeader } = secret;
    const { headerName, prefix, token } = authorizationHeader;

    return (
      <div className="flex flex-col gap-2">
        <Typography as="small">
          Secret Type: <span className="font-bold">{Object.keys(secret).at(0)}</span>
        </Typography>
        <Typography as="small">
          Header Name: <span className="font-bold">{headerName || "Authorization"}</span>
        </Typography>
        <Typography as="small">
          Token Prefix: <span className="font-bold">{prefix || "Bearer (default)"}</span>
        </Typography>
        <Typography as="small">
          Token Value: <span className="font-bold">{token}</span>
        </Typography>
      </div>
    );
  }

  if ("queryParameter" in secret) {
    const { queryParameter } = secret;
    const { name, token } = queryParameter;

    return (
      <div className="flex flex-col gap-2">
        <Typography as="small">
          Secret Type: <span className="font-bold">{Object.keys(secret).at(0)}</span>
        </Typography>
        <Typography as="small">
          Query Parameter Name: <span className="font-bold">{name}</span>
        </Typography>
        <Typography as="small">
          Query Parameter Value: <span className="font-bold">{token}</span>
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Typography as="small">
        Secret Type: <span className="font-bold">{Object.keys(secret).at(0)}</span>
      </Typography>
    </div>
  );
}
