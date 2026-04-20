import { MYCELIUM_API_URL } from "@/services/openapi/mycelium-api";

// TODO: replace with schema type on next schema regeneration
export interface SetTelegramConfigBody {
  botToken: string;
  webhookSecret: string;
}

export async function setTelegramConfig(
  body: SetTelegramConfigBody,
  tenantId: string,
  getToken: () => Promise<string>,
): Promise<void> {
  const token = await getToken();
  const res = await fetch(
    `${MYCELIUM_API_URL}/_adm/tenant-owner/telegram/config`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-mycelium-tenant-id": tenantId,
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error(await res.text());
}

export async function unlinkTelegram(
  getToken: () => Promise<string>,
): Promise<void> {
  const token = await getToken();
  const res = await fetch(`${MYCELIUM_API_URL}/_adm/auth/telegram/link`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
}
