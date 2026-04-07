# Project: Mycelium Webapp

## Vision

The official admin control panel for the Mycelium API Gateway. Lets operators manage
every aspect of the gateway — tenants, accounts, roles, webhooks, error codes, and
downstream service discovery — through a clean, type-safe UI.

## Current State

Fully functional React 19 SPA consuming the gateway exclusively via REST. Auth via Auth0.
The gateway has a complete JSON-RPC 2.0 implementation (`POST /_adm/rpc`) that the webapp
does not yet use.

## Goals

1. **Migrate REST → JSON-RPC** — replace all `buildPath` + `fetch`/`useSWR` REST calls with
   typed RPC wrappers. Single transport layer, fewer round-trips via batch support.
2. **Fix active concerns** — resolve the hooks and Redux issues catalogued in CONCERNS.md
   (H2, H3, M2, M4) as migration creates natural touch-points.
3. **Test coverage** — reach meaningful unit coverage on hooks and use-case logic.
   Currently at zero (H1).

## Non-Goals

- Redesigning the UI
- Adding new features before the migration is complete
- Migrating the `use-profile.tsx` profile fetch until H2 (useSWR in Redux thunk) is resolved
