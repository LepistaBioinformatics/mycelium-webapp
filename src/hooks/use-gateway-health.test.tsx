import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { SWRConfig } from "swr";

import useGatewayHealth from "./use-gateway-health";

function wrapper({ children }: { children: ReactNode }) {
  return createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children
  );
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useGatewayHealth", () => {
  it("is not down while the first probe runs or when it succeeds", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("success"));

    const { result } = renderHook(() => useGatewayHealth(), { wrapper });

    expect(result.current.isGatewayDown).toBe(false);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(result.current.isGatewayDown).toBe(false);
  });

  it("is down when the gateway is unreachable", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));

    const { result } = renderHook(() => useGatewayHealth(), { wrapper });

    await waitFor(() => expect(result.current.isGatewayDown).toBe(true));
  });

  it("is down when health answers with an error status", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("", { status: 503 }));

    const { result } = renderHook(() => useGatewayHealth(), { wrapper });

    await waitFor(() => expect(result.current.isGatewayDown).toBe(true));
  });

  it("recovers on retry once the gateway answers again", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const { result } = renderHook(() => useGatewayHealth(), { wrapper });
    await waitFor(() => expect(result.current.isGatewayDown).toBe(true));

    vi.mocked(fetch).mockResolvedValue(new Response("success"));
    await act(async () => {
      await result.current.retry();
    });

    await waitFor(() => expect(result.current.isGatewayDown).toBe(false));
  });
});
