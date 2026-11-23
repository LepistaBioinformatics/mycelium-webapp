import { describe, expect, it } from "vitest";
import {
  composeSearchTerm,
  parseSearchTerm,
  replaceSearchFilter,
  searchFilterLabel,
} from "./search-term-filters";

describe("parseSearchTerm", () => {
  it("splits filters from free text", () => {
    expect(parseSearchTerm("/subscription acme status:failed corp")).toEqual({
      filters: ["/subscription", "status:failed"],
      text: "acme corp",
    });
  });

  it("keeps code=23 style tokens as text", () => {
    expect(parseSearchTerm("MYC code=23")).toEqual({
      filters: [],
      text: "MYC code=23",
    });
  });

  it("handles an empty term", () => {
    expect(parseSearchTerm(null)).toEqual({ filters: [], text: "" });
  });
});

describe("composeSearchTerm", () => {
  it("joins filters and text", () => {
    expect(composeSearchTerm(["/user"], " ana ")).toBe("/user ana");
    expect(composeSearchTerm([], "")).toBe("");
  });
});

describe("replaceSearchFilter", () => {
  it("replaces a filter of the same group and keeps the rest", () => {
    expect(
      replaceSearchFilter("/user /verified ana", "/staff", ["/user", "/staff"])
    ).toBe("/verified /staff ana");
  });
});

describe("searchFilterLabel", () => {
  it("humanizes commands and key:value filters", () => {
    expect(searchFilterLabel("/tenantManager")).toBe("Tenant manager");
    expect(searchFilterLabel("status:failed")).toBe("Status: failed");
  });
});
