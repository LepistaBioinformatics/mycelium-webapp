import { RpcCallError } from "@/services/rpc/client";

/** The message to show people for a failed call, without RPC plumbing */
export function describeError(err: unknown): string {
  if (err instanceof RpcCallError) return err.detail;
  if (err instanceof Error) return err.message;
  return String(err);
}
