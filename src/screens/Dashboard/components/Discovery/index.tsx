import PageBody from "@/components/ui/PageBody";
import useProfile from "@/hooks/use-profile";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import PaginatedRecords from "@/types/PaginatedRecords";
import DashBoardBody from "../DashBoardBody";
import PaginatedContent from "../PaginatedContent";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";
import { MdInput, MdOutlineOutput, MdWebhook } from "react-icons/md";
import { components } from "@/services/openapi/mycelium-schema";
import useSWR from "swr";
import { buildPath, MYCELIUM_API_URL } from "@/services/openapi/mycelium-api";
import useSuspenseError from "@/hooks/use-suspense-error";
import ListItem from "@/components/ui/ListItem";
import Typography from "@/components/ui/Typography";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import DetailsBox from "@/components/ui/DetailsBox";
import { useMemo } from "react";
import JSONPretty from "react-json-pretty";
import JSONPrettyMon from "react-json-pretty/dist/monikai";
import MarkdownViewer from "@/components/ui/MarkdownViewer";

type ToolOperation = components["schemas"]["ToolOperation"] & { score: number };
type Parameter = components["schemas"]["Parameter"];

export default function Discovery() {
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

  const { skip, pageSize, searchTerm, setSkip, setPageSize, setSearchTerm } =
    useSearchBarParams({
      initialSkip: 0,
      initialPageSize: 20,
    });

  const memoizedUrl = useMemo(() => {
    if (!isAuthenticated) return null;
    if (!hasEnoughPermissions) return null;

    const searchParams: Record<string, string> = {};

    if (skip) searchParams.skip = skip.toString();
    if (searchTerm && searchTerm !== "") searchParams.name = searchTerm;
    if (pageSize) searchParams.pageSize = pageSize.toString();

    return buildPath("/_adm/gateway-manager/tools", {
      query: {
        skip: skip.toString() ?? "0",
        pageSize: pageSize.toString() ?? "20",
        query: searchTerm ?? "",
      },
    });
  }, [searchTerm, skip, pageSize, isAuthenticated, hasEnoughPermissions]);

  const {
    data: operations,
    isLoading: isLoadingOperations,
    mutate: mutateOperations,
  } = useSWR<PaginatedRecords<ToolOperation>>(
    memoizedUrl,
    async (url: string) => {
      const token = await getAccessTokenSilently();

      return await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then(parseHttpError)
        .catch((err) => {
          console.error(err);
        });
    },
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      //refreshInterval: 1000 * 60,
    }
  );

  const onSubmit = (term?: string) => {
    console.log(term);
    setSkip(0);

    if (term !== undefined) setSearchTerm(term);

    mutateOperations(operations, { rollbackOnError: true });
  };

  return (
    <DashBoardBody
      breadcrumb={
        <PageBody.Breadcrumb.Item icon={MdWebhook}>
          Operations
        </PageBody.Breadcrumb.Item>
      }
      onSubmit={onSubmit}
      setSkip={setSkip}
      setPageSize={setPageSize}
      isLoading={isLoadingUser}
      authorized={hasEnoughPermissions}
    >
      <div
        id="DiscoveryContent"
        className="flex flex-col justify-center gap-4 w-full mx-auto"
      >
        <PaginatedContent
          isLoading={isLoadingOperations}
          records={operations}
          mutation={mutateOperations}
          skip={skip}
          setSkip={setSkip}
          pageSize={pageSize}
        >
          {operations?.records
            ?.sort((a, b) => (b.score || 0) - (a.score || 0))
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
                    <span className="text-sm rounded-r-full border border-dashed border-indigo-700 dark:border-indigo-600 bg-indigo-300 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 mt-2 flex flex-col gap-2">
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
                      <div className="bg-zinc-200 dark:bg-zinc-700 rounded-lg p-2 mt-2 flex flex-col gap-2">
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
                      <div className="bg-zinc-200 dark:bg-zinc-700 rounded-lg p-2 mt-2 flex flex-col gap-2">
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
                      <div className="bg-zinc-200 dark:bg-zinc-700 rounded-lg p-2 mt-2 flex flex-col gap-2">
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
    `${className} text-sm text-center font-bold rounded-md px-2 mt-2 sm:mt-0 text-white border bg-opacity-50 h-fit min-w-[5rem]`;

  switch (method) {
    case "GET":
      return (
        <span className={style("bg-indigo-500 border-indigo-500")}>
          {method}
        </span>
      );
    case "POST":
      return (
        <span className={style("bg-green-500 border-green-500")}>{method}</span>
      );
    case "PUT":
      return (
        <span className={style("bg-yellow-500 border-yellow-500")}>
          {method}
        </span>
      );
    case "PATCH":
      return (
        <span className={style("bg-purple-500 border-purple-500")}>
          {method}
        </span>
      );
    case "DELETE":
      return (
        <span className={style("bg-red-500 border-red-500")}>{method}</span>
      );
    default:
      return (
        <span className={style("bg-gray-500 border-gray-500")}>{method}</span>
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
  const url = useMemo(() => `${MYCELIUM_API_URL}${path}`, [path]);

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

  if (highlight) className += " text-indigo-500 dark:text-lime-400 cursor-help";
  if (isService) className += " dark:text-yellow-500";

  return (
    <span className={className} title={title}>
      {part}
    </span>
  );
};
