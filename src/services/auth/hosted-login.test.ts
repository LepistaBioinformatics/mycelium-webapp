import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// The client id is read at import time, so each test loads a fresh module.
async function loadModule(clientId = "webapp") {
  vi.resetModules();
  vi.stubEnv("VITE_MYCELIUM_HOSTED_LOGIN_CLIENT_ID", clientId);
  return import("./hosted-login");
}

async function sha256Base64Url(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const assign = vi.fn();

beforeEach(() => {
  sessionStorage.clear();
  assign.mockClear();
  vi.stubGlobal("location", { ...window.location, assign, origin: "http://localhost:5173" });
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function redirectParams(): URLSearchParams {
  const target = assign.mock.calls[0]?.[0] as string;
  return new URL(target).searchParams;
}

function pending(): { state: string; codeVerifier: string } {
  return JSON.parse(sessionStorage.getItem("myc-hosted-login-pending") ?? "{}");
}

describe("startHostedLogin", () => {
  it("redirects to the gateway authorize URL with PKCE S256", async () => {
    const { startHostedLogin } = await loadModule();

    await startHostedLogin();

    const params = redirectParams();
    const stored = pending();

    expect(params.get("response_type")).toBe("code");
    expect(params.get("client_id")).toBe("webapp");
    expect(params.get("redirect_uri")).toBe("http://localhost:5173/callback");
    expect(params.get("code_challenge_method")).toBe("S256");
    expect(params.get("state")).toBe(stored.state);
    expect(params.get("code_challenge")).toBe(
      await sha256Base64Url(stored.codeVerifier)
    );
  });

  it("does nothing when hosted login is not configured", async () => {
    const { startHostedLogin } = await loadModule("");

    await startHostedLogin();

    expect(assign).not.toHaveBeenCalled();
  });
});

describe("completeHostedLogin", () => {
  it("exchanges the code with the stored verifier", async () => {
    const { startHostedLogin, completeHostedLogin } = await loadModule();
    await startHostedLogin();
    const stored = pending();

    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ access_token: "jwt", token_type: "Bearer", expires_in: 60 }),
        { status: 200 }
      )
    );

    const res = await completeHostedLogin("auth-code", stored.state);

    expect(res.access_token).toBe("jwt");
    const [url, init] = vi.mocked(fetch).mock.calls[0] ?? [];
    expect(String(url)).toMatch(/\/_adm\/hosted-login\/token$/);
    const body = new URLSearchParams(String(init?.body));
    expect(body.get("grant_type")).toBe("authorization_code");
    expect(body.get("code")).toBe("auth-code");
    expect(body.get("code_verifier")).toBe(stored.codeVerifier);
    expect(body.get("redirect_uri")).toBe("http://localhost:5173/callback");
    expect(sessionStorage.getItem("myc-hosted-login-pending")).toBeNull();
  });

  it("rejects a state that does not match this browser", async () => {
    const { startHostedLogin, completeHostedLogin } = await loadModule();
    await startHostedLogin();

    await expect(completeHostedLogin("auth-code", "forged")).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects when no login was started", async () => {
    const { completeHostedLogin } = await loadModule();

    await expect(completeHostedLogin("auth-code", "state")).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fails when the gateway refuses the code", async () => {
    const { startHostedLogin, completeHostedLogin } = await loadModule();
    await startHostedLogin();
    vi.mocked(fetch).mockResolvedValue(new Response("{}", { status: 400 }));

    await expect(
      completeHostedLogin("auth-code", pending().state)
    ).rejects.toThrow(/400/);
  });
});
