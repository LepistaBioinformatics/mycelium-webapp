# Feature: "Load more" instead of page-by-page pagination

**Status:** Specified — executing
**Size:** Medium (one hook + one component; mechanical migration of 9 lists)

## Context

Every paginated list uses `Pager` (previous / next, one page at a time) through
`PaginatedContent` or directly: accounts, account invitations, tenants, guest roles, webhooks,
webhook executions, discovery, error codes (dashboard) and public error codes.

## Decision

- **D-01** Pages **accumulate**: "Load more" fetches the next page (`skip += pageSize`) and
  appends it. Growing `pageSize` and refetching from 0 is rejected: the gateway caps some lists
  (webhook executions and public error codes at 100 per page), so a growing page would silently
  truncate.

## Requirements

- **LM-01** Hook `useLoadMore` (`src/hooks/use-load-more.ts`) on `useSWRInfinite`: takes a base key
  (or `null` to pause), a page fetcher `(skip, pageSize) => PaginatedRecords<T> | null` and a page
  size; returns `records` (flattened), `count` (from the last page), `isLoading` (first page),
  `isLoadingMore`, `hasMore` (`records.length < count` and the last page was full), `loadMore()`,
  `mutate()` (refetch every loaded page) and `reset()`. Changing the base key (filters, search,
  tenant) starts over at one page.
- **LM-02** Component `ui/LoadMore`: "Showing N of M" + a "Load more" button (spinner while
  loading, hidden when nothing is left). i18n en / pt-br / es.
- **LM-03** `PaginatedContent` renders the list plus `LoadMore` at the bottom (no `Pager`).
- **LM-04** All 9 lists migrate; `Pager` is deleted when unused. Search / filter / tenant changes
  reset to the first page; creating / deleting an item refreshes the loaded pages.
- **LM-05** The accounts list keeps merging per account type (one batched call per type per page).

## Verification

`yarn build`, `yarn lint`, `yarn test` (unit tests for the hook's `hasMore` / key logic), Cypress
suite; screenshot of a list with "Load more" and of the state after loading everything.
