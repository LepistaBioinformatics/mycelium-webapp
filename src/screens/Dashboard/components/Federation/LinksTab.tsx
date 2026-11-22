import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import Typography from "@/components/ui/Typography";
import { IdentityLink, linksList, linksRevoke } from "@/services/rpc/federation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import {
  cellClassName,
  rowClassName,
  tableTheme,
} from "../WebHooks/ExecutionEvents/table-theme";
import ConfirmModal from "./ConfirmModal";
import {
  formatDate,
  peerName,
  PREFIX,
  swrOptions,
  useFederationOperator,
  usePeers,
} from "./shared";
import { Empty, LoadError, StatusBadge } from "./SharedViews";

const TAB = `${PREFIX}.Links`;

export default function LinksTab() {
  const { t } = useTranslation();
  const { canFetch, getToken } = useFederationOperator();
  const { byId } = usePeers();

  const links = useSWR(
    canFetch ? ["rpc", "federation.links.list"] : null,
    () => linksList(getToken),
    swrOptions
  );

  const [revoking, setRevoking] = useState<IdentityLink | null>(null);

  return (
    <Card padding="sm" width="alwaysFull" height="adaptive">
      <Card.Header>
        <Typography as="h5" decoration="faded">
          {t(`${TAB}.title`)}
        </Typography>
      </Card.Header>

      <Card.Body width="full">
        <div className="flex flex-col gap-2 w-full">
          {links.isLoading && <Skeleton.Table rows={3} cols={6} />}
          {links.error && <LoadError />}
          {!links.isLoading && !links.error && !links.data?.length && (
            <Empty />
          )}
          {!!links.data?.length && (
            <div className="overflow-x-auto scrollbar w-full">
              <Table theme={tableTheme} data-testid="federation-links">
                <TableHead>
                  <TableHeadCell>{t(`${TAB}.columns.email`)}</TableHeadCell>
                  <TableHeadCell>{t(`${PREFIX}.peer`)}</TableHeadCell>
                  <TableHeadCell>{t(`${TAB}.columns.status`)}</TableHeadCell>
                  <TableHeadCell>
                    {t(`${TAB}.columns.established`)}
                  </TableHeadCell>
                  <TableHeadCell>{t(`${TAB}.columns.revoked`)}</TableHeadCell>
                  <TableHeadCell>
                    <span className="sr-only">{t(`${PREFIX}.actions`)}</span>
                  </TableHeadCell>
                </TableHead>
                <TableBody className="divide-y divide-zinc-200 dark:divide-surface-800">
                  {links.data.map((link) => (
                    <TableRow key={link.id} className={rowClassName}>
                      <TableCell className={cellClassName}>
                        {link.localEmail}
                      </TableCell>
                      <TableCell className={cellClassName}>
                        {peerName(byId.get(link.peerId), link.peerId)}
                      </TableCell>
                      <TableCell className={cellClassName}>
                        <StatusBadge status={link.status} />
                      </TableCell>
                      <TableCell className={cellClassName}>
                        {formatDate(link.establishedAt)}
                      </TableCell>
                      <TableCell className={cellClassName}>
                        {formatDate(link.revokedAt)}
                      </TableCell>
                      <TableCell className={cellClassName}>
                        {link.status !== "revoked" && (
                          <Button
                            size="xs"
                            intent="danger"
                            onClick={() => setRevoking(link)}
                          >
                            {t(`${TAB}.revoke`)}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card.Body>

      {revoking && (
        <ConfirmModal
          title={t(`${TAB}.revokeTitle`)}
          description={t(`${TAB}.revokeDescription`, {
            email: revoking.localEmail,
          })}
          confirmLabel={t(`${TAB}.revoke`)}
          onConfirm={() => linksRevoke({ linkId: revoking.id }, getToken)}
          onClose={() => setRevoking(null)}
          onDone={() => {
            setRevoking(null);
            links.mutate();
          }}
        />
      )}
    </Card>
  );
}
