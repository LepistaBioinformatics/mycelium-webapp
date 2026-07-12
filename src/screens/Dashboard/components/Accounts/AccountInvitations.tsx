import { GoUnverified } from "react-icons/go";
import { MdDeleteOutline } from "react-icons/md";
import Typography from "@/components/ui/Typography";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import useProfile from "@/hooks/use-profile";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import { components } from "@/services/openapi/mycelium-schema";
import {
  guestsListGuestOnSubscriptionAccount,
  guestRolesGet,
} from "@/services/rpc/subscriptionsManager";
import { useMemo } from "react";
import useSWR from "swr";
import { RootState } from "@/states/store";
import { useSelector } from "react-redux";
import formatEmail from "@/functions/format-email";
import PermissionIcon from "@/components/ui/PermissionIcon";
import Pager from "@/components/ui/Pager";
import SearchBar from "@/components/ui/SearchBar";
import PaginatedRecords from "@/types/PaginatedRecords";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";

// The gateway's `guests.listGuestOnSubscriptionAccount` RPC method only
// accepts `pageSize`/`skip` — no email/search filter (verified against
// `ListGuestOnSubscriptionAccountParams` in the gateway's Rust source).
// While searching, we fetch a larger flat batch instead of the current
// page and filter it client-side, since there is no server-side filter to
// delegate to.
const SEARCH_BATCH_SIZE = 200;

type Account = components["schemas"]["Account"];
type GuestUser = components["schemas"]["GuestUser"];
type GuestRole = components["schemas"]["GuestRole"];

interface Props {
  account: Account;
  tenantId: string;
  setCurrentGuestUser: (guestUser: GuestUser) => void;
}

const TABLE_THEME = {
  root: {
    base: "w-full text-left text-sm text-zinc-500 dark:text-zinc-400",
  },
  head: {
    cell: {
      base: "bg-zinc-50 px-3 py-2 group-first/head:first:rounded-tl-lg group-first/head:last:rounded-tr-lg dark:bg-brand-900",
    },
  },
  body: {
    base: "bg-zinc-50 dark:bg-brand-900",
    cell: {
      base: "bg-zinc-50 dark:bg-brand-950 group-hover/row:bg-zinc-100 dark:group-hover/row:bg-brand-900 px-3 py-2 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg",
    },
  },
  row: {
    base: "group/row bg-transparent",
    hovered: "hover:bg-zinc-100 dark:hover:bg-brand-900",
    striped:
      "odd:bg-white even:bg-zinc-50 odd:dark:bg-brand-950 even:dark:bg-brand-900",
  },
};

/**
 * Invitations
 *
 * Compact, paginated table of guests the account has been shared with.
 *
 * @param account - The account object
 * @param tenantId - The tenant id
 * @returns The invitations component
 */
