import { FaEdit, FaExternalLinkAlt } from "react-icons/fa";
import Button from "@/components/ui/Button";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import PageBody from "@/components/ui/PageBody";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import PaginatedRecords from "@/types/PaginatedRecords";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import EditTenantModal from "./EditTenantModal";
import TenantModal from "./TenantModal";
import TenantDetails from "./TenantDetails";
import DashBoardBody from "../DashBoardBody";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import PaginatedContent from "../PaginatedContent";
import ListItem from "@/components/ui/ListItem";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";
import useSuspenseError from "@/hooks/use-suspense-error";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/states/store";
import { FaRegStar, FaStar } from "react-icons/fa6";
import { setTenantInfo } from "@/states/tenant.state";
import { SlOrganization } from "react-icons/sl";
import { Link } from "react-router";

type Tenant = components["schemas"]["Tenant"];

export default function Tenants() {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);

  const { parseHttpError } = useSuspenseError();

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const dispatch = useDispatch();

  const {
    isLoadingUser,
    isAuthenticated,
    getAccessTokenSilently,
    hasEnoughPermissions,
  } = useProfile({
    roles: [MycRole.TenantManager],
    permissions: [MycPermission.Read, MycPermission.Write],
  });

  const {
    skip,
    pageSize,
    setSkip,
    setPageSize,
    searchTerm,
    setSearchTerm,
  } = useSearchBarParams({
    initialSkip: 0,
    initialPageSize: 10,
  });

  const memoizedUrl = useMemo(() => {
    if (!isAuthenticated) return null;
    if (!hasEnoughPermissions) return null;

    let searchParams: Record<string, string> = {};

    if (skip) searchParams.skip = skip.toString();
    if (searchTerm && searchTerm !== "") searchParams.name = searchTerm;
    if (pageSize) searchParams.pageSize = pageSize.toString();

    return buildPath("/adm/su/managers/tenants", {
      query: searchParams
    });
  }, [searchTerm, skip, pageSize, isAuthenticated, hasEnoughPermissions]);

  const {
    data: tenants,
    isLoading: isLoadingTenants,
    mutate: mutateTenants,
  } = useSWR<PaginatedRecords<Tenant>>(
    memoizedUrl,
    async (url: string) => {
      const token = await getAccessTokenSilently();

      return await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      })
        .then(parseHttpError)
        .catch(console.error);
    },
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      refreshInterval: 1000 * 60,
    }
  );

  const setTokenPublicInformation = useCallback(async (tenantId: string | null | undefined) => {
    if (!tenantId) return;

    if (tenantInfo?.id === tenantId) {
      dispatch(setTenantInfo(null));
      return;
    };

    const token = await getAccessTokenSilently();

    await fetch(
      buildPath(
        "/adm/rs/beginners/tenants/{tenant_id}",
        { path: { tenant_id: tenantId } }
      ),
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((res) => res.json())
      .then((data) => dispatch(setTenantInfo(data)))
      .catch((err) => console.error(err));
  }, [tenantInfo, getAccessTokenSilently]);

  const onSubmit = (term?: string, _?: string) => {
    setSkip(0);

    if (term !== undefined) setSearchTerm(term);

    mutateTenants(tenants, { rollbackOnError: true });
  }

  const handleCloseModal = () => {
    setIsNewModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setCurrentTenant(null);
    mutateTenants(tenants, { rollbackOnError: true });
  }

  const handleSuccess = () => {
    handleCloseModal();
    mutateTenants(tenants, { rollbackOnError: true });
  }

  const handleViewTenantClick = (tenant: Tenant) => {
    Promise.resolve()
      .then(() => setCurrentTenant(tenant))
      .then(() => setIsViewModalOpen(true));
  }

  const handleEditTenantClick = (tenant: Tenant) => {
    Promise.resolve()
      .then(() => setCurrentTenant(tenant))
      .then(() => setIsEditModalOpen(true));
  }

  return (
    <DashBoardBody
      breadcrumb={
        <PageBody.Breadcrumb.Item icon={SlOrganization}>
          Tenants
        </PageBody.Breadcrumb.Item>
      }
      onSubmit={onSubmit}
      setSkip={setSkip}
      setPageSize={setPageSize}
      isLoading={isLoadingUser}
      authorized={hasEnoughPermissions}
    >
      <div id="TenantsContent" className="flex flex-col justify-center gap-4 w-full mx-auto">
        <div className="flex justify-start mx-auto w-full xl:max-w-4xl">
          <Button
            onClick={() => setIsNewModalOpen(true)}
            size="sm"
            rounded="full"
            intent="link"
            disabled={!hasEnoughPermissions}
          >
            <span className="mx-2">Create tenant</span>
          </Button>
        </div>

        <PaginatedContent
          isLoading={isLoadingTenants}
          records={tenants}
          mutation={mutateTenants}
          skip={skip}
          setSkip={setSkip}
          pageSize={pageSize}
        >
          {tenants?.records?.map((tenant) => (
            <ListItem key={tenant?.id}>
              <div className="flex justify-between gap-3 group">
                <Typography as="h3" highlight>
                  <div className="flex items-center gap-3">
                    <button
                      title="View tenant basic details"
                      className="hover:underline text-blue-500 dark:text-lime-400"
                      onClick={() => handleViewTenantClick(tenant)}
                    >
                      {tenant?.name}
                    </button>
                    <span className="cursor-pointer">
                      {tenantInfo?.id === tenant.id ? (
                        <FaStar
                          className="text-yellow-300"
                          onClick={() => setTokenPublicInformation(tenant.id)}
                        />
                      ) : (
                        <FaRegStar
                          className="text-gray-500 group-hover:text-yellow-300 hidden group-hover:block"
                          onClick={() => setTokenPublicInformation(tenant.id)}
                        />
                      )}
                    </span>

                    <Link
                      to={`/dashboard/tenants/${tenant.id}`}
                      title="View tenant advanced details"
                      className="cursor-pointer hidden group-hover:block"
                    >
                      <FaExternalLinkAlt size={16} />
                    </Link>
                  </div>
                </Typography>
                <div className="flex gap-5">
                  <CopyToClipboard text={tenant?.id ?? ""} />
                  <FaEdit
                    className="cursor-pointer hover:text-blue-500 dark:hover:text-lime-400"
                    onClick={() => handleEditTenantClick(tenant)}
                  />
                </div>
              </div>
              <Typography as="span">{tenant?.description}</Typography>
            </ListItem>
          ))}
        </PaginatedContent>
      </div>

      {isViewModalOpen && currentTenant && (
        <TenantDetails
          isOpen={isViewModalOpen}
          onClose={handleCloseModal}
          tenant={currentTenant}
        />
      )}

      <TenantModal
        isOpen={isNewModalOpen}
        tenant={currentTenant}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />

      {isEditModalOpen && currentTenant && (
        <EditTenantModal
          isOpen={isEditModalOpen}
          tenant={currentTenant}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </DashBoardBody>
  );
}
