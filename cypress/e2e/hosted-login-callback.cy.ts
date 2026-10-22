describe("Hosted login callback", () => {
  it("refuses a callback this browser did not start", () => {
    cy.stubGateway();
    cy.intercept("POST", "**/_adm/hosted-login/token", cy.spy().as("tokenCall"));

    cy.visit("/callback?code=forged&state=forged");

    cy.contains("Sign-in failed").should("be.visible");
    cy.contains("button", "Try again").should("be.visible");
    cy.get("@tokenCall").should("not.have.been.called");
  });
});
