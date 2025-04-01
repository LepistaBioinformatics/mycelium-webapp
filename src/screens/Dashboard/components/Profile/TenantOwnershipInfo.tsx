import { MdLogout } from "react-icons/md";
import Typography from "@/components/ui/Typography";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import { useCallback } from "react";
import { TenantResolverChildProps } from "./TenantResolver";
import MiniBox from "@/components/ui/MiniBox";
import IntroSection from "@/components/ui/IntroSection";
import { Link } from "react-router";

interface Props extends TenantResolverChildProps {
  since: string;
}

export default function TenantOwnershipInfo({
  since,
  tenantId,
  tenantStatus,
  isLoading,
  error,
}: Props) {
  const title = `The tenant which the account belongs to: ${tenantId}`;

  const Since = () => (
    <IntroSection.Item
      prefix="since"
      title={`Since on tenant: ${tenantId}`}
    >
      {formatDDMMYY(new Date(since), true)}
    </IntroSection.Item>
  );

  const TenantData = useCallback(() => {
    if (isLoading || !tenantStatus || error) {
      return <Since />;
    }

    if (tenantStatus === "deleted" || tenantStatus === "unknown") {
      return (
        <div>
          <Since />
          <IntroSection.Item prefix="status" title={title}>
            {tenantStatus === "deleted" ? "Tenant deleted" : "Unknown tenant"}
          </IntroSection.Item>
        </div>
      );
    }

    if (tenantStatus === "unauthorized") {
      return (
        <div>
          <Since />
          <IntroSection.Item prefix="status" title={title} isError>
            Unauthorized
          </IntroSection.Item>
        </div>
      );
    }

    return (
      <div>
        <IntroSection
          content={tenantStatus.active.name}
          title="The tenant name"
          as="h3"
        >
          <Since />
          <IntroSection.Item
            prefixProps={{ nowrap: true }}
            prefix="described as"
            title={title}
          >
            {tenantStatus.active.description}
          </IntroSection.Item>
        </IntroSection>
      </div>
    );
  }, [tenantStatus]);

  return (
    <MiniBox>
      <div className="flex items-center justify-between gap-3">
        <TenantData />
        <Link to={`/dashboard/tenants/${tenantId}`}>
          <MdLogout className="text-blue-500 dark:text-lime-500" />
        </Link>
      </div>

      {error && (<Typography as="small" isError>{error.message}</Typography>)}
    </MiniBox>
  );
}
