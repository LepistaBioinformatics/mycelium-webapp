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
      revalidateOnMount: false,
      refreshInterval: 1000 * 60,
    }
  );

  const onSubmit = (term?: string, _?: string) => {
    setSkip(0);

    if (term) setSearchTerm(term);

    mutateTenants(tenants, { rollbackOnError: true });
  }

  const handleCloseModal = () => {
    setIsNewModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setCurrentTenant(null);
  }

  const handleSuccess = () => {
    handleCloseModal();
    mutateTenants();
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
    <PageBody padding="md" height="fit">
      <PageBody.Breadcrumb>
        <PageBody.Breadcrumb.Item>
          Control panel
        </PageBody.Breadcrumb.Item>
        <PageBody.Breadcrumb.Item>
          Tenants
        </PageBody.Breadcrumb.Item>
      </PageBody.Breadcrumb>

      <PageBody.Content padding="md">
        <SearchBar
          fullWidth
          onSubmit={onSubmit}
          setSkip={setSkip}
          setPageSize={setPageSize}
        />

        <UnauthorizedUsers>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-start">
              <Button
                onClick={() => setIsNewModalOpen(true)}
                size="sm"
                rounded="full"
                intent="info"
              >
                Create tenant
              </Button>
            </div>

            <div className="flex gap-4 w-full justify-between items-start">
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
              <div className="flex flex-wrap gap-4 w-full">
                {tenants?.records?.map((tenant) => (
                  <div
                    key={tenant?.id}
                    className="flex flex-col text-left gap-2 border px-4 py-2 rounded-md w-full bg-slate-100 dark:bg-slate-800"
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
