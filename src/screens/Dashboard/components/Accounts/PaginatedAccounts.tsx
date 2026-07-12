import useProfile from "@/hooks/use-profile";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import { components } from "@/services/openapi/mycelium-schema";
import {
  accountsList,
  accountsListMerged,
  AccountsListParams,
} from "@/services/rpc/subscriptionsManager";
import { useEffect, useMemo } from "react";
import useSWR from "swr";
import DashBoardBody from "../DashBoardBody";
import PaginatedRecords from "@/types/PaginatedRecords";
import PaginatedContent from "../PaginatedContent";
import Typography from "@/components/ui/Typography";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import AccountType from "@/components/AccountType";
import Owners from "@/components/Owners";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import ListItem from "@/components/ui/ListItem";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";
import { projectVariants } from "@/constants/shared-component-styles";
import SearchBar from "@/components/ui/SearchBar";
import { useSelector } from "react-redux";
import { RootState } from "@/states/store";
import { useTranslation } from "react-i18next";
import IntroSection from "@/components/ui/IntroSection";
import { Link, useLocation } from "react-router";

const { padding } = projectVariants;

type Account = components["schemas"]["Account"];

export interface PaginatedAccountsProps {
  tenantId?: string;
  toolbar?: React.ReactNode;
  omitToolbar?: boolean;
  omitNamespaceInfo?: boolean;
  breadcrumb?: React.ReactNode;
  initialSkip?: number;
  initialPageSize?: number;
  padding?: keyof typeof padding;
  forceMutate?: Date | null;
  restrictAccountTypeTo?: (
    | "subscription"
    | "actorAssociated"
    | "roleAssociated"
    | "tenantManager"
    | "user"
    | "manager"
    | "staff"
  )[];
}

const COMMANDS = {
  accountType: {
    subscription: {
      brief: "Select Subscription accounts",
      command: "/subscription",
      description:
        "Action restricted to subscriptions-manager users. Disabled if tenant is not selected",
      adminOnly: false,
      tenantNeeded: true,
    },
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
    actorAssociated: {
      brief: "Select Actor Associated accounts",
      command: "/actorAssociated",
      description:
        "Action restricted to subscriptions-manager users. Disabled if tenant is not selected",
      adminOnly: false,
      tenantNeeded: false,
    },
    tenantManager: {
      brief: "Select Tenant Manager accounts",
      command: "/tenantManager",
      description:
        "Action restricted to subscriptions-manager users. Disabled if tenant is not selected",
      adminOnly: false,
      tenantNeeded: true,
    },
    roleAssociated: {
      brief: "Select Role Associated accounts",
      command: "/roleAssociated",
      description:
        "Action restricted to subscriptions-manager users. Disabled if tenant is not selected",
      adminOnly: false,
      tenantNeeded: false,
    },
  },
  status: {
    unverified: {
      brief: "Select Unverified accounts",
      command: "/unverified",
      description:
        "Action restricted to subscriptions-manager users. Disabled if tenant is not selected",
      adminOnly: false,
      tenantNeeded: true,
    },
    verified: {
      brief: "Select Verified accounts",
      command: "/verified",
      description:
        "Action restricted to subscriptions-manager users. Disabled if tenant is not selected",
      adminOnly: false,
      tenantNeeded: true,
    },
    inactive: {
      brief: "Select Inactive accounts",
      command: "/inactive",
      description:
        "Action restricted to subscriptions-manager users. Disabled if tenant is not selected",
      adminOnly: false,
      tenantNeeded: true,
    },
    archived: {
      brief: "Select Archived accounts",
      command: "/archived",
      description:
        "Action restricted to subscriptions-manager users. Disabled if tenant is not selected",
      adminOnly: false,
      tenantNeeded: true,
    },
  },
};

