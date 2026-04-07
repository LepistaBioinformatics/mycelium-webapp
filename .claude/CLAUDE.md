# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

React 19 SPA — the admin control panel for the Mycelium API Gateway. Users manage tenants,
accounts, guest roles, webhooks, error codes, and downstream service discovery.

## Commands

```bash
# Dev server (network-accessible)
yarn dev

# Production build (tsc + vite)
yarn build

# Lint
yarn lint

# E2E (Cypress installed; cypress/e2e/ is currently empty — no specs exist yet)
yarn cy:open
```

## Architecture

**Provider stack** (`src/main.tsx`) — nesting order is load-bearing, do not reorder:
```
StrictMode
  ReduxProvider (store)
    PersistGate (loading=null — UI is blank until store rehydrates)
      ThemeProvider (Flowbite)
        Auth0Provider
          App
```

**Auth + permissions** — all flows go through `src/hooks/use-profile.tsx`:
- Fetches `GET /_adm/beginners/profile` with Bearer token from Auth0
- Caches result in `sessionStorage` with 1-min TTL
- Returns `hasEnoughPermissions` boolean based on `roles`, `permissions`, `isManager`, `isStaff`, etc.
- `hasEnoughPermissions === false` → SWR key becomes `null` → no fetch fires

**Data fetching** — SWR throughout. Pattern:
```typescript
const url = useMemo(
  () => hasEnoughPermissions ? buildPath("/_adm/...", { path: {}, query: {} }) : null,
  [hasEnoughPermissions, ...]
);
const { data, mutate } = useSWR(url, fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateOnMount: true,
  refreshInterval: 60_000,
});
```

**Design system** — `src/components/ui/` built with `class-variance-authority`. Shared tokens
in `src/constants/shared-component-styles.ts`. Use the CVA primitives; avoid direct Flowbite
component imports outside the ui/ wrappers.

**Type safety** — `src/services/openapi/mycelium-schema.d.ts` is generated from the gateway's
OpenAPI spec via `openapi-typescript`. Use `components["schemas"]["X"]` types for all gateway
data. Regenerate manually when the backend schema changes.

**i18n** — Every screen uses `useTranslation()`. Keys live in
`src/i18n/{en,ptBr,es}/translations.json`. Always add keys to all 3 locale files.

## Rules

Rules are defined in the monorepo's `.claude/rules/` directory with path-scoping to `modules/mycelium-webapp/**`.

---

## Active Concerns (read before editing these areas)

Full details in `.claude/specs/codebase/CONCERNS.md`.

| ID | File | Issue |
|---|---|---|
| H2 | `src/states/profile.state.tsx` | `useSWR` called inside Redux thunk — dormant crash; **never dispatch `fetchProfile`** |
| H3 | `src/components/AccountType.tsx:33-44` | Hooks called after early return — active crash risk |
| M2 | `src/states/store.ts` | All 3 Redux slices share persist key `"myc"` — they overwrite each other |
| M4 | Various | `useAuth0()` called directly in 6+ files outside `use-profile.tsx` |

## Current Focus: REST → JSON-RPC Migration

The Mycelium gateway has a complete JSON-RPC 2.0 implementation at `POST /_adm/rpc` that the
webapp does not yet use. The migration replaces each REST call with an equivalent RPC call.

### RPC Endpoint

```
POST /_adm/rpc
Authorization: Bearer <auth0-token>
Content-Type: application/json
```

**Single request:**
```json
{ "jsonrpc": "2.0", "method": "scope.resource.action", "params": { ... }, "id": 1 }
```

**Batch request** (multiple ops in one round-trip — the gateway supports this natively):
```json
[
  { "jsonrpc": "2.0", "method": "...", "params": { ... }, "id": 1 },
  { "jsonrpc": "2.0", "method": "...", "params": { ... }, "id": 2 }
]
```

**Success response:** `{ "jsonrpc": "2.0", "result": { ... }, "id": 1 }`
**Error response:** `{ "jsonrpc": "2.0", "error": { "code": -32601, "message": "..." }, "id": 1 }`

### Method Naming Convention

`<scope>.<resource>.<action>` — all camelCase. Params fields are camelCase JSON.

Scopes: `beginners` · `managers` · `accountManager` · `gatewayManager` · `guestManager` ·
`subscriptionsManager` · `systemManager` · `tenantManager` · `tenantOwner` · `userManager` ·
`service` · `staff`

- Full method list: `../mycelium-api-gateway/ports/api/src/rpc/method_names.rs`
- Params structs: `../mycelium-api-gateway/ports/api/src/rpc/params/<scope>.rs`
- Discovery: `GET /_adm/rpc` → OpenRPC spec JSON

### RPC Client Location

All RPC code lives in `src/services/rpc/`:
- `client.ts` — `rpcCall<P, R>(method, params, getToken)` and `rpcBatch(requests, getToken)`
- `<scope>.ts` — typed wrappers per gateway scope

Use `/add-rpc-call <method-name>` to scaffold a new typed wrapper.

## Skill: tlc-spec-driven

Spec documents live under `.claude/specs/` (not `.specs/`):
```
.claude/specs/project/     — PROJECT.md, ROADMAP.md, STATE.md
.claude/specs/codebase/    — STACK, ARCHITECTURE, CONVENTIONS, STRUCTURE, TESTING, INTEGRATIONS, CONCERNS
.claude/specs/features/    — Feature specs
.claude/specs/quick/       — Quick-mode tasks
```
