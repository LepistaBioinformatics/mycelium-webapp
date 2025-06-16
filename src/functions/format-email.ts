import { components } from "@/services/openapi/mycelium-schema";

type Email = components["schemas"]["Email"];

export default function formatEmail(email: Email) {
    if (!email.username || !email.domain) return null;

    return `${email.username}@${email.domain}`;
}
