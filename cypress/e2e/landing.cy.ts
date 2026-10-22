describe("Landing page", () => {
  it("signs in with the magic link and opens the dashboard", () => {
    cy.fixture("profile.json").then((profile) => {
      cy.fixture("account.json").then((account) => {
        cy.stubGateway({
          "beginners.profile.get": profile,
          "beginners.accounts.get": account,
        });
      });
    });
    cy.intercept("POST", "**/_adm/beginners/users/magic-link/request", {
      statusCode: 200,
      body: { sent: true },
    }).as("requestCode");
    cy.intercept("POST", "**/_adm/beginners/users/magic-link/verify", (req) => {
      const exp = Math.floor(Date.now() / 1000) + 3600;
      const payload = btoa(JSON.stringify({ exp })).replace(/=+$/, "");
      req.reply({
        token: `e30.${payload}.signature`,
        duration: 3600,
        totpRequired: false,
        id: "6f1c3a52-1f0e-4f5a-9d3e-2b8f0c1a7e11",
        email: { username: "ana", domain: "example.com" },
        firstName: "Ana",
        lastName: "Silva",
      });
    }).as("verifyCode");

    cy.visit("/");
    cy.get("input#email").type("ana@example.com");
    cy.get("form").first().submit();
    cy.wait("@requestCode").its("request.body").should("deep.equal", { email: "ana@example.com" });

    cy.get("input#code").type("123456");
    cy.get("form").first().submit();
    cy.wait("@verifyCode");

    cy.location("pathname").should("eq", "/dashboard");
    cy.contains("Ops").should("not.exist");
  });
});
