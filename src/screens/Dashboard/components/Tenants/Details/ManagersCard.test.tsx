import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { SWRConfig } from "swr";
import { components } from "@/services/openapi/mycelium-schema";
import { guestsListGuestOnSubscriptionAccount } from "@/services/rpc/subscriptionsManager";
import ManagersCard from "./ManagersCard";

type Tenant = components["schemas"]["Tenant"];
type GuestUser = components["schemas"]["GuestUser"];

vi.mock("@/hooks/use-profile", () => ({
  default: () => ({
    hasEnoughPermissions: true,
    getAccessTokenSilently: async () => "token",
  }),
}));

vi.mock("react-redux", () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ tenant: { tenantInfo: null } }),
}));

vi.mock("@/services/rpc/subscriptionsManager", () => ({
  guestsListGuestOnSubscriptionAccount: vi.fn(),
  guestRolesGet: vi.fn(),
}));

// The invite flow itself (email + role steps) is out of scope here: the stub
// only reports a successful invite, as the real modal does after the RPC.
vi.mock("../../Accounts/GuestToAccountModal", () => ({
  default: ({ onInvited }: { onInvited?: () => void }) =>
    createElement("button", { onClick: onInvited }, "simulate invite"),
}));
vi.mock("../../Accounts/UnInviteGuestModal", () => ({ default: () => null }));
vi.mock("../CreateManagementAccount", () => ({ default: () => null }));

const guest = (username: string): GuestUser => ({
  id: username,
  email: { username, domain: "example.com" },
  guestRole: { id: "role-1" },
  created: "2026-11-22T10:00:00Z",
});

const tenant = {
  id: "tenant-1",
  name: "Tenant",
  manager: {
    record: {
      id: "manager-1",
      name: "Managers",
      accountType: { tenantManager: "tenant-1" },
    },
  },
} as unknown as Tenant;

function wrapper({ children }: { children: ReactNode }) {
  return createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children
  );
}

describe("ManagersCard invitations", () => {
  beforeEach(() => {
    vi.mocked(guestsListGuestOnSubscriptionAccount).mockReset();
  });

  it("reloads the invitations after a guest is invited", async () => {
    const list = vi.mocked(guestsListGuestOnSubscriptionAccount);
    list.mockResolvedValueOnce({ count: 1, records: [guest("first")] });
    list.mockResolvedValueOnce({
      count: 2,
      records: [guest("first"), guest("invited")],
    });

    render(createElement(ManagersCard, { tenant, mutateTenantStatus: vi.fn() }), {
      wrapper,
    });

    expect(await screen.findByText("first@example.com")).toBeInTheDocument();
    expect(screen.queryByText("invited@example.com")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("simulate invite"));

    expect(await screen.findByText("invited@example.com")).toBeInTheDocument();
    expect(list).toHaveBeenCalledTimes(2);
    expect(list.mock.calls[1]![0]).toMatchObject({
      accountId: "manager-1",
      tenantId: "tenant-1",
      skip: 0,
    });
  });
});
