import { components } from "@/services/openapi/mycelium-schema";

type SecretToken = components["schemas"]["SecretResolver_String"];

/**
 * Read the plain value of a webhook secret token.
 *
 * The gateway serializes plain-value tokens as bare strings (the variant is
 * `#[serde(untagged)]`), while the generated schema renders it as `{ value }`.
 * Both shapes are accepted. Env and Vault tokens are references resolved by
 * the gateway, so they yield `null`.
 */
export function readSecretToken(
  token: SecretToken | string | null | undefined
): string | null {
  if (typeof token === "string") return token;
  if (token && "value" in token) return token.value;

  return null;
}

/** Text shown for a token: its value, or the env/vault reference. */
export function describeSecretToken(
  token: SecretToken | string | null | undefined
): string {
  return readSecretToken(token) ?? JSON.stringify(token ?? "");
}
