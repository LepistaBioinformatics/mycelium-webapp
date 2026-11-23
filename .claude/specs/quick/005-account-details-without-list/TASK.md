# 005 — Opening account details fetched the account list needlessly

**Type:** fix (quick mode)

## Symptom

Opening an account's details (a link with `?accountId=`, e.g. from Profile → Shared with me)
lands on an accounts screen; besides the details, the account list behind the side curtain was
fetched — several times.

## Measured (Cypress, stubbed gateway)

| Flow | `subscriptionsManager.accounts.list` calls before | after |
|---|---|---|
| Direct link to details | 4 | 0 |
| Open details from the list | 4 on load, +0 on click | 1 on load, +0 on click |

## Causes and fixes

- `PaginatedAccounts` called `mutateAccounts(accounts)` on every new `accounts` value inside a
  namespace (a revalidating mutate → refetch). The SWR key already covers tenant and filters:
  effect removed.
- The `forceMutate` effect also depended on `accounts`, so once set it refetched on every
  response: now depends on `forceMutate` only and calls `mutateAccounts()`.
- Arriving with `?accountId=` now defers the list (`deferred` prop → SWR key `null`) until the
  details are closed; opening details from an already loaded list keeps the list as it is.

## Verification

`yarn build`, `yarn lint`, `yarn test`, Cypress suite; the measurement above.
