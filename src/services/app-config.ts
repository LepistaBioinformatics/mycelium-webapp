import { MYCELIUM_API_URL } from "@/services/openapi/mycelium-api";

export interface AppPublicConfig {
  domainName: string;
  domainUrl: string | null;
  locale: string | null;
}

export async function fetchAppPublicConfig(): Promise<AppPublicConfig> {
  const res = await fetch(`${MYCELIUM_API_URL}/app-config`);

  if (!res.ok) {
    throw new Error(`Failed to fetch app config: ${res.status}`);
  }

  return res.json();
}
