import { describe, expect, it } from "vitest";
import { components } from "@/services/openapi/mycelium-schema";
import { describeAccountName, humanizeSlug } from "./describe-account-name";

type Account = components["schemas"]["Account"];

const base = {
  id: "0b3d1c8e-7a44-4a5f-8f62-9e1d2c3b4a55",
  slug: "x",
  isActive: true,
  isChecked: true,
  isArchived: false,
  isDeleted: false,
  isSystemAccount: false,
  createdAt: "2026-11-20T10:00:00Z",
} as unknown as Account;

const account = (patch: Partial<Account>) => ({ ...base, ...patch }) as Account;

describe("describeAccountName", () => {
  it("shows a namespace management account as such", () => {
    expect(
      describeAccountName(
        account({
          name: "tid/a37ba6940d27470ba8709e714173e269/manager",
          isSystemAccount: true,
          accountType: { tenantManager: { tenantId: "t-01" } },
        })
      )
    ).toEqual({
      kind: "tenantManager",
      rawName: "tid/a37ba6940d27470ba8709e714173e269/manager",
    });
  });

  it("shows a role account by its role", () => {
    expect(
      describeAccountName(
        account({
          name: "tid/t-01/role/subscriptions-manager",
          accountType: {
            roleAssociated: {
              tenantId: "t-01",
              roleName: "subscriptions-manager",
              readRoleId: "r1",
              writeRoleId: "r2",
            },
          },
        })
      )
    ).toMatchObject({ kind: "role", role: "Subscriptions manager" });
  });

  it("keeps the name of regular accounts", () => {
    expect(
      describeAccountName(
        account({ name: "Acme", accountType: { subscription: { tenantId: "t-01" } } })
      )
    ).toEqual({ kind: "regular", name: "Acme" });
  });

  it("falls back to the id prefix for an empty name", () => {
    expect(
      describeAccountName(account({ name: "", accountType: "user" }))
    ).toEqual({ kind: "regular", name: "0b3d1c8e" });
  });
});

describe("humanizeSlug", () => {
  it("handles kebab and camel case", () => {
    expect(humanizeSlug("guestsManager")).toBe("Guests manager");
    expect(humanizeSlug("tenant-manager")).toBe("Tenant manager");
  });
});
