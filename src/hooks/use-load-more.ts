import PaginatedRecords from "@/types/PaginatedRecords";
import { useCallback } from "react";
import useSWRInfinite from "swr/infinite";

type BaseKey = readonly unknown[];

interface Options<T> {
  /** Identifies the list (filters, search, tenant…). `null` pauses it. */
  baseKey: BaseKey | null;
  /** Fetch one page */
  fetchPage: (
    skip: number,
    pageSize: number
  ) => Promise<PaginatedRecords<T> | null | undefined>;
  pageSize: number;
  /** Background refresh interval (ms), as the lists had with `useSWR` */
  refreshInterval?: number;
}

/** Whether another page can be fetched after the loaded ones. */
export function hasMorePages<T>(
  pages: (PaginatedRecords<T> | null | undefined)[] | undefined,
  pageSize: number
): boolean {
  const last = pages?.at(-1);
  if (!last) return false;

  const loaded = pages!.reduce((sum, page) => sum + (page?.records?.length ?? 0), 0);
  const lastPageWasFull = (last.records?.length ?? 0) >= pageSize;

  return lastPageWasFull && loaded < (last.count ?? 0);
}

/**
 * "Load more" pagination: pages accumulate (`skip += pageSize`) instead of
 * replacing each other. Changing `baseKey` starts over at the first page.
 */
export default function useLoadMore<T>({
  baseKey,
  fetchPage,
  pageSize,
  refreshInterval = 1000 * 60,
}: Options<T>) {
  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite(
      (pageIndex) =>
        baseKey ? [...baseKey, "page", pageIndex * pageSize, pageSize] : null,
      (key: readonly unknown[]) => {
        const [skip, size] = key.slice(-2) as [number, number];
        return fetchPage(skip, size);
      },
      {
        // Keep the first page fresh (mount, focus-independent refresh): the
        // list notices new or removed items without refetching every page.
        revalidateFirstPage: true,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval,
      }
    );

  // Stable references, so callers can list them in effect dependencies.
  const loadMore = useCallback(() => setSize((current) => current + 1), [setSize]);
  const reset = useCallback(() => setSize(1), [setSize]);
  const refetch = useCallback(() => mutate(), [mutate]);

  const records = (data ?? []).flatMap((page) => page?.records ?? []);
  const count = data?.at(-1)?.count ?? records.length;
  const isLoadingMore =
    !isLoading && size > 0 && data !== undefined && data[size - 1] === undefined;

  return {
    records,
    count,
    error,
    isLoading,
    isLoadingMore: isLoadingMore || (isValidating && size > (data?.length ?? 0)),
    hasMore: hasMorePages(data, pageSize),
    loadMore,
    reset,
    mutate: refetch,
  };
}
