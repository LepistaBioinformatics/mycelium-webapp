import useSWR from "swr";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";
import {
  tokensListMy,
  tokensRevoke,
  tokensDelete,
} from "@/services/rpc/beginners";
import useProfile from "@/hooks/use-profile";

type PublicConnectionStringInfo =
  components["schemas"]["PublicConnectionStringInfo"];
type ConnectionStringBean = components["schemas"]["ConnectionStringBean"];

const SWR_KEY = ["rpc", "beginners.tokens.list"] as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isExpired(iso: string): boolean {
  return new Date(iso) < new Date();
}

interface ScopeBadgesProps {
  scope: ConnectionStringBean[];
}

const BADGE_CLASS =
  "inline-block px-1.5 py-0.5 text-xs border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800";

function ScopeBadges({ scope }: ScopeBadgesProps) {
  const { t } = useTranslation();

  const badges = scope.flatMap((bean, index) => {
    if ("tid" in bean)
      return [
        <span key={`tid-${index}`} className={BADGE_CLASS}>
          {t("screens.Dashboard.ListConnectionStringsSection.scope.tenant")}
        </span>,
      ];
    if ("aid" in bean)
      return [
        <span key={`aid-${index}`} className={BADGE_CLASS}>
          {t("screens.Dashboard.ListConnectionStringsSection.scope.account")}
        </span>,
      ];
    if ("sid" in bean)
      return [
        <span key={`sid-${index}`} className={BADGE_CLASS}>
          {t(
            "screens.Dashboard.ListConnectionStringsSection.scope.serviceAccount"
          )}
        </span>,
      ];
    if ("rls" in bean)
      return [
        <span key={`rls-${index}`} className={BADGE_CLASS}>
          {t("screens.Dashboard.ListConnectionStringsSection.scope.roles")}
        </span>,
      ];
    if ("url" in bean)
      return [
        <span key={`url-${index}`} className={BADGE_CLASS}>
          {t("screens.Dashboard.ListConnectionStringsSection.scope.endpoint")}
        </span>,
      ];
    return [];
  });

  if (badges.length === 0) return <span className="text-zinc-400">—</span>;

  return <div className="flex flex-wrap gap-1">{badges}</div>;
}

type ActionKind = "revoke" | "delete";

interface PendingAction {
  token: PublicConnectionStringInfo;
  kind: ActionKind;
}

interface RowProps {
  token: PublicConnectionStringInfo;
  onAction: (token: PublicConnectionStringInfo, kind: ActionKind) => void;
}

