import PageBody from "@/components/ui/PageBody";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import PaginatedRecords from "@/types/PaginatedRecords";
import DashBoardBody from "../DashBoardBody";
import PaginatedContent from "../PaginatedContent";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";
import { MdWebhook } from "react-icons/md";
import { useQuery } from "@apollo/client";
import { GET_SCHEMA, SEARCH_OPERATION } from "@/services/graphql/queries";
import {
  Parameter,
  ScoredOperation,
  SearchOperationsResponse,
} from "@/types/SearchOperations";
import { useMemo } from "react";
import ListItem from "@/components/ui/ListItem";
import { components } from "@/services/openapi/mycelium-schema";
import DetailsBox from "@/components/ui/DetailsBox";
import { GetSchema } from "@/types/GetSchema";
import CopyToClipboard from "@/components/ui/CopyToClipboard";

type SecurityGroup = components["schemas"]["SecurityGroup"];

export default function Discovery() {
  const { isLoadingUser, hasEnoughPermissions } = useProfile({
    roles: [MycRole.SystemManager],
    permissions: [MycPermission.Read, MycPermission.Write],
  });

  const { skip, pageSize, setSkip, setPageSize, searchTerm, setSearchTerm } =
    useSearchBarParams({
      initialSkip: 0,
      initialPageSize: 20,
    });

  const { loading: isLoadingOperations, data: operations } = useQuery<{
    searchOperation: SearchOperationsResponse;
  }>(SEARCH_OPERATION, {
    variables: { query: searchTerm || "list", pageSize, skip },
  });

  const paginatedOperations: PaginatedRecords<ScoredOperation> = useMemo(() => {
    return {
      count: operations?.searchOperation.total || 0,
      size: operations?.searchOperation.pageSize || 0,
      skip: operations?.searchOperation.skip || 0,
      records:
        operations?.searchOperation.operations.map((operation) => ({
          operation: {
            ...operation.operation,
            securityGroup: JSON.parse(
              operation.operation.securityGroup
            ) as SecurityGroup,
          },
          score: operation.score,
        })) || [],
    } as PaginatedRecords<ScoredOperation>;
  }, [operations]);

  const onSubmit = (term?: string, _?: string) => {
    setSkip(0);

    if (term !== undefined) setSearchTerm(term);
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
          records={paginatedOperations}
          mutation={() => {}}
          skip={skip}
          setSkip={setSkip}
          pageSize={pageSize}
        >
          {paginatedOperations?.records?.map((_operation) => {
            const { operation, score } = _operation;

            return (
              <ListItem key={operation.operationId}>
                <div className="flex justify-between gap-0">
                  <Typography as="div">
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-3 items-center">
                        <OperationMethod method={operation.method} />
                        <FormattedPath
                          path={operation.path}
                          parameters={operation.operation?.parameters}
                        />
                      </div>

                      <div className="flex gap-1 group/clip">
                        <Typography decoration="smooth" title="Operation ID">
                          {operation.operationId}
                        </Typography>
                        <CopyToClipboard
                          text={operation.operationId}
                          groupHidden
                          inline
                        />
                      </div>

                      <div className="flex flex-col">
                        <Typography as="span">{operation.summary}</Typography>
                        <Typography as="span" decoration="smooth">
                          {operation.description}
                        </Typography>
                      </div>
                    </div>
                  </Typography>

                  <div className="flex gap-2 align-bottom items-center h-fit">
                    <Typography as="small" decoration="smooth">
                      Score
                    </Typography>
                    <Typography decoration="bold">{score}</Typography>
                  </div>
                </div>

                <div className="flex gap-2">
                  {operation.operation.tags.map((tag) => (
                    <span className="text-sm rounded-r-full border border-dashed border-indigo-700 dark:border-indigo-600 bg-indigo-300 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 mt-2 flex flex-col gap-2">
                      {tag}
                    </span>
                  ))}
                </div>

                {operation?.operation?.requestBody && (
                  <DetailsBox>
                    <DetailsBox.Summary>
                      <Typography as="span" decoration="smooth">
                        {
                          Object.keys(
                            operation?.operation?.requestBody?.schema?.content
                          )?.length
                        }
                        x &nbsp; Request body
                      </Typography>
                    </DetailsBox.Summary>

                    <DetailsBox.Content>
                      <div className="bg-zinc-200 dark:bg-zinc-700 rounded-lg p-2 mt-2 flex flex-col gap-2">
                        {Object.keys(
                          operation?.operation?.requestBody?.schema?.content
                        )?.map((key) => (
                          <div
                            key={key}
                            className="flex flex-col gap-3 border border-zinc-300 dark:border-zinc-600 p-2 rounded-lg bg-white dark:bg-zinc-800"
                          >
                            <div className="flex flex-col">
                              <Typography as="span" decoration="smooth">
                                Type
                              </Typography>
                              <Typography as="span" decoration="semibold">
                                {key}
                              </Typography>
                            </div>

                            <div className="flex flex-col">
                              <Typography as="span" decoration="smooth">
                                Schema
                              </Typography>
                              <Typography as="div">
                                <ResolveReference
                                  schema={
                                    operation?.operation?.requestBody?.schema
                                      ?.content[key]?.schema
                                  }
                                />
                              </Typography>
                            </div>
                          </div>
                        ))}
                      </div>
                    </DetailsBox.Content>
                  </DetailsBox>
                )}
              </ListItem>
            );
          })}
        </PaginatedContent>
      </div>
    </DashBoardBody>
  );
}

/**
 * This component resolves a reference to a schema.
 *
 * @description It will recursively resolve the reference until it is a primitive type.
 * @param schema - The schema to resolve.
 * @returns The resolved schema.
 */
const ResolveReference = ({
  schema,
}: {
  schema?: { reference: string | undefined };
}) => {
  if (!schema || !schema?.reference) {
    return <pre>{JSON.stringify(schema, null, 2)}</pre>;
  }

  const referenceParts = schema?.reference?.split("/");

  if (!referenceParts) return schema?.reference;

  const firstPart = referenceParts?.at(-1);

  if (!firstPart) return schema?.reference;

  const { data: resolvedSchema } = useQuery<{
    getSchema: GetSchema;
  }>(GET_SCHEMA, { variables: { name: firstPart } });

  if (resolvedSchema) {
    return (
      <pre>
        {JSON.stringify(resolvedSchema.getSchema.schema.properties, null, 2)}
      </pre>
    );
  }

  return schema?.reference;
};

/**
 * This component displays the method of an operation.
 *
 * @param method - The method of the operation.
 * @returns The method of the operation.
 */
const OperationMethod = ({ method }: { method: string }) => {
  const style = (className: string) =>
    `${className} text-sm text-center font-bold rounded-md px-2 py-0 text-white border bg-opacity-50 h-fit min-w-[5rem]`;

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
  parameters?: Parameter[];
}) => {
  const formattedPath = useMemo(() => {
    let composedPathParts: {
      part: string;
      param?: Parameter;
      isService?: boolean;
    }[] = [];

    path.split("/").forEach((part, index) => {
      const isService = index === 0;

      if (part.startsWith("{") && part.endsWith("}")) {
        const paramName = part.slice(1, -1);
        const param = parameters?.find((param) => param.name === paramName);

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

        <CopyToClipboard text={path} groupHidden />
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
