import useProfile from "@/hooks/use-profile";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { useCallback, useEffect, useMemo } from "react";
import useSWR from "swr";
import DashBoardBody from "../DashBoardBody";
import PaginatedRecords from "@/types/PaginatedRecords";
import PaginatedContent from "../PaginatedContent";
import Typography from "@/components/ui/Typography";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import { TENANT_ID_HEADER } from "@/constants/http-headers";
import AccountType from "@/components/AccountType";
import Owners from "@/components/Owners";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import ListItem from "@/components/ui/ListItem";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";
import { projectVariants } from "@/constants/shared-component-styles";
import SearchBar from "@/components/ui/SearchBar";
import useSuspenseError from "@/hooks/use-suspense-error";

const { padding } = projectVariants;

type Account = components["schemas"]["Account"];

interface Props {
  tenantId?: string;
  toolbar?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  initialSkip?: number;
  initialPageSize?: number;
  handleClickOnAccount?: (account: Account) => void;
  padding?: keyof typeof padding;
  tiny?: boolean;
  forceMutate?: Date | null;
  restrictAccountTypeTo?: ("subscription" | "roleAssociated" | "actorAssociated" | "tenantManager")[];
}

const COMMANDS = {
  accountType: {
    user: {
      brief: "Select User accounts",
      command: "/user",
      description: "Action restricted to manager or staff users",
      adminOnly: true,
      tenantNeeded: false,
    },
    manager: {
      brief: "Select Manager accounts",
      command: "/manager",
      description: "Action restricted to manager or staff users",
      adminOnly: true,
      tenantNeeded: false,
    },
    staff: {
      brief: "Select Staff accounts",
      command: "/staff",
      description: "Action restricted to manager or staff users",
      adminOnly: true,
      tenantNeeded: false,
    },
    subscription: {
      brief: "Select Subscription accounts",
      command: "/subscription",
      description: "Action restricted to subscriptions-manager users. Disabled if tenant is not selected",
      adminOnly: false,
      tenantNeeded: true,
    },
    roleAssociated: {
      brief: "Select Role Associated accounts",
      command: "/roleAssociated",
      description: "Action restricted to subscriptions-manager users. Disabled if tenant is not selected",
      adminOnly: false,
      tenantNeeded: true,
    },
    actorAssociated: {
      brief: "Select Actor Associated accounts",
      command: "/actorAssociated",
      description: "Action restricted to subscriptions-manager users. Disabled if tenant is not selected",
      adminOnly: false,
      tenantNeeded: false,
    },
    tenantManager: {
      brief: "Select Tenant Manager accounts",
      command: "/tenantManager",
      description: "Action restricted to subscriptions-manager users. Disabled if tenant is not selected",
      adminOnly: false,
      tenantNeeded: true,
    },
  },
  status: {
    unverified: {
      brief: "Select Unverified accounts",
      command: "/unverified",
      description: "Action restricted to subscriptions-manager users. Disabled if tenant is not selected",
      adminOnly: false,
      tenantNeeded: true,
    },
    verified: {
      brief: "Select Verified accounts",
      command: "/verified",
      description: "Action restricted to subscriptions-manager users. Disabled if tenant is not selected",
      adminOnly: false,
      tenantNeeded: true,
    },
    inactive: {
      brief: "Select Inactive accounts",
      command: "/inactive",
      description: "Action restricted to subscriptions-manager users. Disabled if tenant is not selected",
      adminOnly: false,
      tenantNeeded: true,
    },
    archived: {
      brief: "Select Archived accounts",
      command: "/archived",
      description: "Action restricted to subscriptions-manager users. Disabled if tenant is not selected",
      adminOnly: false,
      tenantNeeded: true,
    },
  },
}

