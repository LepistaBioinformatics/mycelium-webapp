import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useProfile from "./use-profile";

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
    const { result } = renderHook(() => useProfile());

    expect(result.current.profile).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("fetches profile from API when user is authenticated and no cache", async () => {
    setAuthUser("admin@example.com");
    const profile = makeProfile();
    mockProfileGet.mockResolvedValueOnce(profile);

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.profile).toEqual(profile);
    });

    expect(mockProfileGet).toHaveBeenCalledOnce();
  });

  it("stores fetched profile in sessionStorage with TTL", async () => {
    setAuthUser("admin@example.com");
    const profile = makeProfile();
    mockProfileGet.mockResolvedValueOnce(profile);

    renderHook(() => useProfile());

    await waitFor(() => {
      const stored = sessionStorage.getItem("myc-profile");
      expect(stored).not.toBeNull();
    });

    const stored = JSON.parse(sessionStorage.getItem("myc-profile")!);
    expect(stored.owners).toEqual(profile.owners);
    expect(stored.ttl).toBeGreaterThan(Date.now());
  });

  it("reads profile from sessionStorage cache and skips API call", async () => {
    setAuthUser("admin@example.com");
    const profile = makeProfile();
    // The hook stores ProfileWithTtl in state when reading from cache.
    // Use objectContaining to match profile fields without asserting ttl.
    const profileWithTtl = { ...profile, ttl: Date.now() + 60_000 };
    sessionStorage.setItem("myc-profile", JSON.stringify(profileWithTtl));

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.profile).toMatchObject(profile);
    });

    expect(mockProfileGet).not.toHaveBeenCalled();
  });

  it("evicts stale cache entry and re-fetches", async () => {
    setAuthUser("admin@example.com");
    const staleProfile = makeProfile();
    const staleEntry = { ...staleProfile, ttl: Date.now() - 1 };
    sessionStorage.setItem("myc-profile", JSON.stringify(staleEntry));

    const freshProfile = makeProfile({ isManager: true });
    mockProfileGet.mockResolvedValueOnce(freshProfile);

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.profile?.isManager).toBe(true);
    });

    expect(mockProfileGet).toHaveBeenCalledOnce();
  });

  it("evicts cache when stored email does not match current user", async () => {
    setAuthUser("other@example.com");
    const profile = makeProfile(); // owners has admin@example.com
    const profileWithTtl = { ...profile, ttl: Date.now() + 60_000 };
    sessionStorage.setItem("myc-profile", JSON.stringify(profileWithTtl));

    const correctProfile = makeProfile({
      owners: [{ email: "other@example.com", name: null, uuid: "u2" }],
    });
    mockProfileGet.mockResolvedValueOnce(correctProfile);

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.profile).toEqual(correctProfile);
    });

    expect(mockProfileGet).toHaveBeenCalledOnce();
  });
});

describe("useProfile — hasEnoughPermissions", () => {
  it("returns true for staff regardless of role filter", async () => {
    setAuthUser("admin@example.com");
    mockProfileGet.mockResolvedValueOnce(makeProfile({ isStaff: true }));

    const { result } = renderHook(() =>
      useProfile({ roles: ["SystemAccountManager"] })
    );

    await waitFor(() => expect(result.current.hasEnoughPermissions).toBe(true));
  });

  it("returns true for manager regardless of role filter", async () => {
    setAuthUser("admin@example.com");
    mockProfileGet.mockResolvedValueOnce(makeProfile({ isManager: true }));

    const { result } = renderHook(() => useProfile());

    await waitFor(() => expect(result.current.hasEnoughPermissions).toBe(true));
  });

  it("returns false when no profile", () => {
    const { result } = renderHook(() => useProfile());
    expect(result.current.hasEnoughPermissions).toBe(false);
  });

  it("returns false when denyStaff is set even for a staff user", async () => {
    setAuthUser("admin@example.com");
    mockProfileGet.mockResolvedValueOnce(makeProfile({ isStaff: true }));

    const { result } = renderHook(() => useProfile({ denyStaff: true }));

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

    const { result } = renderHook(() =>
      useProfile({ roles: ["SystemAccountManager"] })
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

    renderHook(() => useProfile());

    await waitFor(() => {
      expect(mockParseAuthError).toHaveBeenCalledWith(authError);
    });
  });
});
