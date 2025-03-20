import { components } from "@/services/openapi/mycelium-schema";

type Profile = components["schemas"]["Profile"];

export default function getLicensedResourcesOrNull(
    licensedResources: Profile["licensedResources"]
): components["schemas"]["LicensedResource"][] | null {
    if (licensedResources && "records" in licensedResources) {
        const records = licensedResources.records;

        if (records.length === 0) {
            return null;
        }

        return records;
    }

    return null;
}
