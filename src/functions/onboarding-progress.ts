import { components } from "@/services/openapi/mycelium-schema";

type Account = components["schemas"]["Account"];

export type OnboardingStep = "account" | "name" | "locale" | "contact";

export interface OnboardingProgress {
  steps: Record<OnboardingStep, boolean>;
  /** Steps that count for this user (contact only for privileged roles) */
  required: OnboardingStep[];
  done: number;
  total: number;
  isComplete: boolean;
  percent: number;
}

/**
 * Whether the account carries a real name. Accounts created at sign-up are
 * named after the user's email until the user types a name.
 */
export function hasRealAccountName(
  account: Account | null | undefined,
  email: string | undefined
): boolean {
  const name = account?.name?.trim() ?? "";
  return name !== "" && name !== email;
}

/**
 * Onboarding state shared by the Getting started screen and the sidebar
 * avatar. Contact details (phone + job title, the keys the privileged-account
 * banner requires) only count for privileged roles.
 */
export function onboardingProgress(
  account: Account | null | undefined,
  email: string | undefined,
  privileged: boolean
): OnboardingProgress {
  const meta = (account?.meta ?? {}) as Record<string, string>;

  const steps: Record<OnboardingStep, boolean> = {
    account: !!account,
    name: hasRealAccountName(account, email),
    locale: !!meta.locale,
    contact: !!meta.phone_number && !!meta.job_title,
  };

  const required: OnboardingStep[] = privileged
    ? ["account", "name", "locale", "contact"]
    : ["account", "name", "locale"];

  const done = required.filter((step) => steps[step]).length;

  return {
    steps,
    required,
    done,
    total: required.length,
    isComplete: done === required.length,
    percent: Math.round((done / required.length) * 100),
  };
}
