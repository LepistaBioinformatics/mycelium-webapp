import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import { TenantOwnershipListItem } from "./TenantOwnershipInfo";
import { components } from "@/services/openapi/mycelium-schema";
import { useTranslation } from "react-i18next";

type TenantOwnership = components["schemas"]["TenantOwnership"];

interface Props {
  tenantsOwnership: TenantOwnership[] | null;
}

export default function TenantOwnershipSection({ tenantsOwnership }: Props) {
  const { t } = useTranslation();

  return (
    <Card padding="sm" width="alwaysFull" height="adaptive">
      <Card.Header>
        <Typography as="h5" decoration="faded">
          {t("screens.Dashboard.TenantOwnershipSection.title")}
        </Typography>
      </Card.Header>

      <Card.Body width="full">
        {(!tenantsOwnership || tenantsOwnership.length === 0) && (
          <div className="flex flex-col gap-2 py-4">
            <Typography decoration="smooth">
              {t("screens.Dashboard.TenantOwnershipSection.noNamespaces")}
            </Typography>
            <Typography as="small" decoration="smooth" width="xs">
              {t(
                "screens.Dashboard.TenantOwnershipSection.noNamespacesDescription"
              )}
            </Typography>
          </div>
        )}
        {tenantsOwnership && tenantsOwnership.length > 0 && (
          <ul className="flex flex-col gap-2 w-full">
            {[...tenantsOwnership]
              .sort((a, b) => b.since.localeCompare(a.since))
              .map((tenant) => (
                <TenantOwnershipListItem
                  key={tenant.id}
                  since={tenant.since}
                  tenantId={tenant.id}
                  tenantName={tenant.name}
                />
              ))}
          </ul>
        )}
      </Card.Body>
    </Card>
  );
}
