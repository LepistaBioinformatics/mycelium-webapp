import { MYCELIUM_API_URL } from "@/services/openapi/mycelium-api";
import type { components } from "@/services/openapi/mycelium-schema";

/**
 * Gateway-hosted email login (OAuth 2.0 authorization code + PKCE S256).
 *
 * Enabled when `VITE_MYCELIUM_HOSTED_LOGIN_CLIENT_ID` is set: the webapp sends
 * the browser to the gateway's login pages and gets back a one-time code at
 * `/callback`, which it exchanges for the session token.
 */

const BASE = `${MYCELIUM_API_URL}/_adm/hosted-login`;
const PENDING_KEY = "myc-hosted-login-pending";

export const HOSTED_LOGIN_CLIENT_ID: string | undefined =
  import.meta.env.VITE_MYCELIUM_HOSTED_LOGIN_CLIENT_ID || undefined;

export const HOSTED_LOGIN_CALLBACK_PATH = "/callback";

/** Successful token response (RFC 6749 §5.1) plus the Mycelium user. */
export type HostedLoginTokenResponse = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  user: components["schemas"]["User"];
};

type PendingLogin = { state: string; codeVerifier: string };

export class HostedLoginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HostedLoginError";
  }
}

function redirectUri(): string {
  return `${window.location.origin}${HOSTED_LOGIN_CALLBACK_PATH}`;
}

function base64Url(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomSecret(): string {
  return base64Url(crypto.getRandomValues(new Uint8Array(32)));
}

async function codeChallengeFor(codeVerifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier)
  );
  return base64Url(new Uint8Array(digest));
}

/** Send the browser to the gateway login. */
export async function startHostedLogin(): Promise<void> {
  if (!HOSTED_LOGIN_CLIENT_ID) return;

  const pending: PendingLogin = {
    state: randomSecret(),
    codeVerifier: randomSecret(),
  };
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));

  const params = new URLSearchParams({
    response_type: "code",
    client_id: HOSTED_LOGIN_CLIENT_ID,
    redirect_uri: redirectUri(),
    state: pending.state,
    code_challenge: await codeChallengeFor(pending.codeVerifier),
    code_challenge_method: "S256",
  });

  window.location.assign(`${BASE}/authorize?${params.toString()}`);
}

function takePendingLogin(): PendingLogin | null {
  const raw = sessionStorage.getItem(PENDING_KEY);
  sessionStorage.removeItem(PENDING_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingLogin;
  } catch {
    return null;
  }
}

/**
 * Exchange the code the gateway sent back for the session token. The pending
 * state is consumed first, so a callback URL can only be used once.
 */
export async function completeHostedLogin(
  code: string,
  state: string
): Promise<HostedLoginTokenResponse> {
  const pending = takePendingLogin();

  if (!HOSTED_LOGIN_CLIENT_ID || !pending || pending.state !== state) {
    throw new HostedLoginError("Sign-in request does not match this browser");
  }

  const res = await fetch(`${BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(),
      client_id: HOSTED_LOGIN_CLIENT_ID,
      code_verifier: pending.codeVerifier,
    }),
  });

  if (!res.ok) {
    throw new HostedLoginError(`Sign-in code exchange failed (${res.status})`);
  }

  return res.json() as Promise<HostedLoginTokenResponse>;
}
