import PageBody from "@/components/ui/PageBody";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import { useCallback, useMemo } from "react";

type Tenant = components["schemas"]["Tenant"];

export default function Staff() {
  const { profile, isLoadingUser } = useProfile();

  const UnauthorizedUsers = useCallback(({ children }: BaseProps) => {
    if (!isLoadingUser && profile?.isStaff) {
      return children;
    }

    return (
      <div className="flex flex-col gap-4">
        <Typography>You are not authorized to access this page</Typography>
      </div>
    )
  }, [profile?.isStaff, isLoadingUser]);

  return (
    <PageBody padding="md" height="fit">
      <PageBody.Breadcrumb>
        <PageBody.Breadcrumb.Item>
          Control panel
        </PageBody.Breadcrumb.Item>
        <PageBody.Breadcrumb.Item>
          Staff screen
        </PageBody.Breadcrumb.Item>
      </PageBody.Breadcrumb>

      <PageBody.Content flex gap={5} padding="md">
        <UnauthorizedUsers>
          Content
        </UnauthorizedUsers>
      </PageBody.Content>
    </PageBody>
  );
}
