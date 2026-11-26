import { GATEWAY_URL } from "../support/gateway";

const TENANT = "11111111-2222-4333-8444-555555555555";
const ACCOUNT = "22222222-3333-4444-8555-666666666666";

const license = (verified: boolean) => ({
  accId: ACCOUNT,
  accName: "Account 01",
  sysAcc: false,
  tenantId: TENANT,
  role: "viewer",
  roleId: "33333333-4444-4555-8666-777777777777",
  perm: "write",
  verified,
});

describe("Guest invitations", () => {
  let verified: boolean;
  let acceptParams: Record<string, unknown>[];
  let acceptReply: object;

  beforeEach(() => {
    verified = false;
    acceptParams = [];
    acceptReply = { result: { updated: true } };

    cy.fixture("profile.json").then((profile) => {
      cy.fixture("account.json").then((account) => {
        cy.stubGateway({
          "beginners.profile.get": profile,
          "beginners.accounts.get": account,
        });

        cy.intercept("POST", `${GATEWAY_URL}/_adm/rpc`, (req) => {
          const method = req.body.method;
          const reply = (body: object) =>
            req.reply({ jsonrpc: "2.0", id: req.body.id, ...body });

          if (method === "beginners.profile.get")
            return reply({
              result: {
                ...profile,
                licensedResources: { records: [license(verified)] },
              },
            });
          if (method === "beginners.tenants.getPublicInfo")
            return reply({ result: { id: TENANT, name: "Acme Research" } });
          if (method === "beginners.guests.acceptInvitation") {
            acceptParams.push(req.body.params);
            return reply(acceptReply);
          }
        });
      });
    });
  });

  it("shows a banner that leads to the invitations tab", () => {
    cy.visitSignedIn("/dashboard/profile");

    cy.get("[data-cy=pending-invitations-banner]")
      .should("contain", "You have 1 pending invitation")
      .contains("button", "Review invitations")
      .click();

    cy.location("search").should("eq", "?tab=invitations");
    cy.get("[data-cy=pending-invitations-banner]").should("not.exist");
    cy.get("[data-cy=pending-invitation]")
      .should("contain", "Account 01")
      .and("contain", "Acme Research")
      .and("contain", "viewer");
  });

  it("accepts an invitation", () => {
    cy.visitSignedIn("/dashboard/profile?tab=invitations");

    cy.get("[data-cy=pending-invitation]").should("have.length", 1);
    cy.then(() => {
      verified = true;
    });
    cy.contains("button", "Accept").click();

    cy.contains("Invitation accepted").should("be.visible");
    cy.get("[data-cy=pending-invitation]").should("not.exist");
    cy.contains("No pending invitations").should("be.visible");
    cy.wrap(acceptParams).should("have.length", 1);
    cy.wrap(acceptParams).its(0).should("deep.equal", {
      accountId: ACCOUNT,
      guestRoleName: "viewer",
      permission: 1,
    });
  });

  it("keeps an accepted invitation hidden while the profile is stale", () => {
    cy.visitSignedIn("/dashboard/profile?tab=invitations");

    cy.contains("button", "Accept").click();

    cy.contains("Invitation accepted").should("be.visible");
    cy.get("[data-cy=pending-invitation]").should("not.exist");
  });

  it("marks pending licenses on the licensed resources tab", () => {
    cy.visitSignedIn("/dashboard/profile?tab=licensedResources");

    cy.contains("a", "Pending").click();
    cy.location("search").should("eq", "?tab=invitations");
  });

  it("shows the gateway error", () => {
    acceptReply = {
      error: {
        code: -32602,
        message: "License does not match the invitation",
      },
    };

    cy.visitSignedIn("/dashboard/profile?tab=invitations");
    cy.contains("button", "Accept").click();

    cy.get("[data-app-notification]").should("be.visible");
    cy.get("[data-cy=pending-invitation]").should("have.length", 1);
  });
});
