import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

import { useAppConfig } from "@/hooks/use-app-config";

vi.mock("react-redux", () => ({ useDispatch: () => vi.fn() }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock("@/hooks/use-app-config", () => ({ useAppConfig: vi.fn() }));

const config = { domainName: "myc-01", domainUrl: null, locale: null };

async function renderWith(
  appConfig: ReturnType<typeof useAppConfig>,
  buildClientId = ""
) {
  vi.resetModules();
  vi.stubEnv("VITE_MYCELIUM_HOSTED_LOGIN_CLIENT_ID", buildClientId);
  vi.mocked(useAppConfig).mockReturnValue(appConfig);
  const { default: useHostedLogin } = await import("./use-hosted-login");
  return renderHook(() => useHostedLogin()).result.current;
}

beforeEach(() => {
  vi.mocked(useAppConfig).mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("useHostedLogin", () => {
  it("shows no login option while /app-config is loading", async () => {
    const res = await renderWith({ appConfig: undefined, appConfigError: undefined });

    expect(res.isHostedLogin).toBe(false);
    expect(res.isMagicLink).toBe(false);
  });

  it("uses the build-time client id without waiting for /app-config", async () => {
    const res = await renderWith(
      { appConfig: undefined, appConfigError: undefined },
      "webapp"
    );

    expect(res.isHostedLogin).toBe(true);
    expect(res.isMagicLink).toBe(false);
  });

  it("enables hosted login from /app-config", async () => {
    const res = await renderWith({
      appConfig: { ...config, hostedLoginClientId: "webapp" },
      appConfigError: undefined,
    });

    expect(res.isHostedLogin).toBe(true);
    expect(res.isMagicLink).toBe(false);
  });

  it("falls back to the magic-link form when /app-config has no client id", async () => {
    const res = await renderWith({ appConfig: config, appConfigError: undefined });

    expect(res.isHostedLogin).toBe(false);
    expect(res.isMagicLink).toBe(true);
  });

  it("falls back to the magic-link form when /app-config fails", async () => {
    const res = await renderWith({
      appConfig: undefined,
      appConfigError: new Error("boom"),
    });

    expect(res.isHostedLogin).toBe(false);
    expect(res.isMagicLink).toBe(true);
  });
});
