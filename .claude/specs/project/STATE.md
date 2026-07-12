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

- **D11** — Adopted the Lepista Lab design system (v1.0.0). The webapp is the `infra` group →
  accent is cyan (`infra-400 #64C5EB`); lab brand is violet (`brand-400 #9260c4`). Zero-churn
  color swap: `tailwind.config.js` `brand.violet.*` repointed to DS violet hexes, so the 264
  existing `brand-violet-*` usages adopt the new palette with no per-file edits; DS-canonical
  flat scales (`brand`, `infra`, `saas`, `science`, `status`) added alongside. Fonts switched
  to Bricolage Grotesque / Hanken Grotesk / Space Mono. Neobrutalism (`shadow-neo`, `rounded-lg`,
  `border-brand-600`, hover lift) applied to shared `ui/` primitives only (foundation pass);
  per-screen polish is a follow-up. The old `.claude/rules/design-system.md` "sharp corners"
  mandate was rewritten to the DS conventions. Removed unused `brand.lime`/`brand.sky` Tailwind
  keys (0 class usages; supersedes the lime note in D10). Spec: `features/design-system/`.

- **D12** — Corrected D11 after user feedback (2026-07-11): `shadow-neo` (hard cyan offset
  shadow) is **marketing-only** — kept solely on `HomePage`'s `FeatureCard`. Repeated across
  the dense dashboard it read as heavy/noisy, so `Card`, `Section`, `Modal`, `SideCurtain`,
  dropdown panels, and `Button` were switched to a subtle `shadow-sm dark:shadow-none`, with
  no hover-lift translate. Also fixed background mismatches introduced by the DS passes:
  `CreateConnectionStringModal` inset boxes now match `MiniBox` (border only, no distinct
  fill, instead of a stray `bg-zinc-100/800`); `GuestRoleSelector`'s selected-role chip,
  edit-mode input, and dropdown row now use `brand-*` family colors in dark mode instead of
  plain `zinc-600/700/800`. Rule file updated accordingly.

