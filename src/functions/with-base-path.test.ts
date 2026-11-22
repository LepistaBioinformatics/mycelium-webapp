import { describe, it, expect, vi, afterEach } from "vitest";

import { routerBasename, withBasePath } from "./with-base-path";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("withBasePath", () => {
  it("keeps root-relative paths when built for /", () => {
    vi.stubEnv("BASE_URL", "/");

    expect(withBasePath("/undraw.co/a.svg")).toBe("/undraw.co/a.svg");
    expect(withBasePath("logo.png")).toBe("/logo.png");
  });

  it("prefixes the base when built for /_app/", () => {
    vi.stubEnv("BASE_URL", "/_app/");

    expect(withBasePath("/undraw.co/a.svg")).toBe("/_app/undraw.co/a.svg");
    expect(withBasePath("callback")).toBe("/_app/callback");
  });
});

describe("routerBasename", () => {
  it("is / when built for /", () => {
    vi.stubEnv("BASE_URL", "/");

    expect(routerBasename()).toBe("/");
  });

  it("drops the trailing slash so /_app and /_app/ both match", () => {
    vi.stubEnv("BASE_URL", "/_app/");

    expect(routerBasename()).toBe("/_app");
  });
});
