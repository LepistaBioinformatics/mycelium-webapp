import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";
import { useTranslation } from "react-i18next";

type Tenant = components["schemas"]["Tenant"];

interface Props {
  tenant: Tenant;
  mutateTenantStatus: () => void;
}

export default function ColorsCard({}: Props) {
  const { t } = useTranslation();

  return (
    <Card padding="sm" group width="full">
      <Card.Header>
        <div className="flex flex-col gap-2">
          <Typography as="h6">
            {t(
              "screens.Dashboard.Tenants.AdvancedManagement.customization.colors.title"
            )}
          </Typography>

          <Typography as="small" decoration="smooth" width="sm">
            {t(
              "screens.Dashboard.Tenants.AdvancedManagement.customization.colors.description"
            )}
          </Typography>
        </div>
      </Card.Header>

      <Card.Body>
        <Typography decoration="smooth">Available soon!</Typography>
      </Card.Body>
    </Card>
  );
}
