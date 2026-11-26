import Skeleton from "@/components/ui/Skeleton";
import Typography from "@/components/ui/Typography";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import useLoadMore from "@/hooks/use-load-more";
import useProfile from "@/hooks/use-profile";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import { components } from "@/services/openapi/mycelium-schema";
import {
  guestsListGuestOnSubscriptionAccount,
  guestRolesGet,
} from "@/services/rpc/subscriptionsManager";
import { useMemo } from "react";
import useSWR from "swr";
import formatEmail from "@/functions/format-email";
import PermissionBadge from "@/components/ui/PermissionBadge";
import LoadMore from "@/components/ui/LoadMore";
import SearchBar from "@/components/ui/SearchBar";
import PaginatedRecords from "@/types/PaginatedRecords";
import { useTranslation } from "react-i18next";
import { CalendarClock, Mail, ShieldQuestion, Trash2 } from "lucide-react";

// The gateway's `guests.listGuestOnSubscriptionAccount` RPC method only
// accepts `pageSize`/`skip` — no email/search filter (verified against
// `ListGuestOnSubscriptionAccountParams` in the gateway's Rust source).
// While searching, we fetch one larger flat batch instead of pages and
// filter it client-side, since there is no server-side filter to delegate to.
const SEARCH_BATCH_SIZE = 200;
const PAGE_SIZE = 10;

type Account = components["schemas"]["Account"];
type GuestUser = components["schemas"]["GuestUser"];
type GuestRole = components["schemas"]["GuestRole"];

interface Props {
  account: Account;
  tenantId: string;
  setCurrentGuestUser: (guestUser: GuestUser) => void;
  /**
   * Changing it reloads the list from its first page (the parent bumps it
   * after an invite or un-invite).
   */
  refreshKey?: number;
}


/**
 * Invitations
 *
 * List (pages load on demand) of guests the account has been shared with.
 *
 * @param account - The account object
 * @param tenantId - The tenant id
 * @returns The invitations component
 */
export default function AccountInvitations({
  account,
  tenantId,
  setCurrentGuestUser,
  refreshKey = 0,
}: Props) {
  const { t } = useTranslation();

  const { searchTerm, setSearchTerm } = useSearchBarParams({
    initialPageSize: PAGE_SIZE,
  });

  const { getAccessTokenSilently } = useProfile();

  const isSearching = !!searchTerm?.trim();

  const canList = useMemo(() => {
    if (!account.id || !tenantId) return false;

    const { accountType } = account;

    if (typeof accountType !== "object") return false;

    return (
      "subscription" in accountType ||
      "tenantManager" in accountType ||
      "roleAssociated" in accountType ||
      "actorAssociated" in accountType
    );
  }, [account, tenantId]);

  const invitations = useLoadMore<GuestUser>({
    baseKey: canList
      ? [
          "rpc",
          "subscriptionsManager.guests.listGuestOnSubscriptionAccount",
          account.id,
          tenantId,
          isSearching,
          refreshKey,
        ]
      : null,
    pageSize: isSearching ? SEARCH_BATCH_SIZE : PAGE_SIZE,
    fetchPage: (skip, pageSize) =>
      guestsListGuestOnSubscriptionAccount(
        {
          tenantId,
          accountId: account.id!,
          skip,
          pageSize,
        },
        getAccessTokenSilently
      ) as unknown as Promise<PaginatedRecords<GuestUser>>,
  });

  const filteredRecords = useMemo(() => {
    if (!isSearching) return invitations.records;

    const term = searchTerm!.trim().toLowerCase();

    return invitations.records.filter((invitation) =>
      formatEmail(invitation.email)?.toLowerCase().includes(term)
    );
  }, [invitations.records, isSearching, searchTerm]);

  if (invitations.isLoading) return <Skeleton.ListRows count={3} />;

  if (invitations.records.length === 0 && !isSearching) {
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
        onSubmit={(term) => setSearchTerm(term ?? "")}
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

      {filteredRecords.length === 0 ? (
        <Typography as="span" decoration="smooth">
          {t("screens.Dashboard.Accounts.AccountInvitations.search.noResults")}
        </Typography>
      ) : (
        <ul className="flex flex-col gap-2">
          {filteredRecords.map((invitation) => (
            <InvitationItem
              key={invitation.id}
              invitation={invitation}
              tenantId={tenantId}
              onUninvite={() => setCurrentGuestUser(invitation)}
            />
          ))}
        </ul>
      )}

      {!isSearching && (
        <LoadMore
          loaded={invitations.records.length}
          total={invitations.count}
          hasMore={invitations.hasMore}
          isLoadingMore={invitations.isLoadingMore}
          onLoadMore={invitations.loadMore}
        />
      )}
    </div>
  );
}

const PREFIX = "screens.Dashboard.Accounts.AccountInvitations";

/** One guest the account is shared with: email, role, since when */
function InvitationItem({
  invitation,
  tenantId,
  onUninvite,
}: {
  invitation: GuestUser;
  tenantId: string;
  onUninvite: () => void;
}) {
  const { t } = useTranslation();

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-xs transition-shadow hover:shadow-card">
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Mail className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium text-foreground">
            {formatEmail(invitation.email)}
          </span>
          {!invitation.wasVerified && (
            <span
              title={t(`${PREFIX}.unverified.title`)}
              className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
            >
              <ShieldQuestion className="size-3.5" />
              {t(`${PREFIX}.unverified.label`)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
          <InvitationRole guestRole={invitation.guestRole} tenantId={tenantId} />
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="size-3.5" />
            {t(`${PREFIX}.invitedAt.prefix`)}{" "}
            {formatDDMMYY(new Date(invitation.created), true)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onUninvite}
        title={t(`${PREFIX}.actions.uninvite.title`)}
        aria-label={t(`${PREFIX}.actions.uninvite.title`)}
        className="shrink-0 rounded-md p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}

/**
 * Resolves the guest role (name + permission) of an invitation; the role
 * comes either embedded or as an id to fetch.
 */
function InvitationRole({
  guestRole,
  tenantId,
}: {
  guestRole: GuestUser["guestRole"];
  tenantId: string;
}) {
  const { getAccessTokenSilently } = useProfile();

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

    return `rpc:subscriptionsManager.guestRoles.get:${localInvitationRecord}:${tenantId}`;
  }, [localInvitationRecord, tenantId]);

  const { data: remoteInvitationRecord } = useSWR<GuestRole>(
    swrKey,
    async () =>
      guestRolesGet(
        { id: localInvitationRecord as string, tenantId },
        getAccessTokenSilently
      )
  );

  const invitationRecord =
    typeof localInvitationRecord === "object" && localInvitationRecord !== null
      ? localInvitationRecord
      : remoteInvitationRecord;

  if (!invitationRecord) return <Skeleton className="w-32" />;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5">
      <span className="text-foreground">{invitationRecord.name}</span>
      <PermissionBadge permission={invitationRecord.permission} />
    </span>
  );
}
