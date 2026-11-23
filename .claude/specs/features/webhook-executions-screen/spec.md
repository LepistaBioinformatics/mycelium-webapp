# Feature: Webhook executions on their own screen

**Status:** Implemented (WHX-01..WHX-05) — gate passing (lint 0 errors, 72 unit, 7 e2e); pending user approval
**Size:** Medium (routing + one screen move; design inline)

## Context

`/dashboard/webhooks` shows the webhook list and, below it, the execution events (summary and
events tables, `ExecutionEvents/`). Two unrelated jobs share one page.

## Requirements

- **WHX-01** `/dashboard/webhooks` lists webhooks only.
- **WHX-02** New route `/dashboard/webhook-executions` shows the execution events (summary +
  events), with its own breadcrumb and sidebar entry right after Webhooks.
- **WHX-03** The new screen keeps the existing permission gate (SystemManager role, read) and
  the existing RPC calls; no gateway change.
- **WHX-04** Sidebar label and breadcrumb translated in en, pt-br and es.
- **WHX-05** The existing Cypress spec `webhook-execution-events.cy.ts` visits the new route.
- **WHX-06** (user, 2026-11-22) The screen follows the other dashboard screens: search bar on
  top with a FILTERS palette. Filters are typed or picked as `status:<status>` and
  `trigger:<trigger>` (`functions/parse-webhook-execution-filters.ts`, unit-tested); the
  inline selects are gone. Totals and events are two separate cards.

## Design (inline)

- New `AppRoute` `WEBHOOK_EXECUTIONS` (icon `MdHistory`, position after `WEBHOOKS`), lazily
  loading a new screen `WebhookExecutions/index.tsx` that renders `PageBody` + breadcrumb +
  the existing `ExecutionEvents` component (moved from `WebHooks/ExecutionEvents/` to
  `WebhookExecutions/`).
