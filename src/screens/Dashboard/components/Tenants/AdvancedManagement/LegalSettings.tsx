import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";

type Tenant = components["schemas"]["Tenant"];

interface Props {
  tenant: Tenant,
  mutateTenantStatus: () => void,
}

export default function LegalSettings({ tenant }: Props) {
  return (
    <Card
      minHeight="50vh"
      maxHeight="50vh"
      padding="sm"
      width="6xl"
      flex1
      group
    >
      <Card.Header>
        <Typography as="h6" decoration="smooth">
          <span>Manage legal information about the tenant</span>
        </Typography>
      </Card.Header>

      <Card.Body>
        <div className="flex flex-col gap-2">
          Fields Here
        </div>
      </Card.Body>
    </Card>
  )
}
