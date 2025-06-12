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
import { Tooltip } from "flowbite-react";
import DetailsBox from "@/components/ui/DetailsBox";
import { GetSchema } from "@/types/GetSchema";

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
        id="TenantsContent"
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
                <div className="flex justify-between gap-3">
                  <Typography as="div">
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-5">
                        <OperationMethod method={operation.method} />
                        <FormattedPath
                          path={operation.path}
                          parameters={operation.operation?.parameters}
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
                      <div className="bg-slate-200 dark:bg-slate-700 rounded-lg p-2 mt-2 flex flex-col gap-2">
                        {Object.keys(
                          operation?.operation?.requestBody?.schema?.content
                        )?.map((key) => (
                          <div
                            key={key}
                            className="flex flex-col gap-3 border border-slate-300 dark:border-slate-600 p-2 rounded-lg bg-white dark:bg-slate-800"
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
    `${className} text-sm text-center font-bold rounded-md px-2 py-1 text-white border bg-opacity-50 min-w-[5rem]`;

  switch (method) {
    case "GET":
      return (
        <span className={style("bg-blue-500 border-blue-500")}>{method}</span>
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
  const Part = ({ part, highlight }: { part: string; highlight: boolean }) => (
    <span className={highlight ? "font-bold text-lime-500" : ""}>{part}</span>
  );

  const formattedPath = useMemo(() => {
    let composedPathParts = [];

    for (const part of path.split("/")) {
      if (part.startsWith("{") && part.endsWith("}")) {
        const paramName = part.slice(1, -1);
        const param = parameters?.find((param) => param.name === paramName);

        composedPathParts.push({
          param,
          part,
        });

        continue;
      }

      composedPathParts.push({ part, param: undefined });
    }

    return composedPathParts;
  }, [path, parameters]);

  return (
    <Typography as="div" decoration="semibold" nowrap>
      <div className="flex flex-row gap-0">
        {formattedPath.map((child, index) => {
          const { part, param } = child;

          return (
            <span key={index} className="flex gap-0">
              {index > 0 && <span className="text-slate-500">/</span>}

              {param ? (
                <Tooltip
                  content={
                    <Typography as="div" flex gap={2}>
                      <Typography as="span" decoration="semibold">
                        {param?.name}
                      </Typography>
                      <Typography as="span" decoration="smooth">
                        {param?.description}
                      </Typography>
                    </Typography>
                  }
                >
                  <Part part={param?.name || ""} highlight={true} />
                </Tooltip>
              ) : (
                <Part part={part} highlight={false} />
              )}
            </span>
          );
        })}
      </div>
    </Typography>
  );
};
