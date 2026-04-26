# Feature Spec: Telegram IdP — Webapp Integration

**Milestone:** M5 — Telegram IdP
**Scope:** Webapp (React/TypeScript)
**Status:** M5 complete (2026-04-20) · M5.1 gaps in progress
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

- `POST /auth/telegram/link` called from webapp — requires `initData` from Telegram Mini App client context; the service wrapper is added for completeness but the UI is informational only
- `POST /auth/telegram/login/{tenantId}` — public login flow; Mini App only
- Telegram Login Widget on the homepage (adds third-party JS; deferred)
- Reading back stored bot credentials (gateway never returns secrets)
- Displaying telegram username in the identity panel (T8 bonus — deferred unless explicitly requested)

---

## M5.1 Gap Requirements

These requirements were identified after M5 shipped. They are needed for the Telegram IDP
configuration to work end-to-end.

### TG-W-04 — Webhook URL in TelegramConfigCard

**Where:** `src/screens/Dashboard/components/Tenants/Details/TelegramConfigCard.tsx`
**Who:** Tenant Owner (already gated)

Without this, the admin cannot complete Telegram configuration: after saving bot credentials
they have no way to know the webhook URL to register with BotFather.

**URL format:**
```
${MYCELIUM_API_URL}/auth/telegram/webhook/${tenant.id}
```
Note: no `/_adm/` prefix — this is a public endpoint.

**Behaviour:**
- Always visible in the card (not only after save)
- Read-only text field displaying the full webhook URL
- Copy-to-clipboard button next to the field
- After click: button label switches to "Copied!" for 2 s then reverts (local state, no external deps)

**Acceptance Criteria:**
1. WHEN the TelegramConfigCard renders THEN the webhook URL field SHALL be visible immediately
2. WHEN the user clicks "Copy" THEN the URL SHALL be written to `navigator.clipboard` and the button label SHALL change to the "copied" i18n key
3. WHEN 2 seconds elapse after copy THEN the button label SHALL revert to "copy"
4. WHEN `yarn build` runs THEN it SHALL pass with zero new errors

---

### TG-W-05 — linkTelegram service function + informational UI

**Service layer:** `src/services/telegram/index.ts`

Add `linkTelegram(initData: string, getToken: () => Promise<string>): Promise<void>`:
- `POST /_adm/auth/telegram/link` with body `{ initData }` and `Authorization: Bearer <token>`
- Throws on non-2xx

This function exists for the Telegram Mini App to call. The webapp itself cannot generate
`initData` without the Telegram client context.

**UI layer:** `src/screens/Dashboard/components/Profile/TelegramIdentitySection.tsx`

When unlinked, the existing "Not linked" text should be accompanied by an informational note
explaining how to link. No button that calls the endpoint — just a visible hint.

**Behaviour:**
- Unlinked state: show `{t("TelegramIdentity.linkHint")}` below the "Not linked" label
- Text: "To link your Telegram account, open the [app name] Mini App on Telegram"
- No SDK dependency; no third-party JS

**Acceptance Criteria:**
1. WHEN `linkTelegram` is called with a valid `initData` string THEN it SHALL call `POST /_adm/auth/telegram/link` with the correct body and auth header
2. WHEN the identity section renders with an unlinked profile THEN the hint text SHALL be visible
3. WHEN `yarn build` runs THEN it SHALL pass with zero new errors

---

### TG-W-06 — Onboarding cleanup + identity panel safety

**Problem:**
The onboarding Step 4 saves a raw string (e.g. `"@myhandle"`) into `account.meta["telegram_user"]`
via generic RPC. The `TelegramIdentitySection` checks `!!profile.meta["telegram_user"]` and shows
"Linked" — but the gateway's `login_via_telegram` looks up accounts by parsing `meta["telegram_user"]`
as JSON `{ id: number; username?: string }`. A raw string breaks the lookup silently.

**Onboarding fix (`src/screens/Dashboard/components/Onboarding/index.tsx`):**
- Remove the `MetaField` for `telegram_user` (the free-text `@username` input)
- Replace with an informational paragraph: `{t("onboarding.meta.telegram.linkHint")}`
- Update `messagingSet` to: `!!(meta?.whatsapp_user)` only (telegram no longer manually settable)
- Remove `telegram_user` from `MetaKey` union type, `metaValues`, `metaSaving`, `metaSaved` state
- Remove `telegram_user` from the account meta restore block

**Identity panel safety (`src/screens/Dashboard/components/Profile/TelegramIdentitySection.tsx`):**
- Before checking `isLinked`, attempt to parse `profile.meta["telegram_user"]` as JSON
- `isLinked = true` only when the parsed value has a numeric `id` field (i.e., was set by the gateway's link endpoint)
- If the value exists but is not valid JSON or has no `id`, treat as not linked (backward compat for existing manual entries)

**Acceptance Criteria:**
1. WHEN the onboarding renders THEN there SHALL be no free-text input for `telegram_user`
2. WHEN `meta.whatsapp_user` is set THEN the messaging step SHALL be marked done
3. WHEN `meta.whatsapp_user` is unset (regardless of `telegram_user`) THEN the step SHALL NOT be done
4. WHEN `profile.meta["telegram_user"]` is a raw string (legacy) THEN `TelegramIdentitySection` SHALL show "Not linked"
5. WHEN `profile.meta["telegram_user"]` is `{"id":123,"username":"foo"}` THEN it SHALL show "Linked"
6. WHEN `yarn build` + `yarn lint` run THEN both SHALL pass with zero new errors
