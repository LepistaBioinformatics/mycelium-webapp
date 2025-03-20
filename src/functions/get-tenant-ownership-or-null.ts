import { components } from "@/services/openapi/mycelium-schema";

type Profile = components["schemas"]["Profile"];

export default function getTenantsOwnershipOrNull(
    tenantsOwnership: Profile["tenantsOwnership"]
): components["schemas"]["TenantOwnership"][] | null {
    if (tenantsOwnership && "records" in tenantsOwnership) {
        const records = tenantsOwnership.records;

        if (records.length === 0) {
            return null;
        }

        return records;
    }

    return null;
}
