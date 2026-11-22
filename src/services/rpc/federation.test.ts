import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  assertionsList,
  linksList,
  linksRevoke,
  peersList,
  peersQuarantine,
  peersRelease,
  peersRoles,
  setEnabled,
  translationsCreate,
  translationsDelete,
  translationsList,
  translationsSetEnabled,
} from "./federation";

const getToken = vi.fn().mockResolvedValue("test-token");

const INSTANCE_ID = "6f1a2b3c-0000-4000-8000-000000000001";

function rpcOk<R>(result: R, id = 1): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", result, id }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function rpcErr(code: number, message: string): Response {
  return new Response(
    JSON.stringify({ jsonrpc: "2.0", error: { code, message }, id: 1 }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

function sentBody() {
  const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
  return JSON.parse(init.body as string);
}

const peer = {
  id: "p1",
  instanceId: INSTANCE_ID,
  baseUrl: "https://myc-01.example.com",
  displayName: "Instance 01",
  status: "active",
  consumeKinds: ["profile.v1"],
  serveKinds: [],
  negotiatedKinds: ["profile.v1"],
  policy: {
    mayAssert: true,
    allowDifferentEmails: false,
    allowedLocalRoles: [],
    allowedLocalPermissions: [],
  },
  lastContactAt: null,
  failureCount: 0,
  created: "2026-11-01T00:00:00Z",
};

const rule = {
  id: "r1",
  peerId: "p1",
  issuer: { tenantId: "t1", role: "editor", minPerm: "read" },
  local: { accountId: "a1", guestRoleId: "g1", perm: "read" },
  enabled: true,
};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  getToken.mockClear();
});

describe("peers", () => {
  it("lists peers through federation.peers.list", async () => {
    const overview = [{ ...peer, keyIds: ["1"] }];
    vi.mocked(fetch).mockResolvedValueOnce(rpcOk(overview));

    const result = await peersList(getToken);

    expect(result).toEqual(overview);
    expect(sentBody().method).toBe("federation.peers.list");
  });

  it("quarantines a peer by instanceId", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      rpcOk({ ...peer, status: "quarantined" })
    );

    const result = await peersQuarantine({ instanceId: INSTANCE_ID }, getToken);

    expect(result.status).toBe("quarantined");
    expect(sentBody().method).toBe("federation.peers.quarantine");
    expect(sentBody().params).toEqual({ instanceId: INSTANCE_ID });
  });

  it("releases a peer by instanceId", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(rpcOk(peer));

    await peersRelease({ instanceId: INSTANCE_ID }, getToken);

    expect(sentBody().method).toBe("federation.peers.release");
    expect(sentBody().params).toEqual({ instanceId: INSTANCE_ID });
  });

  it("reads a peer vocabulary as a tagged answer", async () => {
    const answer = {
      outcome: "verified",
      roles: [
        {
          slug: "editor",
          name: "Editor",
          description: null,
          permission: "write",
          system: false,
          children: [],
        },
      ],
    };
    vi.mocked(fetch).mockResolvedValueOnce(rpcOk(answer));

    const result = await peersRoles({ instanceId: INSTANCE_ID }, getToken);

    expect(result).toEqual(answer);
    expect(sentBody().method).toBe("federation.peers.roles");
  });

  it("passes a rejected vocabulary through", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      rpcOk({ outcome: "rejected", reason: "bad signature" })
    );

    const result = await peersRoles({ instanceId: INSTANCE_ID }, getToken);

    expect(result).toEqual({ outcome: "rejected", reason: "bad signature" });
  });
});

describe("setEnabled", () => {
  it("sends the kill-switch as enabled: false", async () => {
    const setting = {
      key: "federation.enabled",
      value: false,
      created: "2026-11-01T00:00:00Z",
    };
    vi.mocked(fetch).mockResolvedValueOnce(rpcOk(setting));

    const result = await setEnabled({ enabled: false }, getToken);

    expect(result).toEqual(setting);
    expect(sentBody().method).toBe("federation.setEnabled");
    expect(sentBody().params).toEqual({ enabled: false });
  });

  it("surfaces the gateway refusal", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      rpcErr(-32603, "federation is not configured")
    );

    await expect(setEnabled({ enabled: true }, getToken)).rejects.toThrow(
      "federation is not configured"
    );
  });
});

