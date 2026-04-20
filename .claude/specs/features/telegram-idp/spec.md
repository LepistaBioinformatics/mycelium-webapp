# Feature Spec: Telegram IdP — Webapp Integration

**Milestone:** M5 — Telegram IdP
**Scope:** Webapp (React/TypeScript)
**Status:** Planned
**Depends on:** Gateway M3 Telegram IdP (complete — all 5 REST endpoints live)

---

## Context

The gateway now exposes a full Telegram IdP implementation:
- `POST /_adm/tenant-owner/telegram/config` — tenant owner sets bot credentials
- `POST /_adm/auth/telegram/link` — authenticated user links Telegram identity (Mini App only)
- `DELETE /_adm/auth/telegram/link` — authenticated user unlinks Telegram identity
- `POST /_adm/auth/telegram/login/{tenantId}` — public: exchange initData for connection string
- `POST /_adm/auth/telegram/webhook/{tenantId}` — server-to-server webhook (not webapp-initiated)

The webapp has no Telegram UI yet. This spec covers the admin panel surfaces
that are actionable without the Telegram client context:

1. Tenant owners configure their bot credentials
2. Authenticated users view and unlink their Telegram identity
3. The onboarding "Messaging accounts" step reflects real link status

The **link** action (`POST /auth/telegram/link`) requires `initData` from
`@telegram-apps/sdk`, which is only available inside the Telegram client.
That flow belongs to the Telegram Mini App (see `.claude/specs/features/telegram-miniapp/`).

All five endpoints are REST (not RPC). Service functions call `fetch` directly with
`Authorization: Bearer <token>`.

---

## Requirements

### TG-W-01 — Telegram Bot Config form

**Where:** Tenant details area — extend the existing tenant settings section
**Who:** Tenant Owner role (`isOwner` guard in `use-profile.tsx`)
**Endpoint:** `POST /_adm/tenant-owner/telegram/config`

**Body (`SetTelegramConfigBody`):**
```typescript
{ bot_token: string; webhook_secret: string }
```

**Behaviour:**
- Form with two fields: `Bot Token` (type `password`) and `Webhook Secret` (type `password`)
- Both fields required; minimum 8 characters each
- Submit calls the endpoint with Bearer token from `useProfile()`
- On 204: show success notification; clear field values (secrets are write-only — no read-back)
- On error: show error notification with gateway message

**Schema note:** Verify `SetTelegramConfigBody` is present in `schema.d.ts`; if not, regenerate
or define the type locally in the service file.

---

### TG-W-02 — Telegram identity panel in user Profile

**Where:** User profile area (e.g. Dashboard → Profile section)
**Who:** Any authenticated user
**Data source:** `beginners.profile.get` — check for `telegram_user` field on profile; verify
schema after regeneration. If not exposed by profile endpoint, fall back to a placeholder
message until the gateway adds the field.

**Linked state (when `profile.telegram_user` is present):**
```
Telegram     @username (or numeric ID)     [Unlink]
```
- "Unlink" calls `DELETE /_adm/auth/telegram/link` (no body, Bearer token)
- On 204: mutate SWR key to re-fetch profile; show success notification

**Unlinked state:**
```
Telegram     Not linked     [Link via Telegram]
```
- "Link via Telegram" is an informational button/link — it does not call any endpoint
- It opens the Telegram Mini App deep link or shows a tooltip: "Open the Telegram Mini App to link your identity"

---

### TG-W-03 — Onboarding "Messaging accounts" step accuracy

**Where:** `src/screens/Dashboard/components/Onboarding/`

The onboarding step currently marks "Messaging accounts" done when either Telegram or WhatsApp
is set. Ensure the Telegram check reads from `profile.telegram_user` (not a free-text field).

**Changes:**
- Step completion condition: `profile.telegram_user != null || profile.whatsapp != null`
- If `telegram_user` is not yet in profile schema: treat as always `null` (step completion
  driven by WhatsApp only until schema is confirmed)
- Display linked Telegram username inside the step's done-state summary

---

## Service Layer

Create `src/services/telegram/index.ts`:

```typescript
// POST /_adm/tenant-owner/telegram/config
export async function setTelegramConfig(
  body: { bot_token: string; webhook_secret: string },
  getToken: () => Promise<string>,
): Promise<void>

// DELETE /_adm/auth/telegram/link
export async function unlinkTelegram(
  getToken: () => Promise<string>,
): Promise<void>
```

Both throw on non-2xx with the gateway error message. No RPC wrappers — these
are REST endpoints that mirror the existing pattern in `src/services/auth/magic-link.ts`.

---

## i18n Keys

Add to all 3 locale files (`src/i18n/{en,ptBr,es}/translations.json`):

```json
"telegram.config.title": "Telegram Bot",
"telegram.config.botToken.label": "Bot Token",
"telegram.config.webhookSecret.label": "Webhook Secret",
"telegram.config.submit": "Save",
"telegram.config.success": "Telegram bot configured",
"telegram.config.error": "Failed to save configuration",
"telegram.identity.linked": "Linked as {{handle}}",
"telegram.identity.notLinked": "Not linked",
"telegram.identity.unlinkButton": "Unlink",
"telegram.identity.unlinkSuccess": "Telegram account unlinked",
"telegram.identity.unlinkError": "Failed to unlink",
"telegram.identity.linkViaApp": "Link via Telegram"
```

---

## Out of Scope

- `POST /auth/telegram/link` — requires `initData` from Telegram client; Mini App only
- `POST /auth/telegram/login/{tenantId}` — public login flow; Mini App only
- `POST /auth/telegram/webhook/{tenantId}` — server-to-server; no webapp UI needed
- Telegram Login Widget on the homepage (adds third-party JS; deferred)
- Reading back stored bot credentials (gateway never returns secrets)
