import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import TenantResolver from "./TenantResolver";
import TenantOwnershipInfo from "./TenantOwnershipInfo";
import Button from "@/components/ui/Button";
import { components } from "@/services/openapi/mycelium-schema";
import { useState } from "react";

type TenantOwnership = components["schemas"]["TenantOwnership"];

interface Props {
  tenantsOwnership: TenantOwnership[] | null;
}

export default function TenantOwnershipSection({ tenantsOwnership }: Props) {
  const [loadingSize, setLoadingSize] = useState(3);

  if (!tenantsOwnership) return null;

  return (
    <Card padding="sm" width="sm" flex1>
      <Card.Header>
        <Typography as="h6" decoration="smooth">
          Ownership on Tenants
        </Typography>
      </Card.Header>

      <Card.Body>
        <div className="flex flex-wrap gap-2 scrollbar">
          {tenantsOwnership
            ?.sort((a, b) => b.since.localeCompare(a.since))
            ?.slice(0, loadingSize)
            ?.map((tenant) => (
              <TenantResolver key={tenant.tenant} tenantId={tenant.tenant}>
                <TenantOwnershipInfo
                  since={tenant.since}
                  tenantId={tenant.tenant}
                />
              </TenantResolver>
            ))}
        </div>

        {tenantsOwnership?.length > loadingSize && (
          <div className="flex justify-center items-center mt-5">
            <Button
              intent="link"
              rounded
              disabled={tenantsOwnership.length === loadingSize}
              size="sm"
              onClick={() => setLoadingSize(tenantsOwnership.length)}
            >
              <span className="text-sm text-blue-500 dark:text-lime-400">
                Load all {tenantsOwnership.length}
              </span>
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
