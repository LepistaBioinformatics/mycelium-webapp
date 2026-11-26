import { GATEWAY_URL as gateway } from "../support/gateway";

describe("Gateway unavailable", () => {
  it("dims the app while the gateway is down and resumes when it is back", () => {
    cy.intercept("GET", `${gateway}/app-config`, { statusCode: 200, body: {} });
    cy.intercept("GET", `${gateway}/health`, { forceNetworkError: true }).as("healthDown");

    cy.visit("/");
    cy.get('[role="alertdialog"]').should("be.visible");

    // The overlay sits on top of the page: clicks don't reach the form
    cy.get("body").then(($body) => {
      const { innerWidth, innerHeight } = $body[0].ownerDocument.defaultView!;
      const top = $body[0].ownerDocument.elementFromPoint(innerWidth / 2, innerHeight / 2);
      expect(top?.closest('[role="alertdialog"]')).to.not.equal(null);
    });

    cy.intercept("GET", `${gateway}/health`, { statusCode: 200, body: "success" }).as("healthUp");
    cy.get('[role="alertdialog"] button').click();
    cy.wait("@healthUp");
    cy.get('[role="alertdialog"]').should("not.exist");
  });
});