function ConnectionStringRow({ token, onAction }: RowProps) {
  const { t } = useTranslation();
  const expired = isExpired(token.expiration);

  return (
    <TableRow className="bg-white dark:bg-zinc-800">
      <TableCell className="font-medium text-zinc-900 dark:text-white whitespace-nowrap">
        <div className="flex items-center gap-2">
          {token.name}
          {expired && (
            <span className="inline-block px-1.5 py-0.5 text-xs border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
              {t("screens.Dashboard.ListConnectionStringsSection.expired")}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
        {formatDate(token.expiration)}
      </TableCell>
      <TableCell className="text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
        {formatDate(token.createdAt)}
      </TableCell>
      <TableCell>
        <ScopeBadges scope={token.scope} />
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex items-center gap-2">
          {!expired && (
            <button
              onClick={() => onAction(token, "revoke")}
              className="text-xs px-2 py-1 border border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40"
            >
              {t(
                "screens.Dashboard.ListConnectionStringsSection.actions.revoke"
              )}
            </button>
          )}
          <button
            onClick={() => onAction(token, "delete")}
            className="text-xs px-2 py-1 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40"
          >
            {t(
              "screens.Dashboard.ListConnectionStringsSection.actions.delete"
            )}
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function ListConnectionStringsSection() {
  const { t } = useTranslation();
  const { getAccessTokenSilently } = useProfile();
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: tokens, isLoading, mutate } = useSWR<
    PublicConnectionStringInfo[] | null
  >(SWR_KEY, () => tokensListMy(getAccessTokenSilently), {
    revalidateOnMount: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  function openModal(token: PublicConnectionStringInfo, kind: ActionKind) {
    setPending({ token, kind });
  }

  async function confirm() {
    if (!pending) return;
    setBusy(true);
    try {
      if (pending.kind === "revoke") {
        await tokensRevoke({ tokenId: pending.token.id }, getAccessTokenSilently);
      } else {
        await tokensDelete({ tokenId: pending.token.id }, getAccessTokenSilently);
      }
      await mutate();
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  const isEmpty = !isLoading && (!tokens || tokens.length === 0);

  return (
    <>
      <Modal open={pending !== null} handleClose={() => setPending(null)}>
        <Modal.Header handleClose={() => setPending(null)}>
          <Typography as="h4">{pending?.token.name}</Typography>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-6 w-full pt-2 px-1">
            <Typography decoration="smooth">
              {pending?.kind === "revoke"
                ? t(
                    "screens.Dashboard.ListConnectionStringsSection.actions.revokeConfirm"
                  )
                : t(
                    "screens.Dashboard.ListConnectionStringsSection.actions.deleteConfirm"
                  )}
            </Typography>
            <Button
              intent={pending?.kind === "revoke" ? "warning" : "danger"}
              fullWidth
              onClick={confirm}
              disabled={busy}
            >
              {busy
                ? t(
                    "screens.Dashboard.ListConnectionStringsSection.actions.confirming"
                  )
                : pending?.kind === "revoke"
                ? t(
                    "screens.Dashboard.ListConnectionStringsSection.actions.revoke"
                  )
                : t(
                    "screens.Dashboard.ListConnectionStringsSection.actions.delete"
                  )}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Card padding="sm" width="alwaysFull" height="adaptive">
        <Card.Header>
          <Typography as="h5" decoration="faded">
            {t("screens.Dashboard.ListConnectionStringsSection.title")}
          </Typography>
        </Card.Header>

        <Card.Body width="full">
          {isLoading && (
            <div className="py-8 flex justify-center">
              <Typography decoration="smooth">
                {t("screens.Dashboard.Profile.loading")}
              </Typography>
            </div>
          )}

          {isEmpty && (
            <div className="py-8 flex flex-col items-center gap-2 text-center">
              <Typography decoration="smooth">
                {t("screens.Dashboard.ListConnectionStringsSection.empty")}
              </Typography>
              <Typography decoration="smooth" as="p">
                {t(
                  "screens.Dashboard.ListConnectionStringsSection.emptyDescription"
                )}
              </Typography>
            </div>
          )}

          {!isLoading && tokens && tokens.length > 0 && (
            <div className="overflow-x-auto scrollbar w-full">
              <Table>
                <TableHead>
                  <TableHeadCell>
                    {t(
                      "screens.Dashboard.ListConnectionStringsSection.columns.name"
                    )}
                  </TableHeadCell>
                  <TableHeadCell>
                    {t(
                      "screens.Dashboard.ListConnectionStringsSection.columns.expires"
                    )}
                  </TableHeadCell>
                  <TableHeadCell>
                    {t(
                      "screens.Dashboard.ListConnectionStringsSection.columns.created"
                    )}
                  </TableHeadCell>
                  <TableHeadCell>
                    {t(
                      "screens.Dashboard.ListConnectionStringsSection.columns.scope"
                    )}
                  </TableHeadCell>
                  <TableHeadCell>
                    {t(
                      "screens.Dashboard.ListConnectionStringsSection.columns.actions"
                    )}
                  </TableHeadCell>
                </TableHead>
                <TableBody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {tokens.map((token) => (
                    <ConnectionStringRow
                      key={token.id}
                      token={token}
                      onAction={openModal}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
}
