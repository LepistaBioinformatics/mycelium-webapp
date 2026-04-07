import { MYCELIUM_API_URL } from "@/services/openapi/mycelium-api";

const RPC_ENDPOINT = `${MYCELIUM_API_URL}/_adm/rpc`;

interface RpcRequest<P> {
  jsonrpc: "2.0";
  method: string;
  params: P;
  id: number;
}

interface RpcSuccess<R> {
  jsonrpc: "2.0";
  result: R;
  id: number;
}

interface RpcError {
  jsonrpc: "2.0";
  error: { code: number; message: string };
  id: number;
}

type RpcResponse<R> = RpcSuccess<R> | RpcError;

export interface BatchRequest<P = unknown> {
  method: string;
  params: P;
  id: number;
}

export type BatchResult<R = unknown> = RpcSuccess<R> | RpcError;

function isRpcError<R>(res: RpcResponse<R>): res is RpcError {
  return "error" in res;
}

export async function rpcCall<P, R>(
  method: string,
  params: P,
  getToken: () => Promise<string>
): Promise<R> {
  const token = await getToken();

  const body: RpcRequest<P> = {
    jsonrpc: "2.0",
    method,
    params,
    id: 1,
  };

  const res = await fetch(RPC_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`RPC HTTP error ${res.status}: ${method}`);
  }

  const json: RpcResponse<R> = await res.json();

  if (isRpcError(json)) {
    throw new Error(
      `RPC error (${json.error.code}) in ${method}: ${json.error.message}`
    );
  }

  return json.result;
}

export async function rpcBatch(
  requests: BatchRequest[],
  getToken: () => Promise<string>
): Promise<BatchResult[]> {
  const token = await getToken();

  const body: RpcRequest<unknown>[] = requests.map((r) => ({
    jsonrpc: "2.0",
    method: r.method,
    params: r.params,
    id: r.id,
  }));

  const res = await fetch(RPC_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`RPC batch HTTP error ${res.status}`);
  }

  return res.json();
}
