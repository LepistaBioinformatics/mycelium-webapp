import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { NativeUser } from "@/types/NativeAuth";

const SESSION_KEY = "myc-native-token";

interface NativeAuthState {
  token: string | null;
  user: NativeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface NativeAuthContextValue extends NativeAuthState {
  setAuth: (token: string, user: NativeUser) => void;
  clearAuth: () => void;
  getToken: () => Promise<string>;
}

const NativeAuthContext = createContext<NativeAuthContextValue | null>(null);

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return false;
    const decoded = JSON.parse(atob(parts[1] as string));
    return typeof decoded.exp === "number" && decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export function NativeAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NativeAuthState>({
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored && isTokenValid(stored)) {
      setState({ token: stored, user: null, isAuthenticated: true, isLoading: false });
    } else {
      if (stored) sessionStorage.removeItem(SESSION_KEY);
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const setAuth = useCallback((token: string, user: NativeUser) => {
    sessionStorage.setItem(SESSION_KEY, token);
    setState({ token, user, isAuthenticated: true, isLoading: false });
  }, []);

  const clearAuth = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setState({ token: null, user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const getToken = useCallback((): Promise<string> => {
    if (state.token && isTokenValid(state.token)) {
      return Promise.resolve(state.token);
    }
    return Promise.reject(new Error("Not authenticated"));
  }, [state.token]);

  return (
    <NativeAuthContext.Provider value={{ ...state, setAuth, clearAuth, getToken }}>
      {children}
    </NativeAuthContext.Provider>
  );
}

export function useNativeAuthContext(): NativeAuthContextValue {
  const ctx = useContext(NativeAuthContext);
  if (!ctx) {
    throw new Error("useNativeAuthContext must be used inside NativeAuthProvider");
  }
  return ctx;
}
