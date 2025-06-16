import { components } from "@/services/openapi/mycelium-schema";

export type TenantStatus = "unauthorized" | "deleted" | "unknown" | {
    active: components["schemas"]["Tenant"]
};
