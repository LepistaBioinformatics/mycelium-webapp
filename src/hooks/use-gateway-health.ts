import { useRef } from "react";
import useSWR, { mutate as mutateGlobal } from "swr";

import { MYCELIUM_API_URL } from "@/services/openapi/mycelium-api";

export const GATEWAY_HEALTH_KEY = `${MYCELIUM_API_URL}/health`;

/** How often the gateway is probed (ms). */
const HEALTH_CHECK_INTERVAL = 15_000;

/** A probe that takes longer than this counts as the gateway being down. */
const HEALTH_CHECK_TIMEOUT = 5_000;

async function checkGatewayHealth(url: string): Promise<true> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Gateway health check failed (${res.status})`);

  return true;
}

/**
 * Polls the gateway `/health` endpoint so the app can tell "the gateway is
 * unreachable" apart from real answers (e.g. "you have no account yet").
 *
 * When the gateway comes back after being down, every SWR cache is
 * revalidated so screens drop data they failed to load meanwhile.
 */
export default function useGatewayHealth() {
  const wasDown = useRef(false);

  const { error, isLoading, mutate } = useSWR(
    GATEWAY_HEALTH_KEY,
    checkGatewayHealth,
    {
      refreshInterval: HEALTH_CHECK_INTERVAL,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      // Keep polling while the tab is in the background too, so the overlay
      // is accurate when the user comes back
      refreshWhenHidden: true,
      onError: () => {
        wasDown.current = true;
      },
      onSuccess: () => {
        if (!wasDown.current) return;
        wasDown.current = false;
        void mutateGlobal((key) => key !== GATEWAY_HEALTH_KEY);
      },
    }
  );

  return {
    /** `true` only after a probe failed; `false` while the first one runs. */
    isGatewayDown: Boolean(error) && !isLoading,
    retry: () => mutate(),
  };
}
