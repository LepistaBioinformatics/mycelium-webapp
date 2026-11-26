import { describe, it, expect } from "vitest";

import { buildPath, resolveApiUrl } from "./mycelium-api";

describe("resolveApiUrl", () => {
  it("is empty when unset, so API calls stay on the page's origin", () => {
    expect(resolveApiUrl(undefined)).toBe("");
    expect(resolveApiUrl("")).toBe("");
    expect(`${resolveApiUrl(undefined)}/_adm/rpc`).toBe("/_adm/rpc");
  });

  it("drops trailing slashes to avoid double slashes", () => {
    expect(resolveApiUrl("https://myc-01.example.com/")).toBe(
      "https://myc-01.example.com"
    );
    expect(resolveApiUrl("https://myc-01.example.com/v8")).toBe(
      "https://myc-01.example.com/v8"
    );
  });
});

describe("buildPath", () => {
  it("builds an absolute URL with path and query params", () => {
    const url = buildPath("/_adm/beginners/profile", {
      query: { withUrl: "true" },
    });

    expect(url).toBe("http://test-api/_adm/beginners/profile?withUrl=true");
  });
});
