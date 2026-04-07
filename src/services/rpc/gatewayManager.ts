import { components } from "@/services/openapi/mycelium-schema";
import { rpcCall } from "./client";
import PaginatedRecords from "@/types/PaginatedRecords";

type ToolOperation = components["schemas"]["ToolOperation"] & {
  score: number;
};

export interface ListOperationsParams {
  query?: string;
  method?: string;
  scoreCutoff?: number;
  pageSize?: number;
  skip?: number;
}

export function toolsList(
  params: ListOperationsParams,
  getToken: () => Promise<string>
): Promise<PaginatedRecords<ToolOperation>> {
  return rpcCall<ListOperationsParams, PaginatedRecords<ToolOperation>>(
    "gatewayManager.tools.list",
    params,
    getToken
  );
}
