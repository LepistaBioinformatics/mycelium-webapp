import { GATEWAY_URL } from "../support/gateway";

const summary = [
  {
    trigger: "userAccount.created",
    status: "success",
    count: 12,
    latest: "2026-10-22T10:00:00-03:00",
  },
  {
    trigger: "subscriptionAccount.deleted",
    status: "exhausted",
    count: 2,
    latest: "2026-10-21T08:30:00-03:00",
  },
];

const event = {
  id: "8a1f6c2e-1d3b-4c5a-9e7f-0b2c4d6e8f10",
  trigger: "subscriptionAccount.deleted",
  payloadId: "acc-42",
  dispatch: {
    status: "exhausted",
    attempts: 5,
    created: "2026-10-21T08:30:00-03:00",
    attempted: "2026-10-21T09:00:00-03:00",
  },
  propagations: { total: 3, failed: 2, lastResponseStatus: 503 },
};

describe("Webhook execution events", () => {
  let listParams: Record<string, unknown>[];

  beforeEach(() => {
    listParams = [];

    cy.fixture("profile.json").then((profile) => {
      cy.fixture("account.json").then((account) => {
        cy.stubGateway({
          "beginners.profile.get": { ...profile, isStaff: true },
          "beginners.accounts.get": account,
          "systemManager.webhooks.summarizeExecutions": summary,
        });
      });
    });

    cy.intercept("POST", `${GATEWAY_URL}/_adm/rpc`, (req) => {
      if (req.body.method !== "systemManager.webhooks.listExecutions") return;

      listParams.push(req.body.params);
      const result =
        req.body.params.status === "success"
          ? null
          : { count: 1, skip: 0, size: 20, records: [event] };

      req.reply({ jsonrpc: "2.0", id: req.body.id, result });
    });
  });

  it("shows the totals and the events without payloads", () => {
    cy.visitSignedIn("/dashboard/webhooks");

    cy.get("[data-testid=webhook-execution-summary]")
      .should("contain", "12")
      .and("contain", "Exhausted");

    cy.get("[data-testid=webhook-execution-events]")
      .should("contain", "2 failed of 3")
      .and("contain", "503")
      .and("contain", "Exhausted");
  });

  it("filters the events by status and shows the empty state", () => {
    cy.visitSignedIn("/dashboard/webhooks");
    cy.get("[data-testid=webhook-execution-events]").should("exist");

    cy.get("#execution-status-filter").select("success");

    cy.contains("No execution events yet.").should("be.visible");
    cy.wrap(listParams).should((params) => {
      expect(params.at(-1)).to.include({ status: "success", skip: 0 });
    });
  });
});
