import { MYCELIUM_API_URL } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import PaginatedRecords from "@/types/PaginatedRecords";

type ErrorCode = components["schemas"]["ErrorCode"];

export interface PublicErrorCodesParams {
  prefix?: string;
  code?: number;
  pageSize?: number;
  skip?: number;
}

/**
 * List the gateway's public (non-internal) error codes. No sign-in needed:
 * `GET /error-codes` only ever answers codes with `isInternal = false`.
 */
export async function listPublicErrorCodes(
  params: PublicErrorCodesParams
): Promise<PaginatedRecords<ErrorCode>> {
  const query = new URLSearchParams();
  if (params.prefix) query.set("prefix", params.prefix);
  if (params.code !== undefined) query.set("code", String(params.code));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.skip) query.set("skip", String(params.skip));

  const res = await fetch(`${MYCELIUM_API_URL}/error-codes?${query}`);

  if (res.status === 204) return { records: [], count: 0 };
  if (!res.ok) throw new Error(`Failed to list error codes: ${res.status}`);

  return res.json();
}
