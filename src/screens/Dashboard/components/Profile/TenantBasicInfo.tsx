import Typography from "@/components/ui/Typography";
import { TenantResolverChildProps } from "./TenantResolver";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import { SYSTEM_TENANT_ID } from "@/constants/zero-tenant";

interface Props extends TenantResolverChildProps {
  tenantId: string;
}

export default function TenantBasicInfo({
  tenantStatus,
  isLoading,
  error,
  tenantId
}: Props) {
  //
  // System accounts with system roles receives a zero-uuid as tenantId
  //
  if (tenantId === SYSTEM_TENANT_ID) {
    return null;
  }

  //
  // If the tenant is unknown or the tenant is being loaded, don't show anything
  //
  if (isLoading || !tenantStatus || error) {
    return null;
  }

  //
  // If the tenant is deleted, show the tenantId
  //
  if (tenantStatus === "deleted") {
    return (
      <div className="flex items-center gap-2">
        <Typography decoration="smooth">from</Typography>
        <Typography as="h3" title={`The tenant which the account belongs to: ${tenantId}`} nowrap>
          Deleted
          <CopyToClipboard text={tenantId} />
        </Typography>
      </div>
    );
  }

  //
  // If the tenant is unknown, show the tenantId
  //
  if (tenantStatus === "unknown") {
    return (
      <div className="flex items-center gap-2">
        <Typography decoration="smooth">from</Typography>
        <Typography as="h3" title={`The tenant which the account belongs to: ${tenantId}`} nowrap>
          Unknown
          <CopyToClipboard text={tenantId} />
        </Typography>
      </div>
    );
  }

  //
  // If the tenant is known, show the tenant name
  //
  return (
    <div className="flex items-center gap-2">
      <Typography as="span" decoration="smooth">from</Typography>
      <Typography as="h5" title={`Tenant: ${tenantStatus.active.name} (${tenantStatus.active.description})`} nowrap>
        {tenantStatus?.active?.name}
      </Typography>
    </div>
  );
}
