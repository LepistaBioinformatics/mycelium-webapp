import AuthorizedOr from "@/components/ui/AuthorizedOr";
import PageBody from "@/components/ui/PageBody";
import useProfile from "@/hooks/use-profile";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { useEffect } from "react";
import { useParams } from "react-router";
import ControlPanelBreadcrumbItem from "../ControlPanelBreadcrumbItem";
import { SlOrganization } from "react-icons/sl";

export default function AdvancedManagement() {
  const {
    profile,
    hasEnoughPermissions,
    isLoadingUser,
    isLoadingProfile,
    getAccessTokenSilently
  } = useProfile({
    roles: [MycRole.TenantManager, MycRole.TenantOwner],
    permissions: [MycPermission.Read, MycPermission.Write, MycPermission.ReadWrite],
    restrictSystemAccount: true,
  });

  const params = useParams();

  useEffect(() => {
    if (!params.tenantId) return;

    console.log(params.tenantId);
  }, [params.tenantId]);

  return (
    <PageBody padding="md">
      <PageBody.Breadcrumb>
        <ControlPanelBreadcrumbItem />
        <PageBody.Breadcrumb.Item href="/dashboard/tenants" icon={SlOrganization}>
          Tenants
        </PageBody.Breadcrumb.Item>
        <PageBody.Breadcrumb.Item>
          Advanced Management
        </PageBody.Breadcrumb.Item>
      </PageBody.Breadcrumb>

      <PageBody.Content>
        <AuthorizedOr
          authorized={hasEnoughPermissions}
          isLoading={isLoadingUser || isLoadingProfile}
        >
          <div>
            <h1>Advanced Management</h1>
          </div>
        </AuthorizedOr>
      </PageBody.Content>
    </PageBody>
  )
}
