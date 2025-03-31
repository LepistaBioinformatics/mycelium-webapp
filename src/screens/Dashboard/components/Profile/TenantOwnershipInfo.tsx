import Typography from "@/components/ui/Typography";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import { useCallback } from "react";
import { TenantResolverChildProps } from "./TenantResolver";
import MiniBox from "@/components/ui/MiniBox";
import IntroSection from "@/components/ui/IntroSection";

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
        <>
          <Since />
          <IntroSection.Item prefix="status" title={title}>
            {tenantStatus === "deleted" ? "Tenant deleted" : "Unknown tenant"}
          </IntroSection.Item>
        </>
      );
    }

    if (tenantStatus === "unauthorized") {
      return (
        <>
          <Since />
          <IntroSection.Item prefix="status" title={title} isError>
            Unauthorized
          </IntroSection.Item>
        </>
      );
    }

    return (
      <>
        <IntroSection
          content={tenantStatus.active.name}
          title="The tenant name"
          as="h3"
        >
          <Since />
          <IntroSection.Item prefix="described as" title={title}>
            {tenantStatus.active.description}
          </IntroSection.Item>
        </IntroSection>
      </>
    );
  }, [tenantStatus]);

  return (
    <MiniBox>
      <TenantData />
      {error && (<Typography as="small" isError>{error.message}</Typography>)}
    </MiniBox>
  );
}