describe("links", () => {
  const link = {
    id: "l1",
    localUserId: "u1",
    localEmail: "user-01@example.com",
    peerId: "p1",
    peerSubjectRef: null,
    localSubjectRef: "ref",
    status: "active",
    created: "2026-11-01T00:00:00Z",
    establishedAt: "2026-11-01T00:00:00Z",
    revokedAt: null,
  };

  it("lists links through federation.links.list", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(rpcOk([link]));

    const result = await linksList(getToken);

    expect(result).toEqual([link]);
    expect(sentBody().method).toBe("federation.links.list");
  });

  it("revokes a link by linkId", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      rpcOk({ ...link, status: "revoked" })
    );

    const result = await linksRevoke({ linkId: "l1" }, getToken);

    expect(result.status).toBe("revoked");
    expect(sentBody().method).toBe("federation.links.revoke");
    expect(sentBody().params).toEqual({ linkId: "l1" });
  });
});

describe("assertionsList", () => {
  it("lists stored assertions", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(rpcOk([]));

    const result = await assertionsList(getToken);

    expect(result).toEqual([]);
    expect(sentBody().method).toBe("federation.assertions.list");
  });
});

describe("translations", () => {
  it("lists rules, optionally of one peer", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(rpcOk([rule]));

    const result = await translationsList(
      { peerInstanceId: INSTANCE_ID },
      getToken
    );

    expect(result).toEqual([rule]);
    expect(sentBody().method).toBe("federation.translations.list");
    expect(sentBody().params).toEqual({ peerInstanceId: INSTANCE_ID });
  });

  it("creates a rule with every field", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(rpcOk(rule));

    const params = {
      peerInstanceId: INSTANCE_ID,
      issuerTenantId: "t1",
      issuerRole: "editor",
      issuerMinPerm: "read" as const,
      localAccountId: "a1",
      localGuestRoleId: "g1",
      localPerm: "read" as const,
    };
    const result = await translationsCreate(params, getToken);

    expect(result).toEqual(rule);
    expect(sentBody().method).toBe("federation.translations.create");
    expect(sentBody().params).toEqual(params);
  });

  it("surfaces a refused system-account target", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      rpcErr(-32603, "a system account cannot be a translation target")
    );

    await expect(
      translationsCreate(
        {
          peerInstanceId: INSTANCE_ID,
          issuerTenantId: "t1",
          issuerRole: "editor",
          issuerMinPerm: "read",
          localAccountId: "a1",
          localGuestRoleId: "g1",
          localPerm: "read",
        },
        getToken
      )
    ).rejects.toThrow("a system account cannot be a translation target");
  });

  it("enables or disables a rule", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(rpcOk({ ...rule, enabled: false }));

    const result = await translationsSetEnabled(
      { ruleId: "r1", enabled: false },
      getToken
    );

    expect(result.enabled).toBe(false);
    expect(sentBody().method).toBe("federation.translations.setEnabled");
    expect(sentBody().params).toEqual({ ruleId: "r1", enabled: false });
  });

  it("resolves when the rule is deleted", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(rpcOk("Deleted"));

    await expect(
      translationsDelete({ ruleId: "r1" }, getToken)
    ).resolves.toBeUndefined();
    expect(sentBody().method).toBe("federation.translations.delete");
    expect(sentBody().params).toEqual({ ruleId: "r1" });
  });

  it("throws the reason when the rule was not deleted", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      rpcOk({ NotDeleted: ["r1", "rule not found"] })
    );

    await expect(translationsDelete({ ruleId: "r1" }, getToken)).rejects.toThrow(
      "rule not found"
    );
  });
});
