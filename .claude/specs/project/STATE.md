# State

## Decisions

- **D1** — SWR keys for RPC use tuple form `["rpc", "method.name", ...params]` instead of URL
  strings. This keeps SWR's deduplication and revalidation working without coupling to REST URLs.
- **D2** — `use-profile.tsx` profile fetch was deferred from M1 (blocked by H2). Resolved in M2:
  H2 fixed by deleting the vestigial Redux profile slice; P10 then migrated to `beginners.profile.get`.
- **D3** — All `rpcCall` / `rpcBatch` wrappers live in `src/services/rpc/<scope>.ts`. No RPC
  logic in components.
- **D4** — Migration is done scope by scope (P1–P9), not file by file. Each phase is
  independently buildable and committable.
- **D5** — M4 resolved by extending `useProfile()` to re-export `logout` and `loginWithRedirect`
  from Auth0. All 11 direct `useAuth0()` call sites now go through `use-profile.tsx`.
  `useAuth0` is imported only in `use-profile.tsx`.
- **D6** — `NativeAuthContext` exports both provider and hook from the same file (standard context
  pattern). The `react-refresh/only-export-components` warning is accepted as a known trade-off.
- **D8** — `NativeAuthContext` persists both token (`myc-native-token`) and user (`myc-native-user`) to `sessionStorage`. User data must survive page reload for any component that guards on `user?.email` (e.g. Onboarding, use-profile). Restore both on mount; clear both on logout.
- **D9** — Homepage is the auth entry point. `/login` remains for backward compatibility but both routes redirect to `/dashboard` after successful auth. `loginWithRedirect()` navigates to `/` (not `/login`).
- **D10** — `brand-lime-*` is excluded from new components. New UI uses `brand-violet-400` for dark mode accents instead. Existing shared components (Button, Typography, Sidebar) still reference `brand-lime-*` and are pending a separate cleanup pass.

- **D7** — `NativeUser.email` is `components["schemas"]["Email"]` = `{ username: string; domain: string }`.
  String rendering uses `${username}@${domain}`. Comparison with `Owner.email` (plain string) converts
  the Email object before matching.

## Blockers

_(none)_

## Lessons

- **L1 — tenantOwner.meta** — The `/_adm/tenant-owner/meta` endpoint is POST not PUT. The correct
  RPC method is `tenantOwner.meta.create` (confirmed from `method_names.rs`). The spec assumed PUT.
- **L2 — GuestRoleSelector scope** — `GuestRoleSelector.tsx` lists guest roles via
  `subscriptionsManager.guestRoles.list`, not `guestManager.guestRoles.list`. The original REST
  endpoint was `/_adm/subscriptions-manager/guest-roles` — scope must match the REST path.
- **L3 — tagsUpdate not in spec** — `tenantManager.ts` required an extra `tagsUpdate` wrapper
  (method `tenantManager.tags.update`) not listed in the original spec. `BrandCard` uses a PUT
  tags endpoint that spec missed.
- **L4 — AccountModal systemScoped branch** — T4 sub-agent reported migrating AccountModal but
  left the `systemScoped` branch on REST (`/_adm/managers/accounts`). Always verify ALL branches
  inside a component, not just the first one found.
- **L5 — empty interface lint error** — `interface Foo extends Omit<Bar, "x"> {}` triggers
  `@typescript-eslint/no-empty-object-type`. Use `type Foo = Omit<Bar, "x">` instead.
- **L6 — onSubmit dead second param** — `SearchBar.onSubmit` type is `(term?: string) => void`.
  Several screens passed a two-param handler. The second param was dead code; removing it fixes
  the `@typescript-eslint/no-unused-vars` lint error cleanly.
