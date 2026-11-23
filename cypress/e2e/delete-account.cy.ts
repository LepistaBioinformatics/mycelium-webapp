import { GATEWAY_URL } from "../support/gateway";

const TENANT = "11111111-2222-4333-8444-555555555555";
const ACCOUNT = {
  id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  name: "Subs Account",
  slug: "subs",
  isActive: true,
  isChecked: true,
  isArchived: false,
  isDeleted: false,
  isSystemAccount: false,
  owners: [],
  accountType: { subscription: { tenantId: TENANT } },
  createdAt: "2026-10-22T12:00:00Z",
  meta: {},
};

const DELETE_METHOD = "tenantManager.accounts.deleteSubscriptionAccount";

function openDeleteModal() {
  cy.visitSignedIn(
    `/dashboard/profile?accountId=${ACCOUNT.id}&tenantId=${TENANT}`
  );
  cy.contains("Advanced actions").click();
  cy.contains("button", /^delete$/i).click();
  cy.get('[role="dialog"]').contains("button", /^delete$/i).click();
}

describe("Delete account", () => {
  let deleteReply: object;

  beforeEach(() => {
    cy.fixture("profile.json").then((profile) => {
      cy.fixture("account.json").then((account) => {
        cy.stubGateway({
          "beginners.profile.get": { ...profile, isStaff: true, isManager: true },
          "beginners.accounts.get": account,
        });
      });
    });

    cy.intercept("POST", `${GATEWAY_URL}/_adm/rpc`, (req) => {
      const method = req.body.method;
      const reply = (body: object) =>
        req.reply({ jsonrpc: "2.0", id: req.body.id, ...body });

      if (method === "subscriptionsManager.accounts.get")
        return reply({ result: ACCOUNT });
      if (method === DELETE_METHOD) return reply(deleteReply);
    });
  });

  it("shows the gateway's message when the deletion fails", () => {
    deleteReply = { error: { code: -32602, message: "Account not found" } };

    openDeleteModal();

    cy.get("[data-app-notification]")
      .should("be.visible")
      .and("contain", "Account not found")
      .and("not.contain", "RPC error");
  });

  it("confirms the deletion and closes the account details", () => {
    deleteReply = { result: null };

    openDeleteModal();

    cy.get("[data-app-notification]")
      .should("be.visible")
      .and("contain", "Subs Account");
    cy.location("search").should("not.contain", "accountId");
    cy.contains("Advanced actions").should("not.exist");
  });
});
