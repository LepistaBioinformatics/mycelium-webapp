# Feature Spec: Native Auth (Replace Auth0)

**Milestone:** M4 — Native Auth
**Scope:** Webapp (React/TypeScript)
**Status:** Specified
**Depends on:** Gateway feature `magic-link-auth` (GT0–GT7 complete)

---

## Context

The webapp currently uses `@auth0/auth0-react` as its sole identity mechanism:
- `Auth0Provider` wraps the entire app in `main.tsx`
- `useAuth0()` provides `user`, `isAuthenticated`, `getAccessTokenSilently`, `loginWithRedirect`,
  `logout`, `getAccessTokenWithPopup`
- `use-profile.tsx` wraps `useAuth0()` and is the single point of auth consumption (D5)
- The login button in `HomePage` calls `getAccessTokenWithPopup`

The gateway exposes three new public endpoints (from `magic-link-auth`):
- `POST /_adm/beginners/users/magic-link/request { email }` → `{ sent: true }`
- `GET /_adm/beginners/users/magic-link/display?token&email` → HTML page with 6-digit code
- `POST /_adm/beginners/users/magic-link/verify { email, code }` → `{ token, duration, ...user }`

The JWT returned by `verify` is a standard Bearer token (`iss: "mycelium"`, HS512)
accepted by all gateway endpoints.

Auth0 remains as an optional external identity provider at the gateway level, but the
webapp removes all `@auth0/auth0-react` dependency.

---

## Requirements

### NA-001 — Native auth service layer

Two typed REST functions (not RPC — these are unauthenticated flows):

```typescript
// src/services/auth/magic-link.ts
requestMagicLink(email: string): Promise<void>
verifyMagicLink(email: string, code: string): Promise<NativeLoginResponse>
```

`NativeLoginResponse`:
```typescript
{
  token: string;
  duration: number;    // seconds
  totpRequired: boolean;
  // User fields (id, email, firstName, lastName, etc.)
}
```

Both call the gateway directly with `fetch` (no Auth header needed).
`requestMagicLink` throws on non-2xx. `verifyMagicLink` throws on 401 (invalid code).

### NA-002 — Native auth context

`src/contexts/NativeAuthContext.tsx` — React context that manages JWT lifecycle:

**State:**
```typescript
{
  token: string | null;
  user: NativeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

**On mount:** Read JWT from `sessionStorage("myc-native-token")`. If present and not expired
(decode exp claim), restore state. Otherwise start unauthenticated.

**`setAuth(token, user)`** — called after successful `verifyMagicLink`:
- Store JWT in React state
- `sessionStorage.setItem("myc-native-token", token)`

**`clearAuth()`** — logout:
- Clear React state
- `sessionStorage.removeItem("myc-native-token")`

**`getToken()`** — returns stored JWT or throws if not authenticated.

Export `NativeAuthProvider` (wraps context) and `useNativeAuthContext` hook.

### NA-003 — `useNativeAuth` hook

`src/hooks/use-native-auth.tsx` — drop-in replacement for `useAuth0()` surface used by
`use-profile.tsx`:

```typescript
export default function useNativeAuth() {
  return {
    user,                    // NativeUser | null
    isAuthenticated,         // boolean
    isLoading,               // boolean (true while restoring from sessionStorage)
    getAccessTokenSilently,  // () => Promise<string> — returns stored JWT
    loginWithRedirect,       // () => void — navigates to /login
    logout,                  // (opts?) => void — clearAuth() + navigate('/')
    error,                   // Error | null
  };
}
```

`getAccessTokenSilently` returns the stored token synchronously (wrapped in Promise).
It does NOT call Auth0 or any external service.

### NA-004 — Login screen

`src/screens/LoginPage/index.tsx` — two-step UI:

**Step 1 — Email input:**
- Single `<input type="email">` + submit button
- On submit: call `requestMagicLink(email)` → transition to Step 2
- Error state: show message if request fails

**Step 2 — Code input ("Check your email"):**
- Instruction text: "We sent a link to {email}. Open it to get your 6-digit code."
- Single `<input type="text" maxLength={6} pattern="[0-9]{6}">` + submit button
- On submit: call `verifyMagicLink(email, code)`
  - On success: `setAuth(token, user)` + `navigate('/')`
  - On error (401): show "Invalid or expired code" + allow retry
- "Back" link to return to Step 1

All strings via `useTranslation()`. Keys added to all 3 locale files.

### NA-005 — `main.tsx` migration

Remove `Auth0Provider` and all `VITE_AUTH0_*` references.
Add `NativeAuthProvider` in the same nesting position.

Before:
```tsx
<Auth0Provider domain={DOMAIN} clientId={CLIENT_ID} authorizationParams={{...}}>
  <App />
