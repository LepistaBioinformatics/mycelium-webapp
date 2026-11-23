import { describe, expect, it } from "vitest";
import { RpcCallError } from "@/services/rpc/client";
import {
  daysToSeconds,
  notificationExpirationDays,
  notificationIssuanceErrorKey,
} from "./notification-issuance";

describe("notificationExpirationDays", () => {
  it("keeps the presets up to the cap", () => {
    expect(notificationExpirationDays(90)).toEqual([1, 7, 30, 90]);
  });

  it("offers the cap when it is not a preset", () => {
    expect(notificationExpirationDays(45)).toEqual([1, 7, 30, 45]);
  });

  it("offers nothing without a valid cap", () => {
    expect(notificationExpirationDays(0)).toEqual([]);
  });
});

describe("daysToSeconds", () => {
  it("converts days to seconds", () => {
    expect(daysToSeconds(2)).toBe(172800);
  });
});

describe("notificationIssuanceErrorKey", () => {
  const rpcError = (errorCode: string | null) =>
    new RpcCallError(-32401, "beginners.tokens.createNotification", "x", errorCode);

  it("maps the issuance error codes", () => {
    expect(notificationIssuanceErrorKey(rpcError("MYC00035"))).toBe(
      "invalidRequest"
    );
    expect(notificationIssuanceErrorKey(rpcError("MYC00036"))).toBe(
      "notificationsDisabled"
    );
    expect(notificationIssuanceErrorKey(rpcError("MYC00037"))).toBe(
      "issuerNotAllowed"
    );
  });

  it("returns null for anything else", () => {
    expect(notificationIssuanceErrorKey(rpcError("MYC00001"))).toBeNull();
    expect(notificationIssuanceErrorKey(rpcError(null))).toBeNull();
    expect(notificationIssuanceErrorKey(new Error("boom"))).toBeNull();
  });
});
