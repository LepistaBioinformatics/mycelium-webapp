# Quick 002 — Refresh lands on the not-found page

**Date:** 2026-10-22

Refreshing any dashboard sub-route (`/dashboard/profile`, `/tenants`, ...)
showed the "Ops" not-found page. The dashboard routes are built from the
profile (`buildRoutes(profile)` in `App.tsx`); right after a reload the session
and profile are still loading, the URL matches only `*`, and `NotFound`
renders until the profile arrives (a flash, or a long stay if it is slow).

## Change

`App.tsx`: the `*` route shows the loading bar while
`isLoadingUser || (!profile && isLoadingProfile)`, and `NotFound` only after.

## Verify

Headless Chromium (Playwright), logged-in session, reload each menu route:
before — not-found visible at 0 ms on every sub-route; after — never visible.
Unknown paths (`/dashboard/nao-existe`, `/xyz`) still show not-found, logged
in or not. `yarn build` ok, `yarn lint` 0 errors, `yarn test` 32 passed.
