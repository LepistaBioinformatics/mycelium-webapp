import { describe, expect, it } from "vitest";
import { hasMorePages } from "./use-load-more";

const page = (records: number, count: number) => ({
  records: Array.from({ length: records }, (_, index) => index),
  count,
});

describe("hasMorePages", () => {
  it("is false before anything loads", () => {
    expect(hasMorePages(undefined, 10)).toBe(false);
  });

  it("is true while loaded records are below the count", () => {
    expect(hasMorePages([page(10, 25)], 10)).toBe(true);
    expect(hasMorePages([page(10, 25), page(10, 25)], 10)).toBe(true);
  });

  it("is false once everything is loaded", () => {
    expect(hasMorePages([page(10, 25), page(10, 25), page(5, 25)], 10)).toBe(false);
    expect(hasMorePages([page(10, 10)], 10)).toBe(false);
  });

  it("is false after a short page even if the count says more", () => {
    expect(hasMorePages([page(4, 50)], 10)).toBe(false);
  });

  it("is false for an empty (null) page", () => {
    expect(hasMorePages([null], 10)).toBe(false);
  });
});
