import { describe, expect, it } from "vitest";
import {
  formatErrorCodeId,
  parseErrorCodeSearch,
} from "./parse-error-code-search";

describe("parseErrorCodeSearch", () => {
  it("splits prefix and number", () => {
    expect(parseErrorCodeSearch("MYC00023")).toEqual({ prefix: "MYC", code: 23 });
    expect(parseErrorCodeSearch("myc 23")).toEqual({ prefix: "MYC", code: 23 });
  });

  it("accepts only a prefix or only a number", () => {
    expect(parseErrorCodeSearch("myc")).toEqual({ prefix: "MYC", code: undefined });
    expect(parseErrorCodeSearch("23")).toEqual({ prefix: undefined, code: 23 });
  });

  it("ignores anything else", () => {
    expect(parseErrorCodeSearch("not a code!")).toEqual({});
    expect(parseErrorCodeSearch("")).toEqual({ prefix: undefined, code: undefined });
  });
});

describe("formatErrorCodeId", () => {
  it("pads the number to five digits", () => {
    expect(formatErrorCodeId("MYC", 23)).toBe("MYC00023");
  });
});
