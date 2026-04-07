# Tasks: Native Auth (Webapp)

Legend: ⬜ not started · 🔄 in progress · ✅ done · 🔴 blocked

**Blocked by:** Gateway tasks GT0–GT7 (magic-link-auth spec)

---

## T0 — Types + auth service layer

**Status:** ⬜

**What:**
1. Create `src/types/NativeAuth.ts`:
   ```typescript
   export interface NativeUser {
     id?: string;
     email: string;
     firstName?: string;
     lastName?: string;
   }
   export interface NativeLoginResponse {
     token: string;
     duration: number;
     totpRequired: boolean;
     email: string;
     firstName?: string;
     lastName?: string;
   }
   ```
2. Create `src/services/auth/magic-link.ts`:
   ```typescript
   export async function requestMagicLink(email: string): Promise<void>
   export async function verifyMagicLink(email: string, code: string): Promise<NativeLoginResponse>
   ```
   - `requestMagicLink`: `POST /_adm/beginners/users/magic-link/request { email }`
     Throws if response is not 2xx.
   - `verifyMagicLink`: `POST /_adm/beginners/users/magic-link/verify { email, code }`
     Returns parsed `NativeLoginResponse`. Throws on 401 (`InvalidCodeError`).

**Spec:** NA-001

**Done when:** TypeScript compiles; no `any` types

---

## T1 — `NativeAuthContext`

**Status:** ⬜

**Depends on:** T0

**What:**
Create `src/contexts/NativeAuthContext.tsx`:

```typescript
interface NativeAuthState {
  token: string | null;
  user: NativeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface NativeAuthContextValue extends NativeAuthState {
  setAuth: (token: string, user: NativeUser) => void;
  clearAuth: () => void;
  getToken: () => Promise<string>;
}
```

Implementation:
- On mount: read `sessionStorage.getItem("myc-native-token")`
  - If present: decode exp claim (base64 decode the JWT payload), check `exp > Date.now()/1000`
  - If valid: `setState({ token, isAuthenticated: true, isLoading: false })`
  - If expired/absent: `setState({ isLoading: false })`
- `setAuth`: update state + `sessionStorage.setItem("myc-native-token", token)`
- `clearAuth`: update state + `sessionStorage.removeItem("myc-native-token")`
- `getToken`: returns `Promise.resolve(token)` if present, rejects otherwise

Export `NativeAuthProvider` and `useNativeAuthContext`.

**Spec:** NA-002

**Done when:** `yarn build` passes

---

## T2 — `useNativeAuth` hook

**Status:** ⬜

**Depends on:** T1

**What:**
Create `src/hooks/use-native-auth.tsx`:

```typescript
export default function useNativeAuth() {
  const { token, user, isAuthenticated, isLoading, clearAuth, getToken } =
    useNativeAuthContext();
  const navigate = useNavigate();

  const getAccessTokenSilently = useCallback(() => getToken(), [getToken]);

  const loginWithRedirect = useCallback(
    () => navigate('/login'),
    [navigate]
  );

  const logout = useCallback(() => {
    clearAuth();
    navigate('/');
  }, [clearAuth, navigate]);

  return {
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    loginWithRedirect,
    logout,
    error: null,
  };
}
```

**Spec:** NA-003

**Done when:** `yarn build` passes; interface matches what `use-profile.tsx` expects

---

## T3 — Login screen

**Status:** ⬜

**Depends on:** T0, T1

**What:**
Create `src/screens/LoginPage/index.tsx` with two steps:

**Step 1 (email):**
- `react-hook-form` with `{ email: string }`
- Submit → `requestMagicLink(email)` → transition to Step 2
- Error dispatch on failure (use existing notification pattern)

**Step 2 (code):**
- `react-hook-form` with `{ code: string }`
- `<TextInput maxLength={6} pattern="[0-9]{6}" inputMode="numeric">`
- Submit → `verifyMagicLink(email, code)`:
  - Success: `setAuth(res.token, { email: res.email, firstName: res.firstName, lastName: res.lastName })`
    + `navigate('/')`
  - 401 error: show "Invalid or expired code" inline (not a full notification)