export default function PaginatedAccounts({
  tenantId,
  toolbar,
  breadcrumb,
  handleClickOnAccount,
  initialSkip,
  initialPageSize,
  tiny,
  forceMutate,
  restrictAccountTypeTo,
}: Props) {
  const { parseError } = useSuspenseError();

  const {
    isLoadingUser,
    isAuthenticated,
    getAccessTokenSilently,
    hasEnoughPermissions,
  } = useProfile({
    roles: [MycRole.SubscriptionsManager],
    permissions: [MycPermission.Read, MycPermission.Write],
    restrictSystemAccount: true,
  });

  const {
    skip,
    pageSize,
    setSkip,
    setPageSize,
    searchTerm,
    setSearchTerm,
  } = useSearchBarParams({
    initialSkip,
    initialPageSize,
  });

  const memoizedUrl = useMemo(() => {
    if (!isAuthenticated) return null;
    if (!hasEnoughPermissions) return null;

    let searchParams: Record<string, string> = {};

    if (skip) searchParams.skip = skip.toString();
    if (pageSize) searchParams.pageSize = pageSize.toString();

    if (searchTerm && searchTerm !== "") {
      //
      // Handle tag
      //
      // Tag is a single word starting with a #. It is optional and all text
      // after the # should be split by spaces and only the first word should be
      // used as the prefix.
      //
      const tagValuePattern = /^(#.*)$/;
      const tagValuePatternTest = tagValuePattern.test(searchTerm);

      if (tagValuePatternTest && !restrictAccountTypeTo) {
        const [_, tagValue] = searchTerm.split("=");
        if (tagValue) searchParams.tagValue = tagValue;
      }

      //
      // Handle status
      //
      // Status options should be:
      // - unverified
      // - verified
      // - inactive
      // - archived
      //
      // The status should be optional and the default should be unverified.
      //
      // Match /unverified, /verified, /inactive, /archived
      //
      const statusPattern = /(\/unverified|\/verified|\/inactive|\/archived)/;

      if (statusPattern.test(searchTerm) && !restrictAccountTypeTo) {
        const statusValue = statusPattern.exec(searchTerm)?.[1];
        if (statusValue) searchParams.status = statusValue?.replace("/", "");
      }

      //
      // Handle account type
      //
      // Account type options should be:
      // - staff
      // - manager
      // - user
      // - subscription
      // - roleAssociated
      // - actorAssociated
      // - tenantManager
      //
      // The account type should be optional and the default should be user.
      //
      // Match /staff, /manager, /user, /subscription, /roleAssociated, /actorAssociated, /tenantManager
      //
      const typePattern = /(\/staff|\/manager|\/user|\/subscription|\/roleAssociated|\/actorAssociated|\/tenantManager)/;

      if (typePattern.test(searchTerm)) {
        const typeValue = typePattern.exec(searchTerm)?.[1];
        if (typeValue) {
          const parsedValue = typeValue?.replace("/", "");

          //
          // Try to match patterns like:
          // - "/actorAssociated guests-manager"
          // - "/actorAssociated gateway-manager"
          // - "/actorAssociated any-other-actor-with-no-spaces"
          //
          if (parsedValue === "actorAssociated") {
            const actorNamePattern = /\/actorAssociated\s(\w+)/;
            const actorNameMatch = searchTerm.match(actorNamePattern);

            if (actorNameMatch) {
              const actorName = actorNameMatch[1];
              if (actorName) searchParams.actor = actorName?.trim();
            }
          }

          searchParams.accountType = parsedValue;
        };
      }

      //
      // Handle text that not match any of the above patterns
      //
      // Extract all text that not match any of the above patterns. Example:
      // /staff /verified /user text -> text
      //
      let simpleText = searchTerm;

      [COMMANDS.accountType, COMMANDS.status].forEach((item) => {
        Object.values(item).forEach((command) => {
          simpleText = simpleText.replace(command.command, "")?.trim();
        });
      });

      if (simpleText && !searchParams?.actor) searchParams.term = simpleText;
    }

    if (restrictAccountTypeTo) {
      //
      // If none of the allowed account types is in the search params, add the first allowed
      // account type to the search params.
      //
      const { accountType: accountTypeParam } = searchParams;

      if (!accountTypeParam) {
        searchParams.accountType = restrictAccountTypeTo.at(0) as any;
      } else if (!restrictAccountTypeTo.includes(accountTypeParam as any)) {
        searchParams.accountType = restrictAccountTypeTo.at(0) as any;
      }
    }

    return buildPath("/adm/rs/subscriptions-manager/accounts", {
      query: searchParams
    });
  }, [
    searchTerm,
    skip,
    pageSize,
    isAuthenticated,
    restrictAccountTypeTo,
    hasEnoughPermissions,
    tenantId,
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
          ...(tenantId ? { [TENANT_ID_HEADER]: tenantId } : {}),
        },
      })
        .then(parseError)
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

  /**
   * Mutate accounts when tenantId changes.
   */
  useEffect(() => {
    if (tenantId) mutateAccounts(accounts, { rollbackOnError: true });
  }, [tenantId]);

  /**
   * Mutate accounts when forceMutate changes.
   */
  useEffect(() => {
    if (forceMutate) mutateAccounts(accounts, { rollbackOnError: true });
  }, [forceMutate, mutateAccounts, accounts]);

  const onSubmit = (term?: string, _?: string) => {
    setSkip(0);

    if (term !== undefined) setSearchTerm(term);

    mutateAccounts(accounts, { rollbackOnError: true });
  }

  const AccountHeader = useCallback(({ account }: { account: Account }) => {
    if (handleClickOnAccount) {
      return (
        <button
          className="hover:underline text-blue-500 dark:text-lime-400 flex items-center gap-2"
          onClick={() => handleClickOnAccount(account)}
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
      );
    };

    return (
      <>
        <div className="flex items-center gap-2">
          {account?.name}
        </div>
        {account.isDefault && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            (Default)
          </span>
        )}
      </>
    )
  }, [handleClickOnAccount]);

  return (
    <DashBoardBody
      tiny={tiny}
      term={searchTerm ?? undefined}
      breadcrumb={breadcrumb}
      onSubmit={onSubmit}
      setSkip={setSkip}
      setPageSize={setPageSize}
      placeholder="Search by name or use command palette"
      isLoading={isLoadingUser}
      authorized={hasEnoughPermissions}
      padding={padding}
      commandPalette={(
        <SearchBar.Content>
          <div className="flex flex-col gap-1">
            <Typography as="h4" decoration="smooth">Account Type Filters</Typography>
            {Object.entries(COMMANDS.accountType)
              ?.filter(([_, value]) => !restrictAccountTypeTo || restrictAccountTypeTo.includes(value.command.replace("/", "") as any))
              ?.map(([key, value]) => (
                <SearchBar.Item
                  key={key}
                  brief={value.brief}
                  command={value.command}
                  description={value?.description}
                  onClick={() => setSearchTerm(value.command)}
                  disabled={(value.adminOnly && !hasEnoughPermissions) || value.tenantNeeded && !tenantId}
                />
              ))}
          </div>

          {!restrictAccountTypeTo && (
            <div className="flex flex-col gap-1">
              <Typography as="h4" decoration="smooth">Account Status Filters</Typography>
              {Object.entries(COMMANDS.status).map(([key, value]) => (
                <SearchBar.Item
                  key={key}
                  brief={value.brief}
                  command={value.command}
                  description={value?.description}
                  onClick={() => setSearchTerm(value.command)}
                  disabled={(value.adminOnly && !hasEnoughPermissions) || value.tenantNeeded && !tenantId}
                />
              ))}
            </div>
          )}
        </ SearchBar.Content>
      )}
    >
      <div id="AccountsContent" className="flex flex-col justify-center gap-4 w-full mx-auto">
        {/* {error && (
          <div className="flex justify-start mx-auto w-full xl:max-w-4xl">
            <Banner intent="error" title={typeof error === "object" ? error.code : "Error"} >
              {typeof error === "object" ? error.msg : error}
            </Banner>
          </div>
        )} */}

        {toolbar}

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
                <Typography as="h3" truncate>
                  <AccountHeader account={account} />
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
      </div>
    </DashBoardBody>
  );
}
