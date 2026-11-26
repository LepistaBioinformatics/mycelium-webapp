import PageBody from "@/components/ui/PageBody";
import useProfile from "@/hooks/use-profile";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import DashBoardBody from "../DashBoardBody";
import PaginatedContent from "../PaginatedContent";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";
import { MdInput, MdOutlineOutput, MdWebhook } from "react-icons/md";
import { components } from "@/services/openapi/mycelium-schema";
import useLoadMore from "@/hooks/use-load-more";
import { MYCELIUM_API_URL } from "@/services/openapi/mycelium-api";
import useSuspenseError from "@/hooks/use-suspense-error";
import { toolsList } from "@/services/rpc/gatewayManager";
import ListItem from "@/components/ui/ListItem";
import Typography from "@/components/ui/Typography";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import DetailsBox from "@/components/ui/DetailsBox";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import SearchBar from "@/components/ui/SearchBar";
import {
  parseSearchTerm,
  replaceSearchFilter,
} from "@/functions/search-term-filters";
import JSONPretty from "react-json-pretty";
import JSONPrettyMon from "react-json-pretty/dist/monikai";
import MarkdownViewer from "@/components/ui/MarkdownViewer";

type ToolOperation = components["schemas"]["ToolOperation"] & { score: number };
type Parameter = components["schemas"]["Parameter"];

const PREFIX = "screens.Dashboard.Discovery";
const PAGE_SIZE = 20;
const HIDE_GATEWAY = "/hideGateway";
const HTTP_METHODS = ["get", "post", "put", "patch", "delete"];
const METHOD_FILTERS = HTTP_METHODS.map((method) => `method:${method}`);

/** Turn the search term into `gatewayManager.tools.list` filters */
function toOperationFilters(term: string | null) {
  const { filters, text } = parseSearchTerm(term);
  const method = filters
    .find((filter) => METHOD_FILTERS.includes(filter.toLowerCase()))
    ?.slice("method:".length);

  return {
    query: text || undefined,
    method,
    excludeGateway: filters.includes(HIDE_GATEWAY) || undefined,
  };
}

