import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { SWRConfig } from "swr";
import useProfile, { invalidateProfile } from "./use-profile";

// ---------------------------------------------------------------------------
// Module mocks — declared before any imports that might trigger them
// ---------------------------------------------------------------------------

const mockGetAccessTokenSilently = vi.fn().mockResolvedValue("mock-token");
const mockLogout = vi.fn();
const mockLoginWithRedirect = vi.fn();

vi.mock("@/hooks/use-native-auth", () => ({
  default: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    getAccessTokenSilently: mockGetAccessTokenSilently,
    logout: mockLogout,
    loginWithRedirect: mockLoginWithRedirect,
    error: null,
  })),
}));

const mockParseAuthError = vi.fn();
vi.mock("@/hooks/use-suspense-error", () => ({
  default: vi.fn(() => ({
    parseAuthError: mockParseAuthError,
    parseHttpError: vi.fn(),
    dispacheSuccess: vi.fn(),
    dispatchError: vi.fn(),
    dispatchWarning: vi.fn(),
    dispatchInfo: vi.fn(),
  })),
}));

const mockProfileGet = vi.fn();
vi.mock("@/services/rpc/beginners", () => ({
  profileGet: (...args: unknown[]) => mockProfileGet(...args),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Fresh SWR cache per render: the profile is cached by SWR across hooks.
function wrapper({ children }: { children: ReactNode }) {
  return createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children
  );
}

import useNativeAuth from "@/hooks/use-native-auth";

function setAuthUser(email: string) {
  const [username, domain] = email.split("@");
  vi.mocked(useNativeAuth).mockReturnValue({
    user: { email: { username, domain } } as ReturnType<typeof useNativeAuth>["user"],
    isAuthenticated: true,
    isLoading: false,
    getAccessTokenSilently: mockGetAccessTokenSilently,
    logout: mockLogout,
    loginWithRedirect: mockLoginWithRedirect,
    error: null,
  });
}

function buildProfile() {
  return {
    owners: [{ email: "admin@example.com", name: null, uuid: "u1" }],
    isManager: false,
    isStaff: false,
    licensedResources: { noOne: true },
    tenantsOwnership: { noOne: true },
  };
}

function makeProfile(overrides: Partial<ReturnType<typeof buildProfile>> = {}) {
  return { ...buildProfile(), ...overrides };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.mocked(useNativeAuth).mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    getAccessTokenSilently: mockGetAccessTokenSilently,
    logout: mockLogout,
    loginWithRedirect: mockLoginWithRedirect,
    error: null,
  });
  mockProfileGet.mockReset();
  mockParseAuthError.mockReset();
  sessionStorage.clear();
});

describe("useProfile — basic behavior", () => {
  it("returns null profile when user is not authenticated", () => {
    const { result } = renderHook(() => useProfile(), { wrapper });

    expect(result.current.profile).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("fetches profile from API when user is authenticated and no cache", async () => {
    setAuthUser("admin@example.com");
    const profile = makeProfile();
    mockProfileGet.mockResolvedValueOnce(profile);

    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.profile).toEqual(profile);
    });

    expect(mockProfileGet).toHaveBeenCalledOnce();
  });

  it("ignores a profile left in sessionStorage and asks the API", async () => {
    setAuthUser("admin@example.com");
    // Left over by older builds, which cached the profile for a minute
    sessionStorage.setItem(
      "myc-profile",
      JSON.stringify({ ...makeProfile(), ttl: Date.now() + 60_000 })
    );
    const fresh = makeProfile({ isManager: true });
    mockProfileGet.mockResolvedValueOnce(fresh);

    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => expect(result.current.profile).toEqual(fresh));
    expect(mockProfileGet).toHaveBeenCalledOnce();
  });

  it("returns null when the profile belongs to another user", async () => {
    setAuthUser("other@example.com");
    mockProfileGet.mockResolvedValueOnce(makeProfile()); // owner admin@

    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => expect(mockProfileGet).toHaveBeenCalledOnce());
    expect(result.current.profile).toBeNull();
  });
});

describe("useProfile — hasEnoughPermissions", () => {
  it("returns true for staff regardless of role filter", async () => {
    setAuthUser("admin@example.com");
    mockProfileGet.mockResolvedValueOnce(makeProfile({ isStaff: true }));

    const { result } = renderHook(
      () => useProfile({ roles: ["SystemAccountManager"] }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.hasEnoughPermissions).toBe(true));
  });

  it("returns true for manager regardless of role filter", async () => {
    setAuthUser("admin@example.com");
    mockProfileGet.mockResolvedValueOnce(makeProfile({ isManager: true }));

    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => expect(result.current.hasEnoughPermissions).toBe(true));
  });

  it("returns false when no profile", () => {
    const { result } = renderHook(() => useProfile(), { wrapper });
    expect(result.current.hasEnoughPermissions).toBe(false);
  });

  it("returns false when denyStaff is set even for a staff user", async () => {
    setAuthUser("admin@example.com");
    mockProfileGet.mockResolvedValueOnce(makeProfile({ isStaff: true }));

    const { result } = renderHook(() => useProfile({ denyStaff: true }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.profile?.isStaff).toBe(true));
    expect(result.current.hasEnoughPermissions).toBe(false);
  });

  it("matches licensed resources by role", async () => {
    setAuthUser("admin@example.com");
    const profileWithResources = makeProfile({
      licensedResources: {
        records: [
          { role: "SystemAccountManager", perm: "Write", sysAcc: false, accId: "acc1" },
        ],
      },
    });
    mockProfileGet.mockResolvedValueOnce(profileWithResources);

    const { result } = renderHook(
      () => useProfile({ roles: ["SystemAccountManager"] }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.hasEnoughPermissions).toBe(true));
  });
});

describe("useProfile — auth errors", () => {
  it("calls parseAuthError when useNativeAuth returns an error", async () => {
    const authError = new Error("token expired");
    vi.mocked(useNativeAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      getAccessTokenSilently: mockGetAccessTokenSilently,
      logout: mockLogout,
      loginWithRedirect: mockLoginWithRedirect,
      error: authError,
    });

    renderHook(() => useProfile(), { wrapper });

    await waitFor(() => {
      expect(mockParseAuthError).toHaveBeenCalledWith(authError);
    });
  });
});

describe("useProfile — invalidateProfile", () => {
  it("loads the profile once the account exists (onboarding)", async () => {
    // Global SWR cache on purpose: invalidateProfile revalidates it. A unique
    // email keeps this test from sharing cache entries with others.
    setAuthUser("onboarding@example.com");
    const profile = makeProfile({
      owners: [{ email: "onboarding@example.com", name: null, uuid: "u2" }],
    });

    // Signed in before the account existed: the gateway answers 403
    mockProfileGet.mockRejectedValueOnce(new Error("403"));
    const { result } = renderHook(() => useProfile());

    await waitFor(() => expect(mockProfileGet).toHaveBeenCalledOnce());
    expect(result.current.profile).toBeNull();

    // Account created
    mockProfileGet.mockResolvedValueOnce(profile);
    await invalidateProfile();

    await waitFor(() => expect(result.current.profile).toEqual(profile));
  });
});
