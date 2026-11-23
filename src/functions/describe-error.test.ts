import { describe, expect, it } from "vitest";
import { RpcCallError } from "@/services/rpc/client";
import { describeError } from "./describe-error";

describe("describeError", () => {
  it("shows only the gateway message of an RPC error", () => {
    const err = new RpcCallError(
      -32602,
      "tenantManager.accounts.deleteSubscriptionAccount",
      "Account not found"
    );

    expect(err.message).toBe(
      "RPC error (-32602) in tenantManager.accounts.deleteSubscriptionAccount: Account not found"
    );
    expect(describeError(err)).toBe("Account not found");
  });

  it("falls back to the error message or the value", () => {
    expect(describeError(new Error("RPC HTTP error 403: x"))).toBe(
      "RPC HTTP error 403: x"
    );
    expect(describeError("boom")).toBe("boom");
  });
});
