# Tasks: Telegram IdP — Webapp Integration

Legend: ⬜ not started · 🔄 in progress · ✅ done · 🔴 blocked

**Depends on:** Gateway M3 Telegram IdP (complete)

---

## T0 — Schema verification

**Status:** ⬜

**What:**
1. Check `src/services/openapi/mycelium-schema.d.ts` for:
   - `SetTelegramConfigBody` — expected: `{ bot_token: string; webhook_secret: string }`
   - `TelegramLoginResponse` — expected: `{ connection_string: string; expires_at: string }`
   - `telegram_user` field on any account/profile schema
2. If missing: regenerate schema from gateway OpenAPI spec
   ```bash
   # from modules/mycelium-webapp/
   npx openapi-typescript <gateway-url>/_adm/openapi.json -o src/services/openapi/mycelium-schema.d.ts
   ```
3. If regeneration is not yet possible (gateway not running): define types locally in the
   service file with a `// TODO: replace with schema type on next regeneration` comment

**Done when:** `SetTelegramConfigBody` is typed (from schema or local); `yarn build` passes

---

## T1 — Telegram service layer

**Status:** ⬜

**Depends on:** T0

**What:**
Create `src/services/telegram/index.ts`:

```typescript
import { components } from "@/services/openapi/mycelium-schema";

type SetTelegramConfigBody = components["schemas"]["SetTelegramConfigBody"];

export async function setTelegramConfig(
  body: SetTelegramConfigBody,
  getToken: () => Promise<string>,
): Promise<void> {
  const token = await getToken();
  const res = await fetch(`${GATEWAY_URL}/_adm/tenant-owner/telegram/config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function unlinkTelegram(
  getToken: () => Promise<string>,
): Promise<void> {
  const token = await getToken();
  const res = await fetch(`${GATEWAY_URL}/_adm/auth/telegram/link`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
}
```

`GATEWAY_URL` from `import.meta.env.VITE_API_URL` (match existing pattern in codebase).

**Done when:** `yarn build` passes; no `any` types

---

## T2 — i18n keys

**Status:** ⬜

**What:**
Add to `src/i18n/en/translations.json`, `src/i18n/ptBr/translations.json`,
and `src/i18n/es/translations.json`:

```json
"telegram": {
  "config": {
    "title": "Telegram Bot",
    "botToken": { "label": "Bot Token" },
    "webhookSecret": { "label": "Webhook Secret" },
    "submit": "Save",
    "success": "Telegram bot configured",
    "error": "Failed to save configuration"
  },
  "identity": {
    "linked": "Linked as {{handle}}",
    "notLinked": "Not linked",
    "unlinkButton": "Unlink",
    "unlinkSuccess": "Telegram account unlinked",
    "unlinkError": "Failed to unlink",
    "linkViaApp": "Link via Telegram"
  }
}
```

Use appropriate translations for `ptBr` and `es` locale files.

**Done when:** All 3 locale files updated; `yarn build` passes

---

## T3 — Telegram Bot Config form (TG-W-01)

**Status:** ⬜

**Depends on:** T1, T2

**What:**
Add a "Telegram Bot" section to the tenant settings area. Find the correct component
(likely in `src/screens/Dashboard/components/Tenants/Details/` or similar) and extend it.

New component or section `TelegramConfigSection.tsx`:
- `react-hook-form` with `{ bot_token: string; webhook_secret: string }`
- Both fields: `<TextInput type="password" color="custom" ...>` with brand-violet theme
- Validation: required, minLength 8
- Submit: call `setTelegramConfig(data, getAccessTokenSilently)` from `useProfile()`
  - On success: show notification + reset field values
  - On error: show error notification
- Only render if `isOwner` (gate via `useProfile()`)

**Done when:** `yarn build` passes, `yarn lint` passes, visible in tenant details for owners

---

## T4 — Telegram identity panel (TG-W-02)

**Status:** ⬜

**Depends on:** T1, T2

**What:**
Extend the user profile area (find the Profile component under `src/screens/Dashboard/components/`).

Logic:
```typescript
const telegramUser = profile?.telegram_user ?? null;
```

Linked state: display `@{username}` or `#{id}` + "Unlink" button
- On unlink click: call `unlinkTelegram(getAccessTokenSilently)` → mutate profile SWR
- On success: show notification

Unlinked state: display "Not linked" + "Link via Telegram" text/button (no action, informational)

**Schema note:** If `telegram_user` is not yet in the Profile schema from `schema.d.ts`,
use `(profile as any)?.telegram_user ?? null` and mark with `// TODO: remove cast after schema regen`.

**Done when:** `yarn build` passes, `yarn lint` passes

---

## T5 — Onboarding step accuracy (TG-W-03)

**Status:** ⬜

**Depends on:** T0

**What:**
`src/screens/Dashboard/components/Onboarding/` — find the "Messaging accounts" step.

Update step completion condition:
```typescript
const telegramLinked = !!(profile?.telegram_user);
const whatsappLinked = !!(profile?.whatsapp);
const isDone = telegramLinked || whatsappLinked;
```

If `telegram_user` is not in schema yet, condition simplifies to `whatsappLinked` only
(step completion driven by WhatsApp alone until schema is confirmed).

When `telegramLinked`, show `@{username}` in the step's completed-state summary alongside
WhatsApp info.

**Done when:** `yarn build` passes; step completion reflects actual Telegram link status

---

## T6 — Gate check + version bump

**Status:** ⬜

**Depends on:** T3, T4, T5

**What:**
From `modules/mycelium-webapp/`:
```bash
yarn build   # includes tsc
yarn lint
```

Both must pass with zero new errors (pre-existing 17 lint errors are out of scope).

Bump `version` in `package.json` — MINOR bump (new feature: Telegram IdP UI).

**Done when:** Build and lint pass; version bumped
