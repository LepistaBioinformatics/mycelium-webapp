import Typography from "@/components/ui/Typography";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import { useCallback } from "react";
import { TenantResolverChildProps } from "./TenantResolver";

interface Props extends TenantResolverChildProps {
  since: string;
}

export default function TenantOwnershipInfo({
  since,
  tenantStatus,
  isLoading,
  error,
}: Props) {
  const Since = () => (
    <div className="flex items-center gap-2">
      <Typography as="span" decoration="smooth">since</Typography>
      <Typography as="h5" title="The date and time you were added as a tenant owner">
        {formatDDMMYY(new Date(since), true)}
      </Typography>
    </div>
  );

  const TenantData = useCallback(() => {
    if (isLoading || !tenantStatus || error) {
      return <Since />;
    }

    if (tenantStatus === "deleted" || tenantStatus === "unknown") {
      return (
        <>
          <Since />
          <Typography as="small" isError>
            {tenantStatus === "deleted" ? "Tenant deleted" : "Unknown tenant"}
          </Typography>
        </>
      );
    }

    return (
      <>
        <Typography as="h5" title="The tenant name">
          {tenantStatus.active.name}
        </Typography>
        <Since />
        <Typography as="small" decoration="smooth">
          {tenantStatus.active.description}
        </Typography>
      </>
    );
  }, [tenantStatus]);

  return (
    <div className="flex flex-col gap-0 w-full bg-blue-50 dark:bg-slate-900 bg-opacity-50 dark:bg-opacity-50 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
      <div>
        {isLoading ? "Loading..." : (
          <div>
            <TenantData />

            {error && (
              <Typography as="small" isError>
                {error.message}
              </Typography>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