- "Back" button: reset to Step 1

Use existing UI components (`Button`, `FormField`, `TextInput`, `Typography`).
All strings via `useTranslation()`.

Add i18n keys to `src/i18n/{en,ptBr,es}/translations.json`:
```json
"screens.LoginPage.emailStep.title": "...",
"screens.LoginPage.emailStep.label": "...",
"screens.LoginPage.emailStep.submit": "...",
"screens.LoginPage.codeStep.title": "...",
"screens.LoginPage.codeStep.instruction": "...",
"screens.LoginPage.codeStep.label": "...",
"screens.LoginPage.codeStep.submit": "...",
"screens.LoginPage.codeStep.invalidCode": "...",
"screens.LoginPage.codeStep.back": "..."
```

**Spec:** NA-004

**Done when:** `yarn build` passes, `yarn lint` passes

---

## T4 — Route registration

**Status:** ⬜

**Depends on:** T3

**What:**
`src/constants/routes.tsx` — add `/login` route pointing to `<LoginPage />`.

`src/App.tsx` — add:
```tsx
<Route path="/login" element={<LoginPage />} />
```
Outside the authenticated `DASHBOARD_ROUTE` subtree so unauthenticated users can reach it.

**Spec:** NA-007

**Done when:** `yarn build` passes; navigating to `/login` renders the login screen

---

## T5 — `use-profile.tsx` migration

**Status:** ⬜

**Depends on:** T2

**What:**
`src/hooks/use-profile.tsx`:

1. Replace `import { useAuth0 } from "@auth0/auth0-react"` with
   `import useNativeAuth from "@/hooks/use-native-auth"`
2. Replace `useAuth0()` call with `useNativeAuth()`
3. The destructured fields (`user`, `isAuthenticated`, `isLoadingUser`, `getAccessTokenSilently`,
   `logout`, `loginWithRedirect`, `error`) are the same — no further changes

**Spec:** NA-006

**Done when:** `yarn build` passes; no remaining `@auth0/auth0-react` imports in `use-profile.tsx`

---

## T6 — `main.tsx` migration + package cleanup

**Status:** ⬜

**Depends on:** T1, T5

**What:**
1. `src/main.tsx`:
   - Remove `Auth0Provider` import and usage
   - Remove `CLIENT_ID`, `DOMAIN`, `AUDIENCE`, `SCOPE` constants
   - Add `import { NativeAuthProvider } from "@/contexts/NativeAuthContext"`
   - Replace `<Auth0Provider ...><App /></Auth0Provider>` with `<NativeAuthProvider><App /></NativeAuthProvider>`

2. Verify zero remaining `@auth0/auth0-react` imports:
   ```bash
   grep -r "@auth0/auth0-react" src/
   ```
   Must return empty.

3. `package.json` — remove `@auth0/auth0-react` dependency.
   Run `yarn install` to update `yarn.lock`.

4. Remove `VITE_AUTH0_*` variables from `.env.example` (if it exists).

**Spec:** NA-005

**Done when:** `yarn build` passes, no Auth0 imports remain

---

## T7 — `HomePage` update

**Status:** ⬜

**Depends on:** T5

**What:**
`src/screens/HomePage/index.tsx`:

1. Remove `getAccessTokenWithPopup` from `useProfile()` destructure
2. Add `const navigate = useNavigate()`
3. Replace:
   ```tsx
   <Button onClick={getAccessTokenWithPopup} ...>
   ```
   With:
   ```tsx
   <Button onClick={() => navigate('/login')} ...>
   ```

**Spec:** NA-008

**Done when:** `yarn build` passes, `yarn lint` passes

---

## T8 — Final gate check

**Status:** ⬜

**Depends on:** T4, T6, T7

**What:**
From `modules/mycelium-webapp/`:
```bash
yarn build   # includes tsc
yarn lint
```

Both must pass with zero errors.

Verify manually:
- `/login` renders email step
- After entering email, shows code step
- After entering valid code, navigates to `/`
- Refreshing the page while authenticated stays authenticated (sessionStorage restore)
- Logout clears auth and returns to `/`
