# Quick 003 — Detect an unreachable gateway and pause the UI

**Date:** 2026-10-22

With the gateway down but the webapp up, a user with a stored session got
in and onboarding asked them to create an account: it treated every failed
request as "no account" (`.catch(() => setAccountStatus("missing"))`).

## Change

- `src/hooks/use-gateway-health.ts`: SWR probe of `GET {API}/health` every
  15 s (also on focus/reconnect, and while the tab is hidden), 5 s timeout.
  Down = a probe failed (network error or non-2xx). When it comes back after
  being down, every other SWR key is revalidated.
- `src/components/GatewayUnavailableOverlay.tsx`, mounted at the `App` root:
  full-screen dimmed backdrop (same style as `Modal`) that intercepts clicks,
  `role="alertdialog"`, message + "try again now" button. i18n in en/pt-br/es.
- Onboarding: a `TypeError` from `fetch` (unreachable) no longer sets
  `missing`; the account check re-runs when the gateway state changes.

## Verify

`yarn build` ok, `yarn lint` 0 errors, `yarn test` 34 passed (4 new for the
hook). Playwright with requests to the gateway refused: overlay visible, the
point under the cursor belongs to the overlay; after letting requests through
and clicking retry, the overlay disappears.
