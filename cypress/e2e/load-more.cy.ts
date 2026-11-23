import { GATEWAY_URL } from "../support/gateway";

const TOTAL = 25;

const tenant = (index: number) => ({
  id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
  name: `Tenant ${String(index).padStart(2, "0")}`,
  description: `Description ${index}`,
  owners: [],
  created: "2026-11-01T10:00:00-03:00",
});

describe("Load more", () => {
  let listParams: Record<string, unknown>[];

  beforeEach(() => {
    listParams = [];

    cy.fixture("profile.json").then((profile) => {
      cy.fixture("account.json").then((account) => {
        cy.stubGateway({
          "beginners.profile.get": { ...profile, isStaff: true, isManager: true },
          "beginners.accounts.get": account,
        });
      });
    });

    cy.intercept("POST", `${GATEWAY_URL}/_adm/rpc`, (req) => {
      if (req.body.method !== "managers.tenants.list") return;

      listParams.push(req.body.params);
      // The first page is requested without `skip`
      const skip = Number(req.body.params.skip ?? 0);
      const size = Number(req.body.params.pageSize);
      const records = Array.from(
        { length: Math.max(0, Math.min(size, TOTAL - skip)) },
        (_, offset) => tenant(skip + offset + 1)
      );

      req.reply({
        jsonrpc: "2.0",
        id: req.body.id,
        result: { count: TOTAL, skip, size, records },
      });
    });
  });

  it("appends the next page and hides the button once everything is loaded", () => {
    cy.visitSignedIn("/dashboard/tenants");

    cy.contains("Showing 20 of 25").should("be.visible");
    cy.get('#PaginatedContent a[href*="/dashboard/tenants/"]').should(
      "have.length",
      20
    );
    cy.get("#PaginatedContent").contains("Tenant 21").should("not.exist");

    cy.contains("button", "Load more").click();

    cy.contains("Showing 25 of 25").should("be.visible");
    cy.get("#PaginatedContent").contains("Tenant 01").should("exist");
    cy.get("#PaginatedContent").contains("Tenant 25").should("exist");
    cy.get('#PaginatedContent a[href*="/dashboard/tenants/"]').should(
      "have.length",
      TOTAL
    );
    cy.contains("button", "Load more").should("not.exist");

    cy.wrap(listParams).should((params) => {
      expect(params.at(-1)).to.include({ skip: 20, pageSize: 20 });
    });
  });
});