- **L7 — @/contexts alias missing** — `tsconfig.app.json` had explicit path mappings for every
  `src/` subfolder but `contexts/` was not included. Adding new top-level dirs under `src/` requires
  adding the alias to `tsconfig.app.json` (Vite's wildcard alias covers runtime but not tsc).
- **L8 — react-router v7** — package is `react-router`, not `react-router-dom`. Import
  `useNavigate` from `"react-router"`.
- **L9 — MyceliumLoginResponse.duration is string** — The spec defined `duration: number` but
  the schema type is `duration: string`. Always use `components["schemas"]["X"]` over hand-rolled
  types to catch gateway contract mismatches early.
- **L10 — NativeAuthContext user lost on reload** — `setAuth` stored the token but not the user.
  On reload, the context restored `token` but set `user: null`. Any effect guarded on `user?.email`
  silently skipped. Fix: persist user to a separate sessionStorage key and restore both on mount.
- **L11 — Redirect guard needs isLoadingUser, not user** — Homepage redirect used
  `isAuthenticated && user` which failed when user was null (pre-L10 fix). Even after the fix,
  the correct guard is `!isLoadingUser && isAuthenticated` — decouple redirect from user object
  presence to handle edge cases where token is valid but user deserialization fails.

## Todos

- [x] Check `tenantOwner.meta.create` vs `tenantOwner.tenant.updateNameAndDescription`
  for the `/_adm/tenant-owner/meta` PUT call — confirmed: `tenantOwner.meta.create` (POST).
- [x] Verify if `AccountModal` POST to `/_adm/subscriptions-manager/accounts` maps to
  `createSubscriptionAccount` or `createRoleAssociatedAccount` — confirmed: `createSubscriptionAccount`.
- [x] Verify `AccountInvitations` second SWR call (`listGuestOnSubscriptionAccount` vs
  `listLicensedAccountsOfEmail`) — confirmed: `listLicensedAccountsOfEmail`.
- [x] Implement M5 — Telegram IdP (spec: `.claude/specs/features/telegram-idp/`) — bot config form for tenant owners + identity panel + unlink in user settings. Gateway endpoints are live; Mini App is a separate standalone submodule.

## Deferred Ideas

- Batch RPC calls on screen load (load multiple resources in one round-trip using `rpcBatch`).
  Deferred until all screens are migrated individually — batching is an optimization pass.

- M3 (Test Coverage) deferred in favor of M4 (Native Auth) — user prioritized auth replacement.

**M5.1 — Telegram IdP gaps** ✅ complete (2026-04-26)
- `TelegramConfigCard`: webhook URL field (read-only + copy button) always visible — admin can copy `${MYCELIUM_API_URL}/auth/telegram/webhook/{tenantId}` to register with BotFather
- `services/telegram/index.ts`: `linkTelegram(initData, getToken)` added — calls `POST /_adm/auth/telegram/link` with `{ initData }` body; ready for Mini App use
- `TelegramIdentitySection`: unlinked state now shows `linkHint` text; `isLinked` guarded by JSON parse — legacy raw-string values no longer show as "Linked"
- `Onboarding`: removed free-text `telegram_user` MetaField (was storing unverified strings that broke `login_via_telegram` lookup); replaced with informational hint; `messagingSet` now only tracks `whatsapp_user`; removed unused `MetaField` component
- i18n: `webhookUrl.{label,copy,copied}` under `TelegramConfig`; `linkHint` under `TelegramIdentity` and onboarding `meta.telegram` — all 3 locales
- Version bumped `0.4.0 → 0.5.0`; `yarn build` + `yarn lint` pass (0 errors)

## Current Focus

**M3 — Test Coverage** ✅ complete (2026-04-18)
- vitest + jsdom configured (`vitest.config.ts`, `src/test/setup.ts`)
- 25 unit tests: RPC client (9), beginners wrappers (4), use-profile hook (12)
- `yarn test` passes; `yarn build` and `yarn lint` clean

**M4 — Native Auth** ✅ complete (2026-04-07)

**Design System — token migration** ✅ complete (2026-04-12)
- DS-W-01 → DS-W-06 (Tailwind brand tokens, font import, CSS vars, Button, Typography, meta tag) — done in prior commit
- All remaining components and screens migrated: 50 files, all bare `indigo-*` → `brand-violet-*`, `violet-*` → `brand-violet-*`, `lime-400/500/600/700` → `brand-lime-*`
- `lime-100` and `lime-900` intentionally preserved (no brand equivalent in palette)
- Gateway templates (DS-G-01 → DS-G-04) remain out of scope for webapp

**Homepage visual polish** ✅ complete (2026-04-13)
- Full-page `fixed` logo background (`bg-cover`): `logo-blackwhite.png` (light, opacity 0.14) / `logo-color.png` (dark, opacity 0.18). Only hero section is transparent; features/footer use `relative z-10` with opaque backgrounds to cover the fixed layer.
- Scroll hint arrow rendered without background wrapper — floats transparently over the hero background.
- Auth form stripped to essentials: label and title text removed, only email input + submit button. Input: `text-2xl py-6`, border-2, `bg-white/90`, `shadow-md` (light) / neon violet glow (dark), `gap-6` spacing to button.
- Brand name (`h1`) and tagline restored above auth form; all `as="small"` → `as="p"` site-wide on homepage for readable sizes.
- Global font size bumped to `18px` in `:root` — all rem-based typography scales proportionally.
- Light mode contrast improved: logo opacity raised, section borders `zinc-300`, features bg `zinc-100`, FeatureCard `shadow-md border-zinc-200`, footer border `zinc-300`.
- New MAG logo assets committed: `logo-color.png`, `logo-blackwhite.png`, `logo-icon-square.png`, `logo-icon.png`, `logo-color-application.png`. Removed obsolete `logo-small.*`, `logo-large.svg`, `pwa-*.png`, `maskable-icon-512x512.png`.

**System theme + design system color pass** ✅ complete (2026-04-13)
- `ThemeProvider.tsx` replaced `useThemeMode()` toggle with OS-preference detection: `matchMedia('(prefers-color-scheme: dark)')` listener sets/removes the `dark` class on `document.documentElement` and passes the resolved mode to `<Flowbite>`. `tailwind.config.js` stays `darkMode: 'class'` (Flowbite requires it).
- `ThemeSwitcher.tsx` deleted. Removed from `AppHeader`, `Sidebar`, and `MobileNavbar` (including the "Theme" settings section in mobile SettingsModal).
- `ThemeContext` simplified: no longer exposes `toggleMode`, only `mode`.
- `gray-*` → `zinc-*` across all 40+ files: neutral palette is now consistently zinc (no stray Tailwind `gray` scale). Affects `Typography`, `Button`, `Modal`, `Card`, `Container`, `Banner`, `IntroSection`, `ListItem`, `SideCurtain`, `SuspenseNotification`, `SearchBar`, `AccountType`, all modal form inputs (Flowbite `theme.field.input.colors.custom`), and all screen files.
- Plain `lime-900` → `brand-lime-700`: fixed 2 remaining occurrences in `CreateConnectionStringModal.tsx` and `LicensedResourcesSection.tsx`.
- `yellow-300` → `brand-lime-400` in `Tenants/index.tsx` (TenantStar hover color).

**Homepage auth step URL persistence** ✅ complete (2026-04-13)
- `step` and `submittedEmail` moved from `useState` to `useSearchParams`. Email submission writes `?step=code&email=...` to the URL; the back button calls `setSearchParams({})` to clear it.
- Page refresh on the code entry step restores the step correctly. `invalidCode` stays in local state (transient error UI).

**Auth + Onboarding flow redesign** ✅ complete (2026-04-13)
- `HomePage` is now a proper landing page with embedded magic-link auth form (email → code). Authenticated users redirect immediately to `/dashboard`; loading state renders null to avoid form flash.
- `LoginPage` still exists at `/login` but redirects to `/dashboard` on success (was `/`).
- `loginWithRedirect` in `use-native-auth.tsx` now points to `/` (homepage) instead of `/login`.
- `NativeAuthContext` now persists `user` to `sessionStorage` (`myc-native-user` key) alongside the token. Previously `user` was lost on page reload, breaking the Onboarding effect guard (`user?.email` was null).
- Dashboard index replaced: `<Profile />` → `<Onboarding />` — a vertical timeline showing account creation (required) and optional meta fields (phone, Telegram, WhatsApp, locale). Steps 2–5 are locked until account exists.
- Removed: `AuthenticatedUser.tsx`, `MyceliumProfile.tsx`, `FlowContainer.tsx` from `screens/HomePage/`.
- Auth0-related naming cleaned up: `parseAuth0Error` → `parseAuthError`, `auth0Logout` → `logout`, `VITE_AUTH0_*` env vars removed from all `.env.*` files.

**M5 — Telegram IdP** ✅ complete (2026-04-20)
- `src/services/telegram/index.ts`: `setTelegramConfig` (POST `/_adm/tenant-owner/telegram/config` with `x-mycelium-tenant-id` header) + `unlinkTelegram` (DELETE `/_adm/auth/telegram/link`)
- `SetTelegramConfigBody` typed locally (TODO: replace when schema is regenerated)
- `TelegramConfigCard.tsx`: password inputs for bot token + webhook secret; tenant-owner-gated via `useProfile({ tenantOwnerNeeded })`; dispatches Redux notifications on save/error; wired as new "Integrations" tab (tab 5) in `Tenants/Details/index.tsx`
- `TelegramIdentitySection.tsx`: linked/not-linked state from `profile.meta["telegram_user"]`; Unlink button calls DELETE then clears session profile cache (`myc-profile`) and reloads
- `IdentitySection.tsx`: wraps `TelegramIdentitySection` + coming-soon cards for WhatsApp, Discord, Slack; wired as "Identity" tab (tab 4) in `Profile/index.tsx`
- i18n: `TelegramConfig.*` + `TelegramIdentity.*` (incl. `comingSoon`) + `tabs.integrations` added to all 3 locales
- Version bumped `0.3.1 → 0.4.0`; `yarn build` + `yarn lint` pass (0 errors)

**Onboarding design system alignment** ✅ complete (2026-04-13)
- Layout changed from `PageBody` (forces `min-h-screen`) to a `max-w-2xl mx-auto` centered column — dashboard no longer occupies full viewport height.
- Added: welcome header with initials avatar (B), progress bar (A), step descriptions (C), completion card when all steps done (D), "Go to dashboard" CTA once account exists (E), locale dropdown replacing free-text input (F).
- Telegram + WhatsApp merged into single "Messaging accounts" step — marked done when either is set.
- All `TextInput` fields use `color="custom"` with brand-violet theme (no raw Flowbite colors).
- `brand-lime-*` removed from all new elements; dark mode accents use `brand-violet-400` (D10).
