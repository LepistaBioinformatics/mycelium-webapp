import PageBody from "@/components/ui/PageBody";
import useProfile from "@/hooks/use-profile";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { useMemo } from "react";
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
import { Tooltip } from "flowbite-react";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";

type Account = components["schemas"]["Account"];

export default function Accounts() {
  const {
    profile,
    isLoadingUser,
    isAuthenticated,
    getAccessTokenSilently,
  } = useProfile();

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

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const memoizedUrl = useMemo(() => {
    if (!isAuthenticated) return null;

    let searchParams: Record<string, string> = {};

    if (skip) searchParams.skip = skip.toString();
    if (searchTerm && searchTerm !== "") searchParams.name = searchTerm;
    if (pageSize) searchParams.pageSize = pageSize.toString();

    return buildPath("/adm/rs/subscriptions-manager/accounts", {
      query: searchParams
    });
  }, [searchTerm, skip, pageSize, isAuthenticated]);

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
      authorized={!isLoadingUser && (profile?.isStaff || profile?.isManager)}
    >
      <div id="AccountsContent" className="flex flex-col justify-center gap-4 w-full mx-auto">
        <div className="flex justify-start mx-auto w-full xl:max-w-4xl">
          <Button
            onClick={() => console.log("clicked")}
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
                <div
                  key={account?.id}
                  className="flex flex-col text-left gap-2 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-md mx-auto w-full xl:max-w-4xl bg-slate-100 dark:bg-slate-800"
                >
                  <div className="flex justify-between gap-3">
                    <Typography as="h3">
                      <button
                        className="hover:underline text-blue-500 dark:text-lime-400 flex items-center gap-2"
                        onClick={() => console.log(account)}
                      >
                        <div className="flex items-center gap-2">
                          {account?.name}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            <AccountType account={account} />
                          </span>
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
                  <Owners account={account} />

                  <div className="text-sm">
                    <Tooltip content="Created on" className="px-4">
                      {formatDDMMYY(new Date(account.created), true)}
                    </Tooltip>
                  </div>
                </div>
              ))}
            </PaginatedContent>
          ) : (
            <NoTenant />
          )}
      </div>
    </DashBoardBody>
  );
}

function NoTenant() {
  return (
    <div className="flex flex-col text-left gap-2 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-md mx-auto w-full xl:max-w-4xl bg-slate-100 dark:bg-slate-800">
      <Typography as="h3">No tenant found</Typography>
      <Typography as="span">
        Before view or create an account, you need to select a tenant
      </Typography>
    </div>
  )
}
