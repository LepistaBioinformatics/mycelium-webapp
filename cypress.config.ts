import { defineConfig } from "cypress";

// End-to-end tests run against the Vite dev server started by
// `yarn e2e:serve`, which points the app at a fake gateway host. Every
// gateway call is stubbed with `cy.intercept`, so no backend is needed.
export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4173",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    video: false,
  },
});
