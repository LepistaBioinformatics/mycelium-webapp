import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import Typography from "@/components/ui/Typography";
import { assertionsList } from "@/services/rpc/federation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow
} from "@/components/ui/DataTable";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import {
  cellClassName,
  rowClassName,
  } from "../WebhookExecutions/ExecutionEvents/table-theme";
import {
  formatDate,
  peerName,
  PREFIX,
  swrOptions,
  useFederationOperator,
  usePeers,
} from "./shared";
import { Empty, LoadError } from "./SharedViews";

const TAB = `${PREFIX}.Assertions`;

// Stored assertions carry a `profile.v1` payload; the gateway does not send
// the kind separately.
const PROFILE_ASSERTION_KIND = "profile.v1";

/** Read-only view of the verified peer assertions kept per link. The signed
 * token itself is never shown. */
export default function AssertionsTab() {
  const { t } = useTranslation();
  const { canFetch, getToken } = useFederationOperator();
  const { byId } = usePeers();

  const assertions = useSWR(
    canFetch ? ["rpc", "federation.assertions.list"] : null,
    () => assertionsList(getToken),
    swrOptions
  );

  return (
    <Card padding="sm" width="alwaysFull" height="adaptive">
      <Card.Header>
        <Typography as="h5" decoration="faded">
          {t(`${TAB}.title`)}
        </Typography>
      </Card.Header>

      <Card.Body width="full">
        <div className="flex flex-col gap-2 w-full">
          {assertions.isLoading && <Skeleton.Table rows={3} cols={6} />}
          {assertions.error && <LoadError />}
          {!assertions.isLoading &&
            !assertions.error &&
            !assertions.data?.length && <Empty />}
          {!!assertions.data?.length && (
            <div className="overflow-x-auto scrollbar w-full">
              <Table data-testid="federation-assertions">
                <TableHead>
                  <TableHeadCell>{t(`${TAB}.columns.link`)}</TableHeadCell>
                  <TableHeadCell>{t(`${PREFIX}.peer`)}</TableHeadCell>
                  <TableHeadCell>{t(`${TAB}.columns.kind`)}</TableHeadCell>
                  <TableHeadCell>{t(`${TAB}.columns.issued`)}</TableHeadCell>
                  <TableHeadCell>{t(`${TAB}.columns.expires`)}</TableHeadCell>
                  <TableHeadCell>{t(`${TAB}.columns.grants`)}</TableHeadCell>
                </TableHead>
                <TableBody className="divide-y divide-zinc-200 dark:divide-surface-800">
                  {assertions.data.map(({ linkId, peerId, assertion }) => (
                    <TableRow key={linkId} className={rowClassName}>
                      <TableCell className={`${cellClassName} font-mono`}>
                        {linkId}
                      </TableCell>
                      <TableCell className={cellClassName}>
                        {peerName(byId.get(peerId), peerId)}
                      </TableCell>
                      <TableCell className={`${cellClassName} font-mono`}>
                        {PROFILE_ASSERTION_KIND}
                      </TableCell>
                      <TableCell className={cellClassName}>
                        {formatDate(assertion.issuedAt)}
                      </TableCell>
                      <TableCell className={cellClassName}>
                        {formatDate(assertion.expiresAt)}
                      </TableCell>
                      <TableCell className={`${cellClassName} font-mono`}>
                        {assertion.payload.grants.length}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
