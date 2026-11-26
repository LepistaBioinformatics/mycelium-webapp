import { useSyncExternalStore } from "react";

// SWR's filtered `mutate` does not reach `useSWRInfinite` caches, so the
// accounts list carries this version in its key and reloads when it changes.
let version = 0;
const listeners = new Set<() => void>();

/** Reload every mounted accounts list (e.g. after deleting an account) */
export function bumpAccountsListVersion() {
  version += 1;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export default function useAccountsListVersion() {
  return useSyncExternalStore(subscribe, () => version);
}
