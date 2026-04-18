import { describe, it, expect, vi, beforeEach } from "vitest";
import { profileGet, tenantsGetPublicInfo, tokensCreate } from "./beginners";

const getToken = vi.fn().mockResolvedValue("test-token");

function rpcOk<R>(result: R, id = 1): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", result, id }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  getToken.mockClear();
});

describe("profileGet", () => {
  it("calls beginners.profile.get with correct params and returns profile", async () => {
    const profile = {
      owners: [{ email: "user@example.com", name: null, uuid: "u1" }],
      isManager: false,
      isStaff: false,
      licensedResources: { noOne: true },
      tenantsOwnership: { noOne: true },
    };

    vi.mocked(fetch).mockResolvedValueOnce(rpcOk(profile));

    const result = await profileGet({ withUrl: false }, getToken);

    expect(result).toEqual(profile);

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.method).toBe("beginners.profile.get");
    expect(body.params).toEqual({ withUrl: false });
  });

  it("passes withUrl: true when requested", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(rpcOk({ owners: [], isManager: false, isStaff: false }));

    await profileGet({ withUrl: true }, getToken);

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.params.withUrl).toBe(true);
  });
});

describe("tenantsGetPublicInfo", () => {
  it("calls beginners.tenants.getPublicInfo with tenantId", async () => {
    const tenant = { id: "t1", name: "Tenant One", description: null, meta: null };

    vi.mocked(fetch).mockResolvedValueOnce(rpcOk(tenant));

    const result = await tenantsGetPublicInfo({ tenantId: "t1" }, getToken);

    expect(result).toEqual(tenant);

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.method).toBe("beginners.tenants.getPublicInfo");
    expect(body.params.tenantId).toBe("t1");
  });
});

describe("tokensCreate", () => {
  it("calls beginners.tokens.create with all required params", async () => {
    const response = { token: "tok-xyz", expiration: 1234567890 };

    vi.mocked(fetch).mockResolvedValueOnce(rpcOk(response));

    const params = { name: "my-token", expiration: 3600 };
    const result = await tokensCreate(params, getToken);

    expect(result).toEqual(response);

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.method).toBe("beginners.tokens.create");
    expect(body.params).toMatchObject({ name: "my-token", expiration: 3600 });
  });
});
