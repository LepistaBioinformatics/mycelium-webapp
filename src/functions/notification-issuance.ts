import { RpcCallError } from "@/services/rpc/client";

const SECONDS_PER_DAY = 24 * 60 * 60;

const PRESET_DAYS = [1, 7, 30, 90, 180, 365];

/**
 * Expiration choices (in days) for a notification connection string: the
 * presets up to the instance cap, plus the cap itself when it is not one.
 */
export function notificationExpirationDays(maxDays: number): number[] {
  if (maxDays < 1) return [];

  const presets = PRESET_DAYS.filter((days) => days <= maxDays);

  return presets.includes(maxDays) ? presets : [...presets, maxDays];
}

export function daysToSeconds(days: number): number {
  return days * SECONDS_PER_DAY;
}

const ISSUANCE_ERRORS: Record<string, string> = {
  MYC00035: "invalidRequest",
  MYC00036: "notificationsDisabled",
  MYC00037: "issuerNotAllowed",
};

/** The i18n key suffix of a known issuance error, or null */
export function notificationIssuanceErrorKey(err: unknown): string | null {
  if (!(err instanceof RpcCallError) || !err.errorCode) return null;

  return ISSUANCE_ERRORS[err.errorCode] ?? null;
}
