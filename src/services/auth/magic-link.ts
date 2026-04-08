import { MYCELIUM_API_URL } from "@/services/openapi/mycelium-api";
import { InvalidCodeError, type NativeLoginResponse } from "@/types/NativeAuth";

const BASE = `${MYCELIUM_API_URL}/_adm/beginners/users/magic-link`;

export async function requestMagicLink(email: string): Promise<void> {
  const res = await fetch(`${BASE}/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error(`Failed to send magic link (${res.status})`);
  }
}

export async function verifyMagicLink(
  email: string,
  code: string
): Promise<NativeLoginResponse> {
  const res = await fetch(`${BASE}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });

  if (res.status === 401) {
    throw new InvalidCodeError();
  }

  if (!res.ok) {
    throw new Error(`Magic link verification failed (${res.status})`);
  }

  return res.json() as Promise<NativeLoginResponse>;
}
