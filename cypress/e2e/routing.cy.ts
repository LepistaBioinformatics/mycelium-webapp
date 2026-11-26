describe("Routing", () => {
  beforeEach(() => {
    cy.fixture("profile.json").then((profile) => {
      cy.fixture("account.json").then((account) => {
        cy.stubGateway({
          "beginners.profile.get": profile,
          "beginners.accounts.get": account,
          "beginners.tokens.list": [],
        });
      });
    });
  });

  it("reloading a dashboard sub-route never shows the not-found page", () => {
    cy.visitSignedIn("/dashboard/profile");
    cy.contains("Ops").should("not.exist");
    cy.location("pathname").should("eq", "/dashboard/profile");
    cy.contains("ana@example.com").should("be.visible");

    cy.reload();
    cy.contains("Ops").should("not.exist");
    cy.contains("ana@example.com").should("be.visible");
  });

  it("shows the not-found page for an unknown route", () => {
    cy.visitSignedIn("/dashboard/does-not-exist");
    cy.contains("Ops").should("be.visible");
  });
});
