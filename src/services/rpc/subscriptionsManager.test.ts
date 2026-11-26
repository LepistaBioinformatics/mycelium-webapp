import { describe, it, expect, vi, beforeEach } from "vitest";
import { accountsListMerged } from "./subscriptionsManager";

const getToken = vi.fn().mockResolvedValue("test-token");

function batchReply(items: unknown[]): Response {
  return new Response(JSON.stringify(items), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

const account = (id: string, createdAt: string) => ({ id, createdAt });

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  getToken.mockClear();
});

describe("accountsListMerged", () => {
  it("skips account types that have no accounts (null result)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      batchReply([
        {
          jsonrpc: "2.0",
          id: 0,
          result: {
            count: 1,
            skip: 0,
            size: 10,
            records: [account("a-01", "2026-11-20T10:00:00Z")],
          },
        },
        { jsonrpc: "2.0", id: 1, result: null },
        {
          jsonrpc: "2.0",
          id: 2,
          error: { code: -32602, message: "actor required" },
        },
      ])
    );

    const page = await accountsListMerged(
      ["user", "manager", "actorAssociated"],
      { pageSize: 10 },
      getToken
    );

    expect(page.count).toBe(1);
    expect(page.records.map((record) => record.id)).toEqual(["a-01"]);
  });
});
