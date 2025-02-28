"use client";

import { FaEdit } from "react-icons/fa";
import Button from "@/components/ui/Button";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import PageBody from "@/components/ui/PageBody";
import SearchBar from "@/components/ui/SearchBar";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import PaginatedRecords from "@/types/PaginatedRecords";
import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import EditTenantModal from "./EditTenantModal";
import TenantModal from "./TenantModal";
import TenantDetails from "./TenantDetails";

type Tenant = components["schemas"]["Tenant"];

export default function Tenants() {
  const { profile, isLoadingUser } = useProfile();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const [skip, setSkip] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);

  const memoizedUrl = useMemo(() => {
    if (!isAuthenticated) return null;

    let searchParams: Record<string, string> = {};

    if (skip) searchParams.skip = skip.toString();
    if (searchTerm && searchTerm !== "") searchParams.name = searchTerm;
    if (pageSize) searchParams.pageSize = pageSize.toString();

    return buildPath("/adm/su/managers/tenants", {
      query: searchParams
    });
  }, [searchTerm, skip, pageSize, isAuthenticated]);

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
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch tenants");
          }

          return res.json();
        })
        .catch((err) => {
          console.error(err);
        });
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      refreshInterval: 1000 * 60,
    }
  );

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

  const UnauthorizedUsers = useCallback(({ children }: BaseProps) => {
    if (!isLoadingUser && (profile?.isStaff || profile?.isManager)) {
      return children;
    }

    return (
      <div className="flex flex-col gap-4">
        <Typography>You are not authorized to access this page</Typography>
      </div>
    )
  }, [profile?.isStaff, isLoadingUser]);

  return (
    <PageBody padding="md">
      <PageBody.Breadcrumb>
        <PageBody.Breadcrumb.Item>
          Control panel
        </PageBody.Breadcrumb.Item>
        <PageBody.Breadcrumb.Item>
          Tenants
        </PageBody.Breadcrumb.Item>
      </PageBody.Breadcrumb>

      <PageBody.Content padding="md" container flex wrap gap={3}>
        <SearchBar
          onSubmit={onSubmit}
          setSkip={setSkip}
          setPageSize={setPageSize}
        />

        <UnauthorizedUsers>
          <div id="TenantsContent" className="flex flex-col justify-center gap-4 w-full mx-auto">
            <div className="flex justify-start mx-auto w-full xl:max-w-4xl">
              <Button
                onClick={() => setIsNewModalOpen(true)}
                size="sm"
                rounded="full"
                intent="info"
              >
                <span className="mx-2">Create tenant</span>
              </Button>
            </div>

            <div className="flex gap-4 justify-center mx-auto w-full xl:max-w-4xl items-start">
              <div className="text-left gap-4 w-full">
                {tenants?.records.length === 0 ? (
                  <Typography as="small">No tenants found</Typography>
                ) : (
                  <Typography as="small">{tenants?.count ?? 0} tenants found</Typography>
                )}
              </div>
            </div>

            {isLoadingTenants ? (
              <Typography>Loading...</Typography>
            ) : (
              <div className="flex flex-col gap-4 w-full mb-24">
                {tenants?.records?.map((tenant) => (
                  <div
                    key={tenant?.id}
                    className="flex flex-col text-left gap-2 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-md mx-auto w-full xl:max-w-4xl bg-slate-100 dark:bg-slate-800"
                  >
                    <div className="flex justify-between gap-3">
                      <Typography as="h3">
                        <button
                          className="hover:underline text-blue-500 dark:text-lime-400"
                          onClick={() => handleViewTenantClick(tenant)}
                        >
                          {tenant?.name}
                        </button>
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
                  </div>
                ))}
              </div>
            )}
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
        </UnauthorizedUsers>
      </PageBody.Content>
    </PageBody>
  );
}