export default function PaginatedAccounts({
  tenantId,
  toolbar,
  omitToolbar,
  omitNamespaceInfo,
  breadcrumb,
  initialSkip,
  initialPageSize,
  forceMutate,
  restrictAccountTypeTo,
}: PaginatedAccountsProps) {
  const { t } = useTranslation();

  const location = useLocation();

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const {
    isLoadingUser,
    isAuthenticated,
    getAccessTokenSilently,
    hasEnoughPermissions,
  } = useProfile({
    tenantOwnerNeeded: [tenantInfo?.id ?? ""],
    roles: [MycRole.TenantManager, MycRole.SubscriptionsManager],
    permissions: [MycPermission.Read],
    restrictSystemAccount: true,
  });

  const { skip, pageSize, setSkip, searchTerm, setSearchTerm } =
    useSearchBarParams({
      initialSkip,
      initialPageSize,
    });

  const rpcParams = useMemo((): AccountsListParams | null => {
    if (!isAuthenticated) return null;
    if (!hasEnoughPermissions) return null;

    const params: AccountsListParams = {};

    if (skip) params.skip = skip;
    if (pageSize) params.pageSize = pageSize;
    if (tenantId) params.tenantId = tenantId;

    if (searchTerm && searchTerm !== "") {
      const tagValuePattern = /^(#.*)$/;
      const tagValuePatternTest = tagValuePattern.test(searchTerm);

      if (tagValuePatternTest && !restrictAccountTypeTo) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, tagValue] = searchTerm.split("=");
        if (tagValue) params.tagValue = tagValue;
      }

      const statusPattern = /(\/unverified|\/verified|\/inactive|\/archived)/;

      if (statusPattern.test(searchTerm) && !restrictAccountTypeTo) {
        const statusValue = statusPattern.exec(searchTerm)?.[1];
        if (statusValue) params.status = statusValue?.replace("/", "");
      }

      const typePattern =
        /(\/staff|\/manager|\/user|\/subscription|\/actorAssociated|\/tenantManager|\/roleAssociated)/;

      if (typePattern.test(searchTerm)) {
        const typeValue = typePattern.exec(searchTerm)?.[1];
        if (typeValue) {
          const parsedValue = typeValue?.replace("/", "");

          if (parsedValue === "actorAssociated") {
            const actorNamePattern = /\/actorAssociated\s(\w+)/;
            const actorNameMatch = searchTerm.match(actorNamePattern);

            if (actorNameMatch) {
              const actorName = actorNameMatch[1];
              if (actorName) params.actor = actorName?.trim();
            }
          }

          params.accountType = parsedValue;
        }
      }

      let simpleText = searchTerm;

      [COMMANDS.accountType, COMMANDS.status].forEach((item) => {
        Object.values(item).forEach((command) => {
          simpleText = simpleText.replace(command.command, "")?.trim();
        });
      });

      if (simpleText && !params?.actor) params.term = simpleText;
    }

    // Only pin a single accountType here when the search text explicitly
    // asked for one *and* it's within what this screen allows. Otherwise
    // leave it unset — `effectiveAccountTypes` below decides whether to
    // merge every type in `restrictAccountTypeTo` or fetch unrestricted.
    if (
      restrictAccountTypeTo &&
      params.accountType &&
      !restrictAccountTypeTo.includes(params.accountType as never)
    ) {
      delete params.accountType;
    }

    return params;
  }, [
    searchTerm,
    skip,
    pageSize,
    tenantId,
    isAuthenticated,
    restrictAccountTypeTo,
    hasEnoughPermissions,
  ]);

  // The gateway's accounts-list endpoint takes one accountType per call (see
  // accountsListMerged's comment) — so "show every allowed type" means
  // batching one request per type and merging client-side, unless the
  // command box already narrowed to a single explicit type.
  const effectiveAccountTypes = useMemo(() => {
    if (rpcParams?.accountType) return [rpcParams.accountType];
    if (restrictAccountTypeTo) return restrictAccountTypeTo as string[];
    return null;
  }, [rpcParams, restrictAccountTypeTo]);

  const swrKey = useMemo(() => {
    if (!rpcParams) return null;
    return [
      "rpc",
      "subscriptionsManager.accounts.list",
      JSON.stringify(rpcParams),
      JSON.stringify(effectiveAccountTypes),
    ] as const;
  }, [rpcParams, effectiveAccountTypes]);

  const {
    data: accounts,
    isLoading: isLoadingAccounts,
    mutate: mutateAccounts,
  } = useSWR<PaginatedRecords<Account>>(
    swrKey,
    () => {
      if (!effectiveAccountTypes) {
        return accountsList(rpcParams!, getAccessTokenSilently);
      }

      if (effectiveAccountTypes.length > 1) {
        return accountsListMerged(
          effectiveAccountTypes,
          rpcParams!,
          getAccessTokenSilently
        );
      }

      return accountsList(
        { ...rpcParams!, accountType: effectiveAccountTypes[0] },
        getAccessTokenSilently
      );
    },
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      refreshInterval: 1000 * 60,
    }
  );

  useEffect(() => {
    if (tenantId) mutateAccounts(accounts, { rollbackOnError: false });
  }, [accounts, mutateAccounts, tenantId]);

  useEffect(() => {
    if (forceMutate) mutateAccounts(accounts, { rollbackOnError: true });
  }, [forceMutate, mutateAccounts, accounts]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = (term?: string, _?: string) => {
    setSkip(0);
    if (term !== undefined) setSearchTerm(term);
    mutateAccounts(accounts, { rollbackOnError: true });
  };

  return (
    <DashBoardBody
      term={searchTerm ?? undefined}
      breadcrumb={breadcrumb}
      onSubmit={onSubmit}
      placeholder={t(
        "screens.Dashboard.Accounts.PaginatedAccounts.searchPlaceholder"
      )}
      isLoading={isLoadingUser}
      authorized={hasEnoughPermissions}
      padding={padding}
      commandPalette={
        <SearchBar.Content>
          <div className="flex flex-col gap-3">
            <Typography as="h4" decoration="smooth">
              {t(
                "screens.Dashboard.Accounts.PaginatedAccounts.accountTypeFilters"
              )}
            </Typography>
            {Object.entries(COMMANDS.accountType)
              ?.filter(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ([_, value]) =>
                  !restrictAccountTypeTo ||
                  restrictAccountTypeTo.includes(
                    value.command.replace("/", "") as never
                  )
              )
              ?.map(([key, value]) => (
                <SearchBar.Item
                  key={key}
                  brief={value.brief}
                  command={value.command}
                  description={value?.description}
                  onClick={() => setSearchTerm(value.command)}
                  disabled={
                    (value.adminOnly && !hasEnoughPermissions) ||
                    (value.tenantNeeded && !tenantId)
                  }
                />
              ))}
          </div>

          {!restrictAccountTypeTo && (
            <div className="flex flex-col gap-1">
              <Typography as="h4" decoration="smooth">
                {t(
                  "screens.Dashboard.Accounts.PaginatedAccounts.accountStatusFilters"
                )}
              </Typography>
              {Object.entries(COMMANDS.status).map(([key, value]) => (
                <SearchBar.Item
                  key={key}
                  brief={value.brief}
                  command={value.command}
                  description={value?.description}
                  onClick={() => setSearchTerm(value.command)}
                  disabled={
                    (value.adminOnly && !hasEnoughPermissions) ||
                    (value.tenantNeeded && !tenantId)
                  }
                />
              ))}
            </div>
          )}
        </SearchBar.Content>
      }
    >
      <div
        id="AccountsContent"
        className="flex flex-col justify-center gap-4 w-full mx-auto"
      >
        {!omitToolbar && toolbar}

        {omitNamespaceInfo && (
          <div className="flex justify-center mx-auto w-full xl:max-w-4xl">
            {tenantInfo?.id && (
              <div className="flex flex-col sm:flex-row items-center gap-2 scale-105">
                <Typography as="span" decoration="smooth">
                  {t(
                    "screens.Dashboard.Accounts.PaginatedAccounts.resultsBasedOnTenant"
                  )}
                </Typography>
                <Typography as="span" decoration="semibold">
                  {tenantInfo.name}
                </Typography>
              </div>
            )}
          </div>
        )}

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
                <Typography as="h4" truncate>
                  <Link
                    className="hover:underline text-brand-violet-500 dark:text-brand-violet-400 flex items-center gap-2"
                    to={`${location.pathname}?accountId=${account?.id}`}
                  >
                    <div className="flex items-center gap-2">
                      {account?.name.length > 0
                        ? account?.name
                        : account?.id?.slice(0, 8)}
                    </div>
                    {account.isSystemAccount && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        (Default)
                      </span>
                    )}
                  </Link>
                </Typography>
                <div className="flex gap-5">
                  <CopyToClipboard text={account?.id ?? ""} />
                </div>
              </div>

              <Owners account={account} />

              <IntroSection.Item
                prefix={t(
                  "screens.Dashboard.Accounts.PaginatedAccounts.accountType"
                )}
              >
                <AccountType account={account} />
              </IntroSection.Item>

              <IntroSection.Item
                prefix={t(
                  "screens.Dashboard.Accounts.PaginatedAccounts.created"
                )}
              >
                <Typography decoration="light">
                  {formatDDMMYY(new Date(account.createdAt), true)}
                </Typography>
              </IntroSection.Item>
            </ListItem>
          ))}
        </PaginatedContent>
      </div>
    </DashBoardBody>
  );
}
