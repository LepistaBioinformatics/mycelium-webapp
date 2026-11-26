# 006 — Resolve Dependabot alerts

Alerts are computed on `main`. `develop` already fixed sharp, qs, extract-zip and uuid; `main`
carried Dependabot bumps (i18next 26, vite 7.3.7, vitest 5) never merged back into `develop`.

- Merge `origin/main` into the branch so the next develop → main PR is conflict-free.
- i18next ^26.3.4 (GHSA deepExtend DoS; react-i18next 15 peers i18next >= 23.4).
- typescript-eslint ^8.74.0 (pulls minimatch ^11).
- vitest / @vitest/coverage-v8 ^5.0.5, vite ^7.3.7 (from main).
- Resolutions: `**/workbox-build/glob` ^14.0.2 (no 11.x backport), `serialize-javascript` ^7.1.3.

Not fixable here: minimatch 10.2.5 and glob 13.0.6 bundled inside `npm` (used only by
`@semantic-release/npm` in the release job, on our own package.json). Resolutions cannot change
bundled dependencies; forcing them would only make the lockfile lie. Alerts #200/#201 stay open
until npm ships the fixes, or are dismissed as tolerable risk.

Verify: `yarn build`, `yarn lint`, `yarn test`, `yarn audit` (only the npm-bundled paths remain).
