# 004 — Account lists show nothing until a type filter is picked

**Type:** bug fix (quick mode)

## Symptom

`/dashboard/accounts` (and a namespace's accounts) list nothing until an account type is chosen
in FILTERS. Expected: without a filter, every account type the screen allows is listed.

## Cause

Without a filter the screen batches one `subscriptionsManager.accounts.list` call per allowed
type and merges them (`accountsListMerged`). A type with no accounts answers `result: null`
(`FetchManyResponseKind::NotFound`); the merge read `null.records`, threw `TypeError`, and the
whole list failed. The `actorAssociated` type was also batched without an actor name, which the
gateway always rejects (`-32602 actor required`).

The gateway itself requires one type per call, and its privilege checks depend on the type
(user accounts need admin; tenant types need ownership or tenant-manager). Merging per type in
the webapp keeps those checks; making the type optional in the gateway was not done.

## Fix

- `accountsListMerged` skips `null` pages (`services/rpc/subscriptionsManager.ts`).
- Without a type filter, `actorAssociated` is left out of the default set; it is listed when
  the search names an actor (`/actorAssociated <actor>`).

## Known limitation (unchanged)

The merged list is paginated per type and then sliced client-side, so `count` and page
boundaries are best-effort, not a true global pagination. A gateway "all types" listing would
be needed for exact pagination.

## Verification

- New `subscriptionsManager.test.ts`: fails before the fix (`TypeError: Cannot read
  properties of null`), passes after.
- `yarn build`, `yarn lint`, `yarn test` (73).
