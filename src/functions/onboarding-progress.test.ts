import { describe, expect, it } from "vitest";
import { components } from "@/services/openapi/mycelium-schema";
import { hasRealAccountName, onboardingProgress } from "./onboarding-progress";

type Account = components["schemas"]["Account"];

const EMAIL = "user-01@example.com";
const account = (name: string, meta: Record<string, string> = {}) =>
  ({ id: "a1", name, meta }) as unknown as Account;

describe("hasRealAccountName", () => {
  it("treats the sign-up email as no name", () => {
    expect(hasRealAccountName(account(EMAIL), EMAIL)).toBe(false);
    expect(hasRealAccountName(account("  "), EMAIL)).toBe(false);
    expect(hasRealAccountName(account("Ana Silva"), EMAIL)).toBe(true);
  });
});

describe("onboardingProgress", () => {
  it("starts at zero without an account", () => {
    expect(onboardingProgress(null, EMAIL, false)).toMatchObject({
      done: 0,
      total: 3,
      isComplete: false,
      percent: 0,
    });
  });

  it("completes a regular user without contact details", () => {
    const progress = onboardingProgress(
      account("Ana Silva", { locale: "en" }),
      EMAIL,
      false
    );
    expect(progress).toMatchObject({ done: 3, total: 3, isComplete: true });
  });

  it("asks privileged users for phone and job title", () => {
    const partial = onboardingProgress(
      account("Ana Silva", { locale: "en", phone_number: "+1 555" }),
      EMAIL,
      true
    );
    expect(partial).toMatchObject({ done: 3, total: 4, isComplete: false, percent: 75 });

    const complete = onboardingProgress(
      account("Ana Silva", {
        locale: "en",
        phone_number: "+1 555",
        job_title: "Infrastructure Lead",
      }),
      EMAIL,
      true
    );
    expect(complete.isComplete).toBe(true);
  });
});
