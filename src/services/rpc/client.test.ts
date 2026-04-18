import { describe, it, expect, vi, beforeEach } from "vitest";
import { rpcCall, rpcBatch } from "./client";

const getToken = vi.fn().mockResolvedValue("test-token");

function makeSuccessResponse<R>(result: R, id = 1): Response {
  return new Response(
    JSON.stringify({ jsonrpc: "2.0", result, id }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

function makeRpcErrorResponse(code: number, message: string, id = 1): Response {
  return new Response(
    JSON.stringify({ jsonrpc: "2.0", error: { code, message }, id }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

function makeHttpErrorResponse(status: number): Response {
  return new Response(null, { status });
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  getToken.mockClear();
});

describe("rpcCall", () => {
  it("sends a well-formed JSON-RPC 2.0 envelope", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      makeSuccessResponse({ name: "tenant-1" })
    );

    await rpcCall("beginners.tenants.getPublicInfo", { tenantId: "abc" }, getToken);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://test-api/_adm/rpc");
    expect(init.method).toBe("POST");

    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({
      jsonrpc: "2.0",
      method: "beginners.tenants.getPublicInfo",
      params: { tenantId: "abc" },
      id: 1,
    });
  });

  it("injects Bearer token in Authorization header", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeSuccessResponse({}));

    await rpcCall("beginners.profile.get", { withUrl: false }, getToken);

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer test-token");
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("returns the result field on success", async () => {
    const payload = { id: "tenant-xyz", name: "My Tenant" };
    vi.mocked(fetch).mockResolvedValueOnce(makeSuccessResponse(payload));

    const result = await rpcCall<{ tenantId: string }, typeof payload>(
      "beginners.tenants.getPublicInfo",
      { tenantId: "xyz" },
      getToken
    );

    expect(result).toEqual(payload);
  });

  it("throws on RPC-level error (HTTP 200 but error field present)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeRpcErrorResponse(-32601, "Method not found")
    );

    await expect(
      rpcCall("unknown.method", {}, getToken)
    ).rejects.toThrow("RPC error (-32601) in unknown.method: Method not found");
  });

  it("throws on HTTP-level error (non-2xx response)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeHttpErrorResponse(401));

    await expect(
      rpcCall("beginners.profile.get", {}, getToken)
    ).rejects.toThrow("RPC HTTP error 401: beginners.profile.get");
  });

  it("calls getToken exactly once per rpcCall invocation", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeSuccessResponse(null));

    await rpcCall("beginners.accounts.get", {}, getToken);

    expect(getToken).toHaveBeenCalledOnce();
  });
});

describe("rpcBatch", () => {
  it("sends an array of JSON-RPC 2.0 envelopes", async () => {
    const batchResponse = [
      { jsonrpc: "2.0", result: { name: "t1" }, id: 1 },
      { jsonrpc: "2.0", result: { name: "t2" }, id: 2 },
    ];
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(batchResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const requests = [
      { method: "beginners.tenants.getPublicInfo", params: { tenantId: "1" }, id: 1 },
      { method: "beginners.tenants.getPublicInfo", params: { tenantId: "2" }, id: 2 },
    ];

    const results = await rpcBatch(requests, getToken);

    expect(results).toHaveLength(2);
    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(Array.isArray(body)).toBe(true);
    expect(body[0]).toMatchObject({ jsonrpc: "2.0", method: "beginners.tenants.getPublicInfo", id: 1 });
    expect(body[1]).toMatchObject({ jsonrpc: "2.0", method: "beginners.tenants.getPublicInfo", id: 2 });
  });

  it("throws on HTTP-level batch error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeHttpErrorResponse(500));

    await expect(
      rpcBatch([{ method: "any", params: {}, id: 1 }], getToken)
    ).rejects.toThrow("RPC batch HTTP error 500");
  });

  it("injects Bearer token for batch requests", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify([{ jsonrpc: "2.0", result: {}, id: 1 }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await rpcBatch([{ method: "any", params: {}, id: 1 }], getToken);

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer test-token");
  });
});
