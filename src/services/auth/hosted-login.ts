import { MYCELIUM_API_URL } from "@/services/openapi/mycelium-api";
import { fetchAppPublicConfig } from "@/services/app-config";
import { withBasePath } from "@/functions/with-base-path";
import type { components } from "@/services/openapi/mycelium-schema";

/**
 * Gateway-hosted email login (OAuth 2.0 authorization code + PKCE S256).
 *
 * Enabled when a client id is known: `VITE_MYCELIUM_HOSTED_LOGIN_CLIENT_ID` at
 * build time, else `hostedLoginClientId` from the gateway's `/app-config`. The
 * webapp sends the browser to the gateway's login pages and gets back a
 * one-time code at `<base>callback`, which it exchanges for the session token.
 */

const BASE = `${MYCELIUM_API_URL}/_adm/hosted-login`;
const PENDING_KEY = "myc-hosted-login-pending";

export const BUILD_HOSTED_LOGIN_CLIENT_ID: string | undefined =
  import.meta.env.VITE_MYCELIUM_HOSTED_LOGIN_CLIENT_ID || undefined;

let configClientId: Promise<string | undefined> | undefined;

/**
 * The hosted login client id: the build-time value first, else the one the
 * gateway publishes in `/app-config`. `undefined` disables hosted login.
 */
export function getHostedLoginClientId(): Promise<string | undefined> {
  if (BUILD_HOSTED_LOGIN_CLIENT_ID) {
    return Promise.resolve(BUILD_HOSTED_LOGIN_CLIENT_ID);
  }

  configClientId ??= fetchAppPublicConfig().then(
    (config) => config.hostedLoginClientId || undefined,
    () => {
      configClientId = undefined;
      return undefined;
    }
  );

  return configClientId;
}

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
  return `${window.location.origin}${withBasePath(HOSTED_LOGIN_CALLBACK_PATH)}`;
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
  const clientId = await getHostedLoginClientId();
  if (!clientId) throw new HostedLoginError("Hosted login is not configured");

  const pending: PendingLogin = {
    state: randomSecret(),
    codeVerifier: randomSecret(),
  };
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
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
  const clientId = await getHostedLoginClientId();

  if (!clientId || !pending || pending.state !== state) {
    throw new HostedLoginError("Sign-in request does not match this browser");
  }

  const res = await fetch(`${BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(),
      client_id: clientId,
      code_verifier: pending.codeVerifier,
    }),
  });

  if (!res.ok) {
    throw new HostedLoginError(`Sign-in code exchange failed (${res.status})`);
  }

  return res.json() as Promise<HostedLoginTokenResponse>;
}
