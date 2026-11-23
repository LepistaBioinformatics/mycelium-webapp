import { describe, expect, it } from "vitest";
import {
  parseWebhookExecutionFilters,
  withWebhookExecutionFilter,
} from "./parse-webhook-execution-filters";

describe("parseWebhookExecutionFilters", () => {
  it("reads trigger and status", () => {
    expect(
      parseWebhookExecutionFilters("trigger:userAccount.created status:failed")
    ).toEqual({ trigger: "userAccount.created", status: "failed" });
  });

  it("ignores unknown values and plain words", () => {
    expect(
      parseWebhookExecutionFilters("hello trigger:nope status:broken")
    ).toEqual({ trigger: undefined, status: undefined });
  });

  it("is empty without a term", () => {
    expect(parseWebhookExecutionFilters(null)).toEqual({});
  });
});

describe("withWebhookExecutionFilter", () => {
  it("replaces the same filter and keeps the other", () => {
    expect(
      withWebhookExecutionFilter(
        "trigger:userAccount.created status:failed",
        "status",
        "success"
      )
    ).toBe("trigger:userAccount.created status:success");
  });

  it("adds a filter to an empty term", () => {
    expect(withWebhookExecutionFilter(null, "trigger", "userAccount.deleted")).toBe(
      "trigger:userAccount.deleted"
    );
  });
});
