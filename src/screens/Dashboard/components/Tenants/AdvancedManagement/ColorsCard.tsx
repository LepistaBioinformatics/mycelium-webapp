import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";

type Tenant = components["schemas"]["Tenant"];

interface Props {
  tenant: Tenant,
  mutateTenantStatus: () => void,
}

export default function ColorsCard({ }: Props) {
  return (
    <Card
      minHeight="50vh"
      maxHeight="50vh"
      padding="sm"
      width="2xl"
      flex1
      group
    >
      <Card.Header>
        <Typography as="h6" decoration="smooth">
          Colors
        </Typography>
      </Card.Header>

      <Card.Body>
        <Typography width="xs">
          Setup tenant colors. This will be used to style the tenant in the UI.
        </Typography>
      </Card.Body>
    </Card>
  )
}
