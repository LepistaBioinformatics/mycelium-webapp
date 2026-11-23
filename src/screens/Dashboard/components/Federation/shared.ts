import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import useProfile from "@/hooks/use-profile";
import { PeerOverview, peersList } from "@/services/rpc/federation";
import { useMemo } from "react";
import useSWR from "swr";

export const PREFIX = "screens.Dashboard.Federation";

export const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateOnMount: true,
  refreshInterval: 1000 * 60,
};

export const PEERS_SWR_KEY = ["rpc", "federation.peers.list"] as const;

/**
 * The gateway lets only staff operate federation, so every request here is
 * gated on `isStaff` (managers are not enough, unlike `hasEnoughPermissions`).
 */
export function useFederationOperator() {
  const { profile, isAuthenticated, getAccessTokenSilently } = useProfile();

  return {
    canFetch: isAuthenticated && !!profile?.isStaff,
    getToken: getAccessTokenSilently,
  };
}

/** The peers, plus a lookup by the internal peer id that links, assertions
 * and rules reference */
export function usePeers() {
  const { canFetch, getToken } = useFederationOperator();

  const peers = useSWR(
    canFetch ? PEERS_SWR_KEY : null,
    () => peersList(getToken),
    swrOptions
  );

  const byId = useMemo(
    () =>
      new Map<string, PeerOverview>(
        (peers.data ?? []).map((peer) => [peer.id, peer])
      ),
    [peers.data]
  );

  return { ...peers, byId };
}

export function peerName(peer: PeerOverview | undefined, fallback: string) {
  if (!peer) return fallback;
  return peer.displayName || peer.baseUrl;
}

/** The gateway answers JSON-RPC "method not found" (-32601) for every
 * `federation.*` method when it was built without federation (e.g. the
 * standalone mode, which does not support it). */
export function isFederationUnavailable(err: unknown) {
  return errorMessage(err).includes("(-32601)");
}

export function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

export function formatDate(value?: string | null) {
  return value ? formatDDMMYY(new Date(value), true) : "—";
}
