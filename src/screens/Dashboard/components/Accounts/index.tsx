import PageBody from "@/components/ui/PageBody";
import useProfile from "@/hooks/use-profile";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { useMemo, useState } from "react";
import useSWR from "swr";
import DashBoardBody from "../DashBoardBody";
import PaginatedRecords from "@/types/PaginatedRecords";
import Button from "@/components/ui/Button";
import PaginatedContent from "../PaginatedContent";
import Typography from "@/components/ui/Typography";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import { useSelector } from "react-redux";
import { RootState } from "@/states/store";
import { TENANT_ID_HEADER } from "@/constants/http-headers";
import AccountType from "@/components/AccountType";
import Owners from "@/components/Owners";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import ListItem from "@/components/ui/ListItem";
import Banner from "@/components/ui/Banner";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";
import AccountModal from "./AccountModal";
import AccountDetails from "./AccountDetails";

type Account = components["schemas"]["Account"];

export default function Accounts() {
  const {
    isLoadingUser,
    isAuthenticated,
    getAccessTokenSilently,
    hasEnoughPermissions,
  } = useProfile({
    roles: [MycRole.SubscriptionsManager],
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

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const memoizedUrl = useMemo(() => {
    if (!isAuthenticated) return null;
    if (!tenantInfo) return null;
    if (!hasEnoughPermissions) return null;

    let searchParams: Record<string, string> = {};

    if (skip) searchParams.skip = skip.toString();
    if (searchTerm && searchTerm !== "") searchParams.term = searchTerm;
    if (pageSize) searchParams.pageSize = pageSize.toString();

    return buildPath("/adm/rs/subscriptions-manager/accounts", {
      query: searchParams
    });
  }, [
    searchTerm,
    skip,
    pageSize, isAuthenticated,
    hasEnoughPermissions,
    tenantInfo
  ]);

  const {
    data: accounts,
    isLoading: isLoadingAccounts,
    mutate: mutateAccounts,
  } = useSWR<PaginatedRecords<Account>>(
    memoizedUrl,
    async (url: string) => {
      const token = await getAccessTokenSilently();

      return await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          [TENANT_ID_HEADER]: tenantInfo?.id ?? "",
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
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      refreshInterval: 1000 * 60,
    }
  );

  const handleCloseModal = () => {
    setIsNewModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setCurrentAccount(null);
    mutateAccounts(accounts, { rollbackOnError: true });
  }

  const handleSuccess = () => {
    handleCloseModal();
    mutateAccounts(accounts, { rollbackOnError: true });
  }

  const onSubmit = (term?: string, _?: string) => {
    setSkip(0);

    if (term !== undefined) setSearchTerm(term);

    mutateAccounts(accounts, { rollbackOnError: true });
  }

  return (
    <DashBoardBody
      breadcrumb={
        <PageBody.Breadcrumb.Item>
          Accounts
        </PageBody.Breadcrumb.Item>
      }
      onSubmit={onSubmit}
      setSkip={setSkip}
      setPageSize={setPageSize}
      placeholder="INCLUIR OUTROS PARAMETROS DE FILTRAGE, IGUAL AOS ERROR CODES!!!!!!"
      isLoading={isLoadingUser}
      authorized={hasEnoughPermissions}
    >
      <div id="AccountsContent" className="flex flex-col justify-center gap-4 w-full mx-auto">
        <div className="flex justify-start mx-auto w-full xl:max-w-4xl">
          <Button
            onClick={() => setIsNewModalOpen(true)}
            size="sm"
            rounded="full"
            intent="info"
            disabled={!tenantInfo}
          >
            <span className="mx-2">Create account</span>
          </Button>
        </div>

        {tenantInfo
          ? (
            <PaginatedContent
              isLoading={isLoadingAccounts}
              records={accounts}
              mutation={mutateAccounts}
              skip={skip}
              setSkip={setSkip}
              pageSize={pageSize}
            >
              {accounts?.records?.map((account) => (
                <ListItem key={account?.id}>
                  <div className="flex justify-between gap-3">
                    <Typography as="h3">
                      <button
                        className="hover:underline text-blue-500 dark:text-lime-400 flex items-center gap-2"
                        onClick={() => {
                          setCurrentAccount(account);
                          setIsViewModalOpen(true);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {account?.name}
                        </div>
                        {account.isDefault && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            (Default)
                          </span>
                        )}
                      </button>
                    </Typography>
                    <div className="flex gap-5">
                      <CopyToClipboard text={account?.id ?? ""} />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    Type: <AccountType account={account} />
                  </div>

                  <Owners account={account} />

                  <Typography as="small" decoration="smooth">
                    Created: {formatDDMMYY(new Date(account.created), true)}
                  </Typography>
                </ListItem>
              ))}
            </PaginatedContent>
          ) : (
            <NoTenant />
          )}
      </div>

      {isViewModalOpen && currentAccount && (
        <AccountDetails
          isOpen={isViewModalOpen}
          onClose={handleCloseModal}
          account={currentAccount}
        />
      )}

      <AccountModal
        isOpen={isNewModalOpen}
        account={currentAccount}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />
    </DashBoardBody>
  );
}

function NoTenant() {
  return (
    <>
      <Banner title="No tenant selected" width="full" intent="warning">
        <Typography as="span">
          Before view or create an account, you need to select a tenant in <a href="/dashboard/tenants" className="text-blue-500 dark:text-lime-400 hover:underline">Tenants screen</a>.
        </Typography>
      </Banner>
    </>
  )
}
