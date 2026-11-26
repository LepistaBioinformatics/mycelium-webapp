import "./commands";
import { GATEWAY_URL } from "./gateway";

type RpcResults = Record<string, unknown>;

/** A JWT the webapp accepts: it only checks the `exp` claim locally. */
function fakeJwt(): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  const exp = Math.floor(Date.now() / 1000) + 60 * 60;

  return `${encode({ alg: "none", typ: "JWT" })}.${encode({ exp })}.signature`;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Stub the gateway: health, app config and JSON-RPC results by method. */
      stubGateway(rpc?: RpcResults): Chainable<void>;
      /** Visit `path` with a signed-in session for the profile fixture user. */
      visitSignedIn(path: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("stubGateway", (rpc: RpcResults = {}) => {
  cy.intercept("GET", `${GATEWAY_URL}/health`, { statusCode: 200, body: "success" }).as("health");
  cy.intercept("GET", `${GATEWAY_URL}/app-config`, { statusCode: 200, body: {} });
  cy.intercept("POST", `${GATEWAY_URL}/_adm/rpc`, (req) => {
    const method = (req.body as { method: string }).method;
    const result = method in rpc ? rpc[method] : null;
    req.reply({ jsonrpc: "2.0", id: req.body.id, result });
  }).as("rpc");
});

Cypress.Commands.add("visitSignedIn", (path: string) => {
  cy.fixture("profile.json").then((profile) => {
    const owner = profile.owners[0];
    const [username, domain] = owner.email.split("@");

    cy.visit(path, {
      onBeforeLoad(win) {
        win.sessionStorage.setItem("myc-native-token", fakeJwt());
        win.sessionStorage.setItem(
          "myc-native-user",
          JSON.stringify({ id: owner.id, email: { username, domain } })
        );
      },
    });
  });
});

export {};
