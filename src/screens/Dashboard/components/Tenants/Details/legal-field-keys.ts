import { components } from "@/services/openapi/mycelium-schema";

type TenantMetaKey = components["schemas"]["TenantMetaKey"];

export const LEGAL_FIELD_KEYS: TenantMetaKey[] = [
  "federal_revenue_register",
  "federal_revenue_register_type",
  "country",
  "state",
  "province",
  "city",
  "zip_code",
  "address1",
  "address2",
  "legal_name",
  "trading_name",
  "contact_person",
];