export default function AccountInvitations({
  account,
  tenantId,
  setCurrentGuestUser,
}: Props) {
  const { t } = useTranslation();

  const { skip, pageSize, setSkip, searchTerm, setSearchTerm } =
    useSearchBarParams({
      initialPageSize: 10,
    });

  const { getAccessTokenSilently } = useProfile();

  const isSearching = !!searchTerm?.trim();

  const effectiveSkip = isSearching ? 0 : skip;
  const effectivePageSize = isSearching ? SEARCH_BATCH_SIZE : pageSize;

  const swrKey = useMemo(() => {
    if (!account.id || !tenantId) return null;

    const { accountType } = account;

    if (typeof accountType !== "object") return null;

    if (
      "subscription" in accountType ||
      "tenantManager" in accountType ||
      "roleAssociated" in accountType ||
      "actorAssociated" in accountType
    ) {
      return `rpc:subscriptionsManager.guests.listGuestOnSubscriptionAccount:${account.id}:${tenantId}:${effectiveSkip}:${effectivePageSize}`;
    }

    return null;
  }, [account.id, account.accountType, tenantId, effectiveSkip, effectivePageSize]);

  const {
    data: invitations,
    isLoading,
    mutate,
  } = useSWR<PaginatedRecords<GuestUser>>(
    swrKey,
    async () =>
      guestsListGuestOnSubscriptionAccount(
        {
          tenantId: tenantId!,
          accountId: account.id!,
          skip: effectiveSkip,
          pageSize: effectivePageSize,
        },
        getAccessTokenSilently
      ) as unknown as Promise<PaginatedRecords<GuestUser>>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      refreshInterval: 1000 * 60,
    }
  );

  const filteredInvitations = useMemo(() => {
    if (!invitations) return invitations;
    if (!isSearching) return invitations;

    const term = searchTerm!.trim().toLowerCase();
    const records =
      invitations.records?.filter((invitation) =>
        formatEmail(invitation.email)?.toLowerCase().includes(term)
      ) ?? [];

    return { ...invitations, records, count: records.length };
  }, [invitations, isSearching, searchTerm]);

  if (isLoading) return <div>Loading...</div>;

  if (!invitations || (invitations.count === 0 && !isSearching)) {
    return (
      <Typography as="span" decoration="smooth">
        {t("screens.Dashboard.Accounts.AccountInvitations.noInvitations")}
      </Typography>
    );
  }

  const searchWasTruncated =
    isSearching && invitations.count > SEARCH_BATCH_SIZE;

  return (
    <div className="flex flex-col gap-2">
      <SearchBar
        term={searchTerm ?? undefined}
        onSubmit={(term) => {
          setSkip(0);
          setSearchTerm(term ?? "");
        }}
        placeholder={t(
          "screens.Dashboard.Accounts.AccountInvitations.search.placeholder"
        )}
        sticky={false}
      />

      {searchWasTruncated && (
        <Typography as="small" decoration="smooth">
          {t("screens.Dashboard.Accounts.AccountInvitations.search.truncated", {
            count: SEARCH_BATCH_SIZE,
          })}
        </Typography>
      )}

      {filteredInvitations?.records?.length === 0 ? (
        <Typography as="span" decoration="smooth">
          {t("screens.Dashboard.Accounts.AccountInvitations.search.noResults")}
        </Typography>
      ) : (
        <div className="overflow-x-auto scrollbar">
          <Table theme={TABLE_THEME} striped>
            <TableHead>
              <TableHeadCell>
                {t("screens.Dashboard.Accounts.AccountInvitations.email.title")}
              </TableHeadCell>
              <TableHeadCell>
                {t("screens.Dashboard.Accounts.AccountInvitations.role.title")}
              </TableHeadCell>
              <TableHeadCell>
                {t(
                  "screens.Dashboard.Accounts.AccountInvitations.permission.prefix"
                )}
              </TableHeadCell>
              <TableHeadCell>
                {t(
                  "screens.Dashboard.Accounts.AccountInvitations.invitedAt.prefix"
                )}
              </TableHeadCell>
              <TableHeadCell>
                <span className="sr-only">
                  {t(
                    "screens.Dashboard.Accounts.AccountInvitations.actions.title"
                  )}
                </span>
              </TableHeadCell>
            </TableHead>

            <TableBody className="divide-y divide-zinc-200 dark:divide-brand-900">
              {filteredInvitations?.records?.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {!invitation.wasVerified && (
                        <GoUnverified
                          className="text-red-500 shrink-0"
                          title="Invitation was not verified by the guest user"
                        />
                      )}
                      <span className="text-zinc-800 dark:text-zinc-200">
                        {formatEmail(invitation.email)}
                      </span>
                    </div>
                  </TableCell>

                  <InvitationRoleCells guestRole={invitation.guestRole} />

                  <TableCell className="whitespace-nowrap">
                    {formatDDMMYY(new Date(invitation.created), true)}
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => setCurrentGuestUser(invitation)}
                      title={t(
                        "screens.Dashboard.Accounts.AccountInvitations.actions.uninvite.confirm"
                      )}
                      className="text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <MdDeleteOutline size={18} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!isSearching && (
        <Pager
          records={invitations}
          mutation={mutate}
          skip={skip}
          setSkip={setSkip}
          pageSize={pageSize}
        />
      )}
    </div>
  );
}

/**
 * InvitationRoleCells
 *
 * Resolves the guest role (name + permission) for a single invitation row
 * and renders it as the "role" and "permission" table cells.
 *
 * @param guestRole - The guest role of the invitation
 */
function InvitationRoleCells({
  guestRole,
}: {
  guestRole: GuestUser["guestRole"];
}) {
  const { getAccessTokenSilently } = useProfile();

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const localInvitationRecord: GuestRole | string | null = useMemo(() => {
    if (!guestRole) return null;
    if (typeof guestRole !== "object") return null;

    if ("record" in guestRole) return guestRole.record;
    if ("id" in guestRole) return guestRole.id;

    return null;
  }, [guestRole]);

  const swrKey = useMemo(() => {
    if (!localInvitationRecord) return null;
    if (typeof localInvitationRecord === "object") return null;
    if (!tenantInfo?.id) return null;

    return `rpc:subscriptionsManager.guestRoles.get:${localInvitationRecord}:${tenantInfo.id}`;
  }, [localInvitationRecord, tenantInfo?.id]);

  const { data: remoteInvitationRecord } = useSWR<GuestRole>(
    swrKey,
    async () =>
      guestRolesGet(
        {
          id: localInvitationRecord as string,
          tenantId: tenantInfo?.id ?? undefined,
        },
        getAccessTokenSilently
      )
  );

  const invitationRecord: GuestRole | undefined = useMemo(() => {
    if (
      typeof localInvitationRecord === "object" &&
      localInvitationRecord !== null
    ) {
      return localInvitationRecord;
    }

    if (typeof remoteInvitationRecord === "object")
      return remoteInvitationRecord;

    return undefined;
  }, [localInvitationRecord, remoteInvitationRecord]);

  if (!invitationRecord) {
    return (
      <>
        <TableCell />
        <TableCell />
      </>
    );
  }

  return (
    <>
      <TableCell className="whitespace-nowrap">
        {invitationRecord.name}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <PermissionIcon permission={invitationRecord.permission} inline />
      </TableCell>
    </>
  );
}
