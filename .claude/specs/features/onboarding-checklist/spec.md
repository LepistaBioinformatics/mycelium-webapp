# Feature Spec: Authentication & Account Onboarding Checklist

**Status:** Draft — pending user confirmation  
**Scope:** `modules/mycelium-webapp`  
**Complexity:** Medium  

---

## Summary

Redesign the post-login home screen experience as an onboarding checklist. After magic-link login the user lands on the home page and sees a structured list of required and optional setup steps. The login page itself is not changed.

---

## Confirmed Assumptions

- **A1:** Account creation is a **mandatory conditional** step. Use `beginners.profile.get` to check: if it resolves, the user has an account; if it throws, they don't. Step shown only when no account exists. Once created, marked complete and user may navigate to dashboard.
- **A2:** Metadata steps (phone, Telegram, WhatsApp, locale) are **optional** — user can skip them and go to dashboard regardless.

---

## Requirements

### REQ-01 — Login page unchanged
The `LoginPage` at `/login` remains as-is: email input → 6-digit code verification → token stored → redirect to `/`.

### REQ-02 — RPC wrappers: `accountsGet`, `metaCreate`, `metaUpdate`
Add three missing typed wrappers to `src/services/rpc/beginners.ts`:

| Wrapper | RPC Method | Params | Return |
|---|---|---|---|
| `accountsGet` | `beginners.accounts.get` | none | `Account \| null` — called after account creation to populate meta |
| `metaCreate` | `beginners.meta.create` | `{ key: string; value: string }` | `Record<string, string> \| null` |
| `metaUpdate` | `beginners.meta.update` | `{ key: string; value: string }` | `AccountMeta \| null` |

Types must use `components["schemas"]["Account"]` from `mycelium-schema.d.ts`.

### REQ-03 — Onboarding checklist component
Replace the contents of `src/screens/HomePage/MyceliumProfile.tsx` with an onboarding checklist component. The firstName/lastName form is removed. The REST/SWR fetch for profile is removed.

The checklist has two sections:

**Required steps:**
1. **Create your account** — Calls `profileGet({ withUrl: false })` on mount. If it resolves, the user already has an account (step shown as complete, `accountsGet` called to populate meta). If it throws, no account exists: shows "Create account" button. On click, calls `accountsCreate({ name: email })`, then calls `accountsGet` + `profileGet` in parallel to refresh state, then marks step complete.

**Optional steps (each independently togglable):**
2. **Phone number** — key `phone_number` — text input, save via `metaCreate` or `metaUpdate`
3. **Telegram** — key `telegram_user` — text input
4. **WhatsApp** — key `whatsapp_user` — text input
5. **Locale** — key `locale` — text input (e.g., `en`, `pt-BR`)

Each optional step reads current value from `Account.meta` (populated after account creation) and pre-fills the form if already set. Uses `metaCreate` when the key doesn't exist yet, `metaUpdate` when it does.

### REQ-04 — Navigate to dashboard
A "Go to dashboard" button is always visible once the mandatory account step is complete. Optional steps do not block navigation.

### REQ-05 — Replace REST fetch with RPC
Remove `useSWR(buildPath("/_adm/beginners/profile"), ...)` from `MyceliumProfile.tsx`. All data fetching goes through the typed RPC wrappers.

### REQ-06 — i18n
Add all new user-visible strings to all three locale files:
- `src/i18n/en/translations.json`
- `src/i18n/pt-br/translations.json`
- `src/i18n/es/translations.json`

Under key path `screens.HomePage.OnboardingChecklist.*`.

---

## Out of scope

- Changes to the login page
- Changes to the dashboard or its children
- Collecting firstName/lastName (removed)
- `beginners.meta.delete` (not requested)

---

## Acceptance criteria

- [ ] After login, home page shows the checklist (not the old name form)
- [ ] If user has no account: "Create account" step is shown as required
- [ ] If user already has an account: step shows as complete on load
- [ ] Creating an account calls `accountsCreate` → `accountsGet` + `profileGet`
- [ ] Optional metadata steps are pre-filled from `Account.meta` when available
- [ ] "Go to dashboard" navigates to `/dashboard`
- [ ] No REST fetch in the home page flow — all via RPC
- [ ] All new strings in all 3 locale files
- [ ] `yarn build` and `yarn lint` pass
