import { describe, expect, it } from "vitest";
import listPendingInvitations, {
  invitationKey,
} from "./list-pending-invitations";

const license = (overrides: Record<string, unknown> = {}) =>
  ({
    accId: "acc-1",
    accName: "Account 01",
    sysAcc: false,
    tenantId: "tenant-1",
    role: "viewer",
    roleId: "role-1",
    perm: "read",
    verified: false,
    ...overrides,
  }) as never;

describe("listPendingInvitations", () => {
  it("keeps only unverified licenses", () => {
    const result = listPendingInvitations([
      license(),
      license({ accId: "acc-2", verified: true }),
    ]);

    expect(result.map((i) => i.accountId)).toEqual(["acc-1"]);
  });

  it("deduplicates by account, role and permission", () => {
    const result = listPendingInvitations([
      license(),
      license(),
      license({ perm: "write" }),
    ]);

    expect(result).toHaveLength(2);
  });

  it("hides invitations accepted in this session", () => {
    const accepted = new Set([invitationKey("acc-1", "viewer", "read")]);

    expect(listPendingInvitations([license()], accepted)).toEqual([]);
  });

  it("sorts by account name", () => {
    const result = listPendingInvitations([
      license({ accId: "acc-b", accName: "Beta" }),
      license({ accId: "acc-a", accName: "Alpha" }),
    ]);

    expect(result.map((i) => i.accountName)).toEqual(["Alpha", "Beta"]);
  });

  it("handles a missing list", () => {
    expect(listPendingInvitations(null)).toEqual([]);
  });
});