export default function Discovery() {
  const { t } = useTranslation();

  const {
    isLoadingUser,
    isAuthenticated,
    getAccessTokenSilently,
    hasEnoughPermissions,
  } = useProfile({
    roles: [MycRole.TenantManager, MycRole.SubscriptionsManager],
    permissions: [MycPermission.Read],
    restrictSystemAccount: true,
  });

  const { parseHttpError } = useSuspenseError();

  const { searchTerm, setSearchTerm } = useSearchBarParams({
    initialSkip: 0,
    initialPageSize: PAGE_SIZE,
  });

  const filters = useMemo(() => toOperationFilters(searchTerm), [searchTerm]);

  const operations = useLoadMore<ToolOperation>({
    baseKey:
      isAuthenticated && hasEnoughPermissions
        ? [
            "rpc",
            "gatewayManager.tools.list",
            filters.query,
            filters.method,
            filters.excludeGateway,
          ]
        : null,
    pageSize: PAGE_SIZE,
    fetchPage: (skip, pageSize) =>
      toolsList(
        { skip, pageSize, ...filters },
        getAccessTokenSilently
      ).catch(parseHttpError),
    // The list had no background refresh before the migration
    refreshInterval: 0,
  });

  const onSubmit = (term?: string) => {
    if (term !== undefined) setSearchTerm(term);

    operations.mutate();
  };

  return (
    <DashBoardBody
      breadcrumb={
        <PageBody.Breadcrumb.Item icon={MdWebhook}>
          {t("Menu.operations")}
        </PageBody.Breadcrumb.Item>
      }
      term={searchTerm ?? undefined}
      onSubmit={onSubmit}
      commandPalette={
        <SearchBar.Content>
          <div className="flex flex-col gap-1">
            <Typography as="h4" decoration="smooth">
              {t(`${PREFIX}.filters.origin`)}
            </Typography>
            <SearchBar.Item
              brief={t(`${PREFIX}.filters.hideGateway`)}
              description={t(`${PREFIX}.filters.hideGatewayDescription`)}
              command={HIDE_GATEWAY}
              onClick={() =>
                onSubmit(
                  replaceSearchFilter(searchTerm, HIDE_GATEWAY, [HIDE_GATEWAY])
                )
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <Typography as="h4" decoration="smooth">
              {t(`${PREFIX}.filters.method`)}
            </Typography>
            {METHOD_FILTERS.map((filter) => (
              <SearchBar.Item
                key={filter}
                brief={filter.slice("method:".length).toUpperCase()}
                command={filter}
                onClick={() =>
                  onSubmit(replaceSearchFilter(searchTerm, filter, METHOD_FILTERS))
                }
              />
            ))}
          </div>
        </SearchBar.Content>
      }
      isLoading={isLoadingUser}
      authorized={hasEnoughPermissions}
    >
      <div
        id="DiscoveryContent"
        className="flex flex-col justify-center gap-4 w-full mx-auto"
      >
        <PaginatedContent
          isLoading={operations.isLoading}
          loaded={operations.records.length}
          total={operations.count}
          hasMore={operations.hasMore}
          isLoadingMore={operations.isLoadingMore}
          onLoadMore={operations.loadMore}
        >
          {operations.records
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            ?.map((record) => (
              <ListItem key={record.operationId}>
                <div className="flex justify-between gap-0">
                  <Typography as="div">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <OperationMethod method={record.method} />
                        <FormattedPath
                          path={record.path}
                          parameters={record?.parameters}
                        />
                      </div>

                      <div className="flex gap-1 group/clip">
                        <Typography decoration="smooth" title="Operation ID">
                          {record.operationId}
                        </Typography>
                        <CopyToClipboard
                          text={record.operationId || ""}
                          groupHidden
                          inline
                        />
                      </div>

                      <div className="flex flex-col">
                        <Typography as="span">{record.summary}</Typography>
                        <Typography as="span" decoration="smooth">
                          {record.description && (
                            <MarkdownViewer markdown={record.description} />
                          )}
                        </Typography>
                      </div>
                    </div>
                  </Typography>

                  {record.score > 0 && (
                    <div className="flex gap-2 align-bottom items-center mt-2 sm:mt-0 h-fit">
                      <Typography as="small" decoration="smooth">
                        Score
                      </Typography>
                      <Typography decoration="bold">{record.score}</Typography>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {record?.tags?.map((tag) => (
                    <span className="text-sm rounded-lg border border-dashed border-brand-violet-700 dark:border-brand-violet-600 bg-brand-violet-300 dark:bg-brand-violet-900 text-brand-violet-700 dark:text-brand-violet-300 px-2 mt-2 flex flex-col gap-2">
                      {tag}
                    </span>
                  ))}
                </div>

                {record?.parameters && (
                  <DetailsBox>
                    <DetailsBox.Summary>
                      <div className="flex items-center gap-3">
                        <MdInput className="text-blue-500 inline" />
                        <Typography as="span">Parameters</Typography>
                      </div>
                    </DetailsBox.Summary>

                    <DetailsBox.Content>
                      <div className="bg-zinc-200 dark:bg-zinc-700 p-2 mt-2 flex flex-col gap-2">
                        <JSONPretty
                          data={JSON.stringify(record?.parameters, null, 2)}
                          theme={JSONPrettyMon}
                        />
                      </div>
                    </DetailsBox.Content>
                  </DetailsBox>
                )}

                {record?.requestBody && (
                  <DetailsBox>
                    <DetailsBox.Summary>
                      <div className="flex items-center gap-3">
                        <MdInput className="text-green-500 inline" />
                        <Typography as="span">Request Body</Typography>
                      </div>
                    </DetailsBox.Summary>

                    <DetailsBox.Content>
                      <div className="bg-zinc-200 dark:bg-zinc-700 p-2 mt-2 flex flex-col gap-2">
                        <JSONPretty
                          data={JSON.stringify(record?.requestBody, null, 2)}
                          theme={JSONPrettyMon}
                        />
                      </div>
                    </DetailsBox.Content>
                  </DetailsBox>
                )}

                {record?.responses && (
                  <DetailsBox>
                    <DetailsBox.Summary>
                      <div className="flex items-center gap-3">
                        <MdOutlineOutput className="text-yellow-500 inline" />
                        <Typography as="span">Response</Typography>
                      </div>
                    </DetailsBox.Summary>

                    <DetailsBox.Content>
                      <div className="bg-zinc-200 dark:bg-zinc-700 p-2 mt-2 flex flex-col gap-2">
                        <JSONPretty
                          data={JSON.stringify(record?.responses, null, 2)}
                          theme={JSONPrettyMon}
                        />
                      </div>
                    </DetailsBox.Content>
                  </DetailsBox>
                )}
              </ListItem>
            ))}
        </PaginatedContent>
      </div>
    </DashBoardBody>
  );
}

/**
 * This component displays the method of an operation.
 *
 * @param method - The method of the operation.
 * @returns The method of the operation.
 */
const OperationMethod = ({ method }: { method: string }) => {
  const style = (className: string) =>
    `${className} text-sm text-center font-bold-md px-2 mt-2 sm:mt-0 text-white border rounded-lg h-fit min-w-[5rem]`;

  switch (method) {
    case "GET":
      return (
        <span className={style("bg-brand-violet-500/50 border-brand-violet-500")}>
          {method}
        </span>
      );
    case "POST":
      return (
        <span className={style("bg-green-500/50 border-green-500")}>{method}</span>
      );
    case "PUT":
      return (
        <span className={style("bg-yellow-500/50 border-yellow-500")}>
          {method}
        </span>
      );
    case "PATCH":
      return (
        <span className={style("bg-purple-500/50 border-purple-500")}>
          {method}
        </span>
      );
    case "DELETE":
      return (
        <span className={style("bg-red-500/50 border-red-500")}>{method}</span>
      );
    default:
      return (
        <span className={style("bg-zinc-500/50 border-zinc-500")}>{method}</span>
      );
  }
};

/**
 * This component displays the path of an operation.
 *
 * @param path - The path of the operation.
 * @param parameters - The parameters of the operation.
 * @returns The path of the operation.
 */
const FormattedPath = ({
  path,
  parameters,
}: {
  path: string;
  parameters?: Parameter[] | null;
}) => {
  const url = useMemo(
    () => `${MYCELIUM_API_URL || window.location.origin}${path}`,
    [path]
  );

  const formattedPath = useMemo(() => {
    const composedPathParts: {
      part: string;
      param?: Parameter;
      isService?: boolean;
    }[] = [];

    if (!path) return composedPathParts;

    path?.split("/").forEach((part, index) => {
      const isService = index === 0;

      if (part.startsWith("{") && part.endsWith("}")) {
        const paramName = part.slice(1, -1);
        const param = parameters?.find(
          (param) => (param?.name as string) === paramName
        );

        composedPathParts.push({
          isService,
          param,
          part,
        });
      } else {
        composedPathParts.push({ part, param: undefined, isService });
      }
    });

    return composedPathParts;
  }, [path, parameters]);

  return (
    <Typography as="div">
      <div className="flex flex-wrap gap-1 group/clip">
        {formattedPath.map((child, index) => {
          const { part, param, isService } = child;

          return (
            <span
              key={index}
              className="flex flex-nowrap gap-1 whitespace-normal"
            >
              {index > 0 && <span className="text-zinc-500">/</span>}

              {param ? (
                <Part
                  part={param?.name || ""}
                  highlight={true}
                  isService={isService}
                  title={`${param?.name} - ${param?.description}`}
                />
              ) : (
                <Part part={part} highlight={false} isService={isService} />
              )}
            </span>
          );
        })}

        <CopyToClipboard text={url} groupHidden />
      </div>
    </Typography>
  );
};

const Part = ({
  part,
  highlight,
  isService,
  title,
}: {
  part: string;
  highlight: boolean;
  isService?: boolean;
  title?: string;
}) => {
  let className = "font-bold whitespace-nowrap";

  if (highlight) className += " text-brand-violet-500 dark:text-brand-violet-400 cursor-help";
  if (isService) className += " dark:text-yellow-500";

  return (
    <span className={className} title={title}>
      {part}
    </span>
  );
};