- **D13** — Second round of user feedback (2026-07-11): the *general* dashboard background was
  still the pre-DS `dark:bg-zinc-900` (found at the very top: `App.tsx`'s `#App` root div),
  and tables/list rows used raw `zinc-*`/Flowbite-default `gray-*` fills that clashed with the
  now-`brand-950` cards floating on top of them. Fixed the whole dark surface hierarchy to the
  `brand-*` scale: `App.tsx` root, `Sidebar`, `MobileNavbar` (+ its settings-modal language
  box) → `dark:bg-brand-950`/`dark:border-brand-900`. `LicensedResourcesSection` and
  `TenantOwnershipSection`'s Flowbite `<Table>` themes, `ListConnectionStringsSection`'s
  (previously un-themed, using Flowbite's raw `gray-700/800` defaults), and `TenantOwnershipInfo`'s
  row override → header `dark:bg-brand-900`, base row `dark:bg-brand-950`, hover/alt tier
  `dark:bg-brand-900`. `ListItem.tsx` (shared primitive, used by `Tenants`, `GuestRoles`,
  `OwnersCard`, `WebHooks`, `AccountInvitations`, `GuestsByEmail`) → border `brand-600`,
  stripe `dark:bg-brand-950`/`dark:bg-brand-900`. Convention documented in the rule file:
  base/nested/hover tiers map to `brand-950`/`brand-900`/`brand-800`.

- **D14** — Third round of user feedback, scoped to `/dashboard/profile?tab=3` (2026-07-11):
  the "Create global connection string" box (`Profile/index.tsx`'s `AdvancedOptions` tab) and
  "search boxes" still showed old colors. Root causes: `SearchBar.tsx`'s input
  (`dark:bg-zinc-900`) and its command-palette dropdown (`dark:bg-zinc-800`, raw `shadow-lg`,
  `border-zinc-300/500`) were missed in the D12/D13 passes; `CreateConnectionStringModal`'s
  `TextInput`/`Select` fields had **no** `color="custom"` override at all, so they silently
  inherited Flowbite's raw `gray-50/700` defaults (a 4th stray neutral scale). Fixed both to
  the `brand-*` convention (`INPUT_COLORS`/`INPUT_THEME`/`SELECT_THEME` constants added to
  the modal file); also fixed `Banner.tsx`'s dead base fallback (`dark:bg-zinc-800`, never
  visible since `intent` always overrides it, but same stale pattern).
- **D15** — User flagged that `/dashboard/tenants/<id>` and `/dashboard/profile` had
  inconsistent box structure: profile wraps header + tab-nav + tab-content in a single
  `<Section>`; tenant details closed `</Section>` right after the header, leaving the
  tab-nav/tab-content as a bare, unstyled sibling `<div>`. Restructured
  `Tenants/Details/index.tsx` to match `Profile/index.tsx`'s pattern exactly: the
  `{activeTenant && (...)}` nav+content block now lives inside the same `Section.Body` as the
  "manage accounts" link, so both screens render as one boxed `Section`.
  **Superseded by D17** — the user later asked for the opposite split (header boxed, tabs not).
- **D16** — On `/dashboard/tenants/<id>?tab=4`, the "Create subscription manager account"
  Banner used `intent="warning"` (yellow) — changed to `intent="info"` (it's a routine account
  creation, not a risky action). Left the sibling "Create connection string" Banners (both in
  `Tenants/Details/index.tsx` and `Profile/index.tsx`) as `warning` — connection strings grant
  broad/full account access, so a warning tone is deliberate there.
- **D17** — User corrected D15's direction: main info (identity header) should be in a bordered
  `<Section>`, and the tab-nav + tab-content should sit in a separate, unbordered `<div>` below
  it — not all one big box. Applied to both `Profile/index.tsx` and
  `Tenants/Details/index.tsx`: `<Section>` now closes right after `Section.Header` (+ the
  "manage accounts" link for tenants, kept inside as it's identity-adjacent CTA, not a tab);
  the nav+content block is a plain sibling `<div>` with no border.
- **D18** — Removed the `screens.Dashboard.Profile.relationship` heading ("Manage your
  account") from `Profile/index.tsx` per user request — tabs now render directly below the
  header box, matching `Tenants/Details/index.tsx` (which never had this heading). Deleted the
  now-unused i18n key from all 3 locales.
- **D19** — Profile screen showed only email, no name, for magic-link users whose auth-token
  `user` object has blank `firstName`/`lastName` (native-auth login response reflects the
  `User` record at a point in time, not the always-current one). `Profile/index.tsx` now
  prefers `profile.owners` (principal owner, kept in sync via account/profile management) for
  display name, falling back to `useNativeAuth()`'s `user` only if no owner record exists —
  mirrors the pattern already used for `principalOwner` lookups elsewhere (e.g. the
  `agroportal-customers` reference implementation).
- **D20** — Found and fixed a real bug while investigating a "fallback screen on every
  refresh" report: `App.tsx` lazy-loads `Onboarding` (`lazy(() => import(...))`) for the
  `/dashboard` index route but had **no** `<Suspense>` boundary anywhere in the app — every
  `React.lazy` component requires one, or the suspend throws uncaught. Wrapped the route
  element in `<Suspense fallback={<HorizontalLoadingBar isLoading />}>`.
- **D21** — Added a "decoded connection string" viewer to `CreateConnectionStringModal.tsx`,
  requested via a reference implementation
  (`Biotrop/agroportal-customers` `page.tsx`). The gateway's connection-string format is
  confirmed from source (`core/src/domain/dtos/token/connection_string/connection_string_beans.rs`,
  `user_account_connection_string.rs`): standard-base64 (not URL-safe) of
  `key=value;key=value;...` beans (`tid`/`aid`/`sid`/`rls`/`edt`/`kvr`/`sig`). Added
  `decodeConnectionString()` (plain `atob`, no URL-safe replace needed) + a collapsible
  `DetailsBox` showing `tenant`/`account`/`serviceAccount`/`roles`/`expiresAt` with friendly
  labels; `sig`/`kvr` are internal HMAC integrity metadata, intentionally omitted as noise.
  The RPC layer (`tokensCreate`) already supported `tenantId`/`serviceAccountId`/`roles` — the
  gap was purely a UI transparency one (showing the user what scope they actually got), not a
  missing API capability.
- Version bumped `0.7.3 → 0.8.0` (MINOR — new user-visible decoded-scope feature). `yarn build`
  + `yarn lint` pass (0 errors). Still pending: user's visual re-check before commit.
- **D22** — Swept every `TextInput`/`Select`/raw `<select>`/`<input>` in the app for the same
  stale-input-theme bug found earlier: 15 occurrences across 8 files
  (`AccountModal`, `GuestToAccountModal`, `EditMetadataModal`, `TenantModal`, `WebhookModal`,
  `GuestRolesModal`, `Onboarding`, `GuestOwnerModal`) still had the pre-D14 theme
  (`border-zinc-400 ... dark:bg-zinc-700 ... focus:border-cyan-500`, or a `brand-violet`
  focus variant) — copy-pasted before the `brand-*` convention existed, so my earlier
  per-file fixes (D14) only reached 3 files. Replaced all 15 with the canonical
  `INPUT_COLORS` string. Also found and added `color="custom"` to 3 `<Select>`s that had
  **no** override at all (`GuestRolesModal` permission select, `WebhookModal` trigger +
  secret selects) — they were silently on Flowbite's raw `gray-50/700` defaults.
- **D23** — Broader `bg-zinc-*` audit (user request, using `DetailsBox.tsx` as the seed
  example): found nested surfaces whose dark fill didn't match their brand-950 parent
  container — `DetailsBox` summary hover, `WebHooks`/`Onboarding` inset boxes,
  `IdentitySection`'s "coming soon" chip, `LegalSettings`' raw `<select>`, `GuestRoleSelector`'s
  edit-mode search input, `SideCurtain`'s sticky inner header, `Onboarding`'s avatar circle and
  "current step" timeline dot → all moved to `dark:bg-brand-900`/`brand-950` per the tiered
  convention. Left as-is (reviewed, not bugs): `HomePage` (self-consistent all-zinc marketing
  theme, D11 exception), `Sidebar`/`SignOutButton` utility-row hovers (intentionally neutral,
  not "active" indicators), `Button`'s `secondary` intent (deliberately grey, not violet),
  `Discovery`'s JSON-preview boxes (JSONPretty's monokai theme expects a neutral dark bg —
  tinting would fight its syntax-highlight contrast), progress-bar tracks (`SuspenseNotification`,
  `Onboarding`), and `Onboarding`'s pending/disabled timeline dots (grey there is semantic:
  "not yet reached", not a leftover color). `ui/Container.tsx` has a `bg-zinc-800` "highlight"
  variant too but the component has zero usages app-wide (dead code) — left untouched.
- **D24** — User reversed the `HomePage` exception from D11/D23: since it's the marketing
  landing page, it should actually *adopt* the full DS treatment (the bold neobrutalism +
  `shadow-neo` that's too heavy for the dashboard is exactly right here), not stay on its old
  pre-DS zinc palette. Converted: root + footer `dark:bg-zinc-950` → `dark:bg-brand-950`;
  features section `dark:bg-zinc-900` → `dark:bg-brand-900` (one tier lighter, for visual
  rhythm against the hero); section/footer borders `border-zinc-300 dark:border-zinc-800` →
  `border-brand-600`. Email/code hero inputs: added `rounded-lg`, border `zinc-400/600` →
  `border-brand-600`, and replaced the ad-hoc violet glow shadow
  (`shadow-[0_0_24px_4px_rgba(139,92,246,...)]`) with the canonical `shadow-neo`/
  `shadow-neo-hover` (cyan accent, not violet — DS reserves violet for identity/border, cyan
  for the signature shadow). Both CTA buttons converted from a generic violet-fill glow button
  to the actual DS primary button recipe: `rounded-lg border border-brand-600 bg-brand-800
  font-mono uppercase tracking-wide shadow-neo hover:shadow-neo-hover` + hover lift — mirrors
  `Button.tsx`'s pre-D12 primary intent, which is correct again specifically *because* this is
  marketing, not dashboard. `FeatureCard` (already `shadow-neo` from the D11 foundation pass)
  and `LoginPage` (checked — has no stale zinc/shadow patterns, out of scope) needed no change.
- Version bumped `0.8.1 → 0.8.2`. `yarn build` + `yarn lint` pass (0 errors). Still pending:
  user's visual re-check before commit.
- Version bumped `0.8.0 → 0.8.1`. `yarn build` + `yarn lint` pass (0 errors). Still pending:
  user's visual re-check before commit.

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

**Design System — dashboard shell + table/list-row backgrounds (D13)** ✅ complete, gate passing
- Second round of user feedback: general dashboard background still the pre-DS
  `dark:bg-zinc-900` (traced to `App.tsx`'s `#App` root div — the outermost wrapper, not any
  `ui/` primitive); tables and list rows used raw `zinc-*`/Flowbite-default `gray-*` fills.
- Fixed the whole dark surface hierarchy to `brand-*`: `App.tsx`, `Sidebar`, `MobileNavbar`
  (root + settings-modal language box); `LicensedResourcesSection`, `TenantOwnershipSection`,
  `ListConnectionStringsSection` (was un-themed, inheriting Flowbite's raw `gray-700/800`),
  `TenantOwnershipInfo` table row; `ListItem.tsx` (shared primitive — cascades to `Tenants`,
  `GuestRoles`, `OwnersCard`, `WebHooks`, `AccountInvitations`, `GuestsByEmail`).
- Version bumped `0.7.1 → 0.7.2`. Convention now in the rule file: base/nested/hover dark
  tiers map to `brand-950`/`brand-900`/`brand-800`. `yarn build` + `yarn lint` pass (0 errors).
  Still pending: user's visual re-check before commit.

**Design System — shadow + background correction (D12)** ✅ complete, gate passing
- User feedback after visual testing: `shadow-neo` too heavy in the dashboard, good only on
  landing/home; several backgrounds still didn't follow the DS.
- Reverted `shadow-neo`/hover-lift on `Button`, `Card`, `Section`, `Modal`, `SideCurtain`, and
  the `GuestRoleSelector` dropdown to `shadow-sm dark:shadow-none` (no translate). Kept
  `shadow-neo` only on `HomePage`'s `FeatureCard`.
- Fixed background drift: `CreateConnectionStringModal` inset boxes now match `MiniBox`
  (border only, no fill); `GuestRoleSelector` chip/input/dropdown-row now use `brand-*`
  dark-mode colors instead of plain `zinc-600/700/800`.
- `.claude/rules/design-system.md` updated with the corrected shadow guidance (marketing vs
  dashboard). `yarn build` + `yarn lint` pass (0 errors). Still pending: user's visual re-check.

**Design System — per-screen polish (S1–S11)** ✅ complete, gate passing
- Follow-up to the foundation pass. Audited the 45 files referencing brand/violet/lime
  colors — found no leftover raw `indigo-*`/non-brand `violet-*`/`lime-*` classes (already
  clean). Fixed 9 hand-rolled surfaces that drifted from the repainted primitives:
  `AppHeader` hover affordance, `AuthorizedOr` warning box, `SearchBar` input radius/border,
  `SideCurtain` slide-in panel, `CreateConnectionStringModal` inset boxes, `GuestRoleSelector`
  dropdown panel, `Discovery` method pills (added `rounded-full`), `BrandCard` dropzone/logo
  frame, `HomePage` feature card.
- `Sidebar.tsx` (S4) needed no change — active indicator was already brand-tinted.
- `SuspenseNotification.tsx` (S6) had dead `border-dashed` intent classes (no border-width
  utility, so never rendered) — removed rather than made visible, since `Banner` already
  supplies the real chrome; avoided a double-border look.
- Version bumped `0.7.0 → 0.7.1`. `yarn build` + `yarn lint` pass (0 errors).
- Spec: `features/design-system-screen-polish/`.
- **Pending:** visual QA (light + dark) + user approval — do not commit until tested
  (commit-validation rule). `yarn dev` is running.

**Design System — foundation + primitives (T1–T10)** ✅ complete, gate passing
- Continued from D11: finished the remaining primitives — `Section.tsx` (rounded-lg border
  border-brand-600 shadow-neo bg surface, matching Card) and `DetailsBox.tsx` (rounded-lg
  border border-brand-600). `ListItem.tsx` required no change — already flat with no shadow,
  satisfying R8 as-is.
- `yarn build` and `yarn lint` both pass (0 errors; remaining lint warnings are pre-existing
  and unrelated to this change).
- **Pending:** T11 visual QA (light + dark, Home/Dashboard/modal/form) and user approval —
  per `.claude/rules/commit-validation.md`, do not commit until the user has manually tested
  and approved.

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
