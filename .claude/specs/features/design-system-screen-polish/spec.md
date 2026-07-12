# Feature: Design System — Per-Screen Polish

**Status:** Implemented (S1–S11) — gate passing, pending visual UAT + user approval before commit
**Size:** Medium (bounded, well-understood set of hand-rolled surfaces; no new architecture)
**Version target:** `0.7.0` → `0.7.1` (visual-only follow-up, non-breaking)

## Context

Follow-up to `features/design-system` (foundation + primitives, done). That pass repainted
the shared `ui/` primitives to the "delicate neobrutalism" DS language (`rounded-lg border
border-brand-600`, `shadow-neo`/`shadow-neo-hover`, hover lift) but explicitly left
per-screen hand-rolled surfaces untouched (spec Non-goal).

An audit of the 45 files referencing brand/violet/lime colors found **no leftover raw
`indigo-*` / non-brand `violet-*` / `lime-*` classes** (already clean from the prior pass).
What remains: hand-rolled `border`/`shadow`/`rounded` combos on raw `div`s — inside and
outside `ui/` — that don't use `shadow-neo` or the shared primitives, so they visually
drift from the rest of the app now that primitives have been repainted.

## Requirements

| ID | Requirement | Files |
|---|---|---|
| **S1** | `AppHeader.tsx` debug-looking dashed hover border removed or aligned to DS (no dashed borders in the DS language). | `components/ui/AppHeader.tsx:48` |
| **S2** | `AuthorizedOr.tsx` warning box: solid `border` + `rounded-lg`, drop `border-dashed`. | `components/ui/AuthorizedOr.tsx:5,10` |
| **S3** | `SearchBar.tsx` input/button: consistent `rounded-lg`, `border-brand-600` (or neutral zinc border, no shadow-neo — inputs are not signature containers). | `components/ui/SearchBar.tsx:11-12,97,103` |
| **S4** | `Sidebar.tsx` outer panel stays flat (`border-r`, no radius — it's a full-height rail, not a signature container); active nav-row indicator recolors from `zinc` to `brand-600`/`infra-400`. | `components/ui/Sidebar.tsx:16,75,96,101,144` |
| **S5** | `SideCurtain.tsx` panel: `shadow-xl` → `shadow-neo`; `border-2 border-zinc-300` → `border border-brand-600`; add `rounded-lg` (respecting existing responsive/sm variants). | `components/ui/SideCurtain.tsx:7,55` |
| **S6** | `SuspenseNotification.tsx` status boxes: drop `border-dashed` → solid `border`, add `rounded-lg`. Keep semantic red/green/yellow colors (status, not group accent). | `components/ui/SuspenseNotification.tsx:22,24,25` |
| **S7** | `CreateConnectionStringModal.tsx` inset boxes: add `border border-brand-600` (currently bg-only, no border) to match `MiniBox` language. | `screens/.../CreateConnectionStringModal.tsx:345,387,408` |
| **S8** | `GuestRoleSelector.tsx` dropdown panel: `shadow-lg` → `shadow-neo`; add `rounded-lg border border-brand-600`. | `screens/.../GuestRoleSelector.tsx:215` |
| **S9** | `Discovery/index.tsx` status pills: add `rounded-full` (currently no radius class), keep semantic bg/border colors as-is (status colors, not group accents — no change to hue). | `screens/.../Discovery/index.tsx:242,253,257,263,269,273` |
| **S10** | `BrandCard.tsx` upload dropzone: `border-2 border-dashed` → `border-2 border-dashed border-brand-600` (dashed is acceptable here — it's a drop target affordance, not a static surface) + `rounded-lg`. Logo preview frame gets `rounded-lg`. | `screens/.../BrandCard.tsx:231,269,310` |
| **S11** | `HomePage/index.tsx` feature card: `shadow-md` + plain zinc border → `shadow-neo` + `border-brand-600` (highest-visibility marketing surface). | `screens/HomePage/index.tsx:324-325` |

**S4 note:** verified, no change needed — `Sidebar.tsx`'s active nav-row indicator already uses
`border-brand-violet-500` (DS-aligned via the zero-churn repoint); zinc borders only appear on
non-active utility rows (collapse toggle, language picker), which is correct as-is.

**S6 note:** `SuspenseNotification.tsx`'s outer wrapper `border-dashed` intent classes had no
`border`-width utility, so they never rendered — removed as dead code rather than made visible,
since `Banner` (repainted in the foundation pass) already supplies the real border/shadow chrome;
making the wrapper's border visible too would have produced a double-bordered look.

## Non-goals

- `Onboarding/index.tsx` timeline dot, `Profile/TenantOwnershipInfo.tsx` table-cell border,
  `LicensedResourcesSection.tsx` table radii — low-visibility/structural, not surfaces; skip.
- Extracting a shared `Tabs`/`Badge` primitive for the duplicated tab-nav pattern
  (`Profile/index.tsx`, `Tenants/Details/index.tsx`) or the status badge in
  `LicensedResourcesSection.tsx:426` — flagged as a future refactor, not part of this
  visual-polish pass.
- Renaming `brand-violet-*` → `brand-*` classes (already deferred as optional in the parent
  spec; still out of scope).
- `HomePage` section dividers (`border-t border-zinc-300`) — plain rules, not surfaces.

## Verification

`yarn build` + `yarn lint` must pass (gate-checks rule). Acceptance is visual: `yarn dev`,
eyeball each touched screen in light + dark. Do not commit until the user manually tests
and approves (commit-validation rule).
