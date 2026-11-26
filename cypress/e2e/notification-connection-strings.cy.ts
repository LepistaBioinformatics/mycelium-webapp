import { GATEWAY_URL } from "../support/gateway";

const TENANT = "11111111-2222-4333-8444-555555555555";
const ISSUED = "c2lnPXNpZ25hdHVyZQ==";

const OPTIONS = {
  maxConnectionStringTtlInDays: 45,
  services: [
    {
      senderTag: "service-01",
      displayName: "Service 01",
      recipientPolicy: "owner",
      tenantIds: [TENANT],
      allowsNoTenant: true,
    },
    {
      senderTag: "service-02",
      displayName: "Service 02",
      recipientPolicy: "tenantMembers",
      tenantIds: [TENANT],
      allowsNoTenant: false,
    },
  ],
};

const NOTIFICATION_TOKEN = {
  id: 7,
  innerId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  accountId: "0b3d1c8e-7a44-4a5f-8f62-9e1d2c3b4a55",
  email: "user-01@example.com",
  name: "service-01-mailer",
  expiration: "2027-01-01T00:00:00Z",
  createdAt: "2026-11-23T00:00:00Z",
  scope: [{ scp: ["notify:email"] }, { svc: "service-01" }],
};

describe("Notification connection strings", () => {
  let createParams: Record<string, unknown>[];
  let createReply: object;

  beforeEach(() => {
    createParams = [];
    createReply = { result: { connectionString: ISSUED } };

    cy.fixture("profile.json").then((profile) => {
      cy.fixture("account.json").then((account) => {
        cy.stubGateway({
          "beginners.profile.get": profile,
          "beginners.accounts.get": account,
        });
      });
    });

    cy.intercept("POST", `${GATEWAY_URL}/_adm/rpc`, (req) => {
      const method = req.body.method;
      const reply = (body: object) =>
        req.reply({ jsonrpc: "2.0", id: req.body.id, ...body });

      if (method === "beginners.tokens.list")
        return reply({ result: [NOTIFICATION_TOKEN] });
      if (method === "beginners.tokens.listNotificationServices")
        return reply({ result: OPTIONS });
      if (method === "beginners.tenants.getPublicInfo")
        return reply({ result: { id: TENANT, name: "Acme Research" } });
      if (method === "beginners.tokens.createNotification") {
        createParams.push(req.body.params);
        return reply(createReply);
      }
    });

    cy.visitSignedIn("/dashboard/profile?tab=listConnectionStrings");
  });

  it("keeps the old advanced options link on the merged tab", () => {
    cy.visitSignedIn("/dashboard/profile?tab=advancedOptions");

    cy.contains("button", "Create connection string").should("be.visible");
    cy.contains("button", "Notification string").should("be.visible");
    cy.contains("service-01-mailer").should("be.visible");
  });

  it("labels notification strings by scope and service", () => {
    cy.contains("service-01-mailer").should("be.visible");
    cy.contains("notify:email").should("be.visible");
    cy.contains("service: service-01").should("be.visible");
  });

  it("issues a string and shows it once with the warning", () => {
    cy.contains("button", "Notification string").click();

    cy.get("#notification-expiration option").then((options) => {
      const days = [...options].map((option) => option.value);
      expect(days).to.deep.equal(["1", "7", "30", "45"]);
    });

    cy.get("#notification-name").type("service-01-mailer");
    cy.get("#notification-service").select("service-02");
    cy.get("#notification-tenant option").should("have.length", 1);
    cy.get("#notification-tenant").should("contain", "Acme Research");
    cy.contains("pick one").should("be.visible");

    cy.contains("button", /^create$/i).click();

    cy.contains("will not be shown again").should("be.visible");
    cy.get(`input[value="${ISSUED}"]`).should("exist");
    cy.wrap(createParams).should("have.length", 1);
    cy.wrap(createParams).its(0).should("deep.include", {
      name: "service-01-mailer",
      senderTag: "service-02",
      tenantId: TENANT,
      expiration: 30 * 24 * 60 * 60,
    });
  });

  it("explains an issuer that is not allowed", () => {
    createReply = {
      error: {
        code: -32401,
        message: "Issuer lacks the service issuer roles",
        data: { code: "MYC00037" },
      },
    };

    cy.contains("button", "Notification string").click();
    cy.get("#notification-name").type("service-01-mailer");
    cy.contains("button", /^create$/i).click();

    cy.get("[data-app-notification]")
      .should("be.visible")
      .and("contain", "not allowed to issue notification strings");
  });
});
