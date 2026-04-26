# Tasks: Telegram IdP — Webapp Integration

Legend: ⬜ not started · 🔄 in progress · ✅ done · 🔴 blocked

**Depends on:** Gateway M3 Telegram IdP (complete)

---

## T0 — Schema verification

**Status:** ✅

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

**Status:** ✅

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

**Status:** ✅

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

**Status:** ✅

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

**Status:** ✅

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

**Status:** ✅ (deferred intentionally — onboarding `messagingSet` kept as-is; `profile.meta["telegram_user"]` is available in schema but the step already checks account.meta via RPC; no regression introduced)

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

**Status:** ✅

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

---

## M5.1 Gap Tasks

---

## T7 — Webhook URL display in TelegramConfigCard (TG-W-04)

**Status:** ✅

**Depends on:** T6 (M5 complete)

**What:**
Add a read-only webhook URL field with copy-to-clipboard to `TelegramConfigCard.tsx`.

Files:
- `src/screens/Dashboard/components/Tenants/Details/TelegramConfigCard.tsx`
- `src/i18n/en/translations.json`, `src/i18n/ptBr/translations.json`, `src/i18n/es/translations.json`

i18n keys to add under `screens.Dashboard.TelegramConfig`:
```json
"webhookUrl": {
  "label": "Webhook URL",
  "copy": "Copy",
  "copied": "Copied!"
}
```

Implementation details:
- Derive URL: `` `${MYCELIUM_API_URL}/auth/telegram/webhook/${tenant.id}` `` (no `/_adm/`)
- Import `MYCELIUM_API_URL` from `@/services/openapi/mycelium-api`
- Always show the URL field (above the form inputs, in a read-only `<input type="text">` styled like the existing `INPUT` class)
- Add a small "Copy" `<Button>` next to the input
- On click: `navigator.clipboard.writeText(url)` then set local `copied` state to `true` for 2 s using `setTimeout`
- `setTimeout` in a click handler is legitimate (not a useEffect data fetch), but note: clear the timer on unmount if the component unmounts before 2 s

**Done when:**
- [ ] Webhook URL field visible in `TelegramConfigCard` for tenant owners
- [ ] Clicking "Copy" writes the URL to clipboard and shows "Copied!" for 2 s
- [ ] `yarn build` passes with zero new errors
- [ ] `yarn lint` passes

**Tests:** none (no test infrastructure)
**Gate:** build

---

## T8 — linkTelegram service + identity panel hint (TG-W-05)

**Status:** ✅

**Depends on:** T7

**What:**
Two changes — service function and UI hint.

**Service (`src/services/telegram/index.ts`):**
Add:
```typescript
export async function linkTelegram(
  initData: string,
  getToken: () => Promise<string>,
): Promise<void> {
  const token = await getToken();
  const res = await fetch(`${MYCELIUM_API_URL}/_adm/auth/telegram/link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ initData }),
  });
  if (!res.ok) throw new Error(await res.text());
}
```

**Identity panel (`src/screens/Dashboard/components/Profile/TelegramIdentitySection.tsx`):**
In the unlinked branch, add a hint paragraph below the "Not linked" text:
```tsx
<Typography as="small" decoration="smooth">
  {t(`${BASE}.linkHint`)}
</Typography>
```

i18n key to add under `screens.Dashboard.TelegramIdentity`:
```json
"linkHint": "To link your Telegram account, open the Mini App on Telegram."
```

**Done when:**
- [ ] `linkTelegram` exported from `src/services/telegram/index.ts` with correct method/body
- [ ] Hint text visible in `TelegramIdentitySection` when `isLinked` is false
- [ ] `yarn build` passes with zero new errors
- [ ] `yarn lint` passes

**Tests:** none
**Gate:** build

---

## T9 — Onboarding cleanup + identity panel safety (TG-W-06)

**Status:** ✅

**Depends on:** T8

**What:**
Two coordinated changes — onboarding removal and identity panel backward compat.

**Onboarding (`src/screens/Dashboard/components/Onboarding/index.tsx`):**
- Remove `"telegram_user"` from the `MetaKey` union type
- Remove `telegram_user` from `metaValues`, `metaSaving`, `metaSaved` initial state
- Remove the `telegram_user` line from the account meta restore block (the one that sets `metaValues` from `account.meta`)
- Remove the `MetaField` for `telegram_user` (the `@username` input in Step 4)
- Replace it with:
  ```tsx
  <Typography as="small" decoration="smooth">
    {t(`${tKey}.meta.telegram.linkHint`)}
  </Typography>
  ```
- Update `messagingSet`:
  ```typescript
  const messagingSet = !!(meta?.whatsapp_user);
  ```

i18n key to add under the onboarding namespace:
```json
"meta.telegram.linkHint": "To link your Telegram account, open the Telegram Mini App."
```
(Find the exact key path by checking where `meta.telegram.title` is already defined)

**Identity panel (`src/screens/Dashboard/components/Profile/TelegramIdentitySection.tsx`):**
Replace the current `isLinked` derivation:
```typescript
// Before
const isLinked = !!profile?.meta?.["telegram_user"];

// After — only true when the value is gateway-issued JSON with an id field
const isLinked = (() => {
  try {
    const raw = profile?.meta?.["telegram_user"];
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return typeof parsed?.id === "number";
  } catch {
    return false;
  }
})();
```

**Done when:**
- [ ] No `telegram_user` free-text field in onboarding Step 4
- [ ] Informational hint rendered in its place
- [ ] `messagingSet` no longer checks `telegram_user`
- [ ] `isLinked` in `TelegramIdentitySection` is false for legacy raw-string values
- [ ] `isLinked` is true for gateway-issued JSON `{"id": 123, ...}`
- [ ] `yarn build` passes with zero new errors
- [ ] `yarn lint` passes

**Tests:** none
**Gate:** build

---

## T10 — Gate check + version bump (M5.1)

**Status:** ✅

**Depends on:** T9

**What:**
Final gate for M5.1 gaps. From `modules/mycelium-webapp/`:
```bash
yarn build
yarn lint
```

Bump `version` in `package.json`: `0.4.0 → 0.4.1` (PATCH — fixes existing feature, no new user-visible surface beyond what M5 shipped).

Actually, TG-W-04/05/06 add new UI surfaces (webhook URL field, hint text), so this qualifies as MINOR. Bump to `0.5.0`.

**Done when:** Build and lint pass; `package.json` version is `0.5.0`

**Tests:** none
**Gate:** build

---

## Execution Plan (M5.1)

```
T7 → T8 → T9 → T10
```

Sequential: each task touches the i18n files and/or `TelegramIdentitySection.tsx`,
so parallel execution would cause merge conflicts.