</Auth0Provider>
```

After:
```tsx
<NativeAuthProvider>
  <App />
</NativeAuthProvider>
```

Remove `@auth0/auth0-react` from `package.json` after confirming zero remaining imports.

### NA-006 — `use-profile.tsx` migration

Replace `useAuth0()` with `useNativeAuth()`. The returned interface is compatible:
- `user` → `NativeUser | null` (same fields used: `email`, `given_name`, `family_name`)
- `isAuthenticated`, `isLoading` → identical
- `getAccessTokenSilently` → returns stored JWT
- `loginWithRedirect` → navigates to `/login`
- `logout` → clears auth + navigates to `/`
- `error` → passed to `parseAuth0Error` (rename to `parseAuthError` or keep as-is)

No logic changes to `use-profile.tsx` — only the import and hook call change.

### NA-007 — Route additions

`src/constants/routes.tsx` — add:
- `/login` → `<LoginPage />`

`src/App.tsx` or router config — register the route outside the protected `<Route>` wrapper
so unauthenticated users can reach it.

### NA-008 — `HomePage` login button

`src/screens/HomePage/index.tsx` — replace:
```tsx
<Button onClick={getAccessTokenWithPopup}>
```
With:
```tsx
<Button onClick={() => navigate('/login')}>
```

Remove `getAccessTokenWithPopup` from the `useProfile()` destructure.

---

## Token storage design

| Store | What | Why |
|---|---|---|
| React state | Current token + user | Zero-latency reads; cleared on tab close |
| `sessionStorage` | JWT string | Survives page reload within tab; auto-cleared on tab close |

**On page reload:** `NativeAuthProvider` reads `sessionStorage` on mount, restores state.
If JWT is expired (check `exp` claim), removes it and starts unauthenticated.

**Security note:** `sessionStorage` is accessible to JS in the same origin — same XSS
exposure as Auth0's in-memory token. The existing session profile cache uses the same store.

---

## What Auth0 provides today vs. replacement

| Auth0 feature | Replacement |
|---|---|
| `getAccessTokenSilently` | Return stored JWT from context |
| `loginWithRedirect` | `navigate('/login')` |
| `logout` | `clearAuth()` + `navigate('/')` |
| `user.email` | From JWT claims or `NativeLoginResponse` user fields |
| `isAuthenticated` | `token !== null && !isExpired(token)` |
| `isLoading` | `true` during `sessionStorage` restore on mount |
| Token refresh | Not needed — magic link re-login when JWT expires |

---

## NativeUser type

```typescript
// src/types/NativeAuth.ts
export interface NativeUser {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  // add fields as returned by MyceliumLoginResponse
}

export interface NativeLoginResponse {
  token: string;
  duration: number;
  totpRequired: boolean;
  // spread User fields
}
```

Use `unknown` + type guard for the raw response, then cast to `NativeLoginResponse`.

---

## Out of scope

- TOTP UI (gateway always returns `totpRequired: false` for magic link)
- Registration screen (gateway auto-creates User on first `verify_magic_link`)
- Password reset UI (no password in this flow)
- Auth0 external provider UI (Auth0 remains available at gateway level for API access)
- Token refresh / silent renew (user re-authenticates via magic link when JWT expires)
