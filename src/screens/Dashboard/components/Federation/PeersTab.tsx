import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import Typography from "@/components/ui/Typography";
import {
  InstanceSetting,
  PeerOverview,
  peersQuarantine,
  peersRelease,
  setEnabled,
} from "@/services/rpc/federation";
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
import {
  cellClassName,
  rowClassName,
  tableTheme,
} from "../WebHooks/ExecutionEvents/table-theme";
import ConfirmModal from "./ConfirmModal";
import {
  formatDate,
  PREFIX,
  useFederationOperator,
  usePeers,
} from "./shared";
import { Empty, LoadError, StatusBadge } from "./SharedViews";

const TAB = `${PREFIX}.Peers`;

type PeerAction = { peer: PeerOverview; kind: "quarantine" | "release" };

export default function PeersTab() {
  const { t } = useTranslation();
  const { getToken } = useFederationOperator();
  const peers = usePeers();

  const [action, setAction] = useState<PeerAction | null>(null);

  const runAction = ({ peer, kind }: PeerAction) =>
    kind === "quarantine"
      ? peersQuarantine({ instanceId: peer.instanceId }, getToken)
      : peersRelease({ instanceId: peer.instanceId }, getToken);

  return (
    <div className="flex flex-col gap-6 w-full">
      <KillSwitch />

      <Card padding="sm" width="alwaysFull" height="adaptive">
        <Card.Header>
          <Typography as="h5" decoration="faded">
            {t(`${TAB}.title`)}
          </Typography>
        </Card.Header>

        <Card.Body width="full">
          <div className="flex flex-col gap-2 w-full">
            {peers.isLoading && <Skeleton.Table rows={3} cols={8} />}
            {peers.error && <LoadError />}
            {!peers.isLoading && !peers.error && !peers.data?.length && (
              <Empty />
            )}
            {!!peers.data?.length && (
              <div className="overflow-x-auto scrollbar w-full">
                <Table theme={tableTheme} data-testid="federation-peers">
                  <TableHead>
                    <TableHeadCell>{t(`${TAB}.columns.name`)}</TableHeadCell>
                    <TableHeadCell>{t(`${TAB}.columns.baseUrl`)}</TableHeadCell>
                    <TableHeadCell>
                      {t(`${TAB}.columns.instanceId`)}
                    </TableHeadCell>
                    <TableHeadCell>{t(`${TAB}.columns.status`)}</TableHeadCell>
                    <TableHeadCell>{t(`${TAB}.columns.kinds`)}</TableHeadCell>
                    <TableHeadCell>
                      {t(`${TAB}.columns.lastContact`)}
                    </TableHeadCell>
                    <TableHeadCell>
                      {t(`${TAB}.columns.failures`)}
                    </TableHeadCell>
                    <TableHeadCell>
                      <span className="sr-only">{t(`${PREFIX}.actions`)}</span>
                    </TableHeadCell>
                  </TableHead>
                  <TableBody className="divide-y divide-zinc-200 dark:divide-surface-800">
                    {peers.data.map((peer) => (
                      <TableRow key={peer.id} className={rowClassName}>
                        <TableCell className={cellClassName}>
                          {peer.displayName || "—"}
                        </TableCell>
                        <TableCell className={cellClassName}>
                          {peer.baseUrl}
                        </TableCell>
                        <TableCell className={`${cellClassName} font-mono`}>
                          {peer.instanceId}
                        </TableCell>
                        <TableCell className={cellClassName}>
                          <StatusBadge status={peer.status} />
                        </TableCell>
                        <TableCell className={`${cellClassName} font-mono`}>
                          {peer.negotiatedKinds.join(", ") || "—"}
                        </TableCell>
                        <TableCell className={cellClassName}>
                          {formatDate(peer.lastContactAt)}
                        </TableCell>
                        <TableCell className={`${cellClassName} font-mono`}>
                          {peer.failureCount}
                        </TableCell>
                        <TableCell className={cellClassName}>
                          {peer.status === "quarantined" ? (
                            <Button
                              size="xs"
                              intent="secondary"
                              onClick={() =>
                                setAction({ peer, kind: "release" })
                              }
                            >
                              {t(`${TAB}.release`)}
                            </Button>
                          ) : (
                            <Button
                              size="xs"
                              intent="warning"
                              onClick={() =>
                                setAction({ peer, kind: "quarantine" })
                              }
                            >
                              {t(`${TAB}.quarantine`)}
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
      </Card>

      {action && (
        <ConfirmModal
          title={t(`${TAB}.${action.kind}Title`)}
          description={t(`${TAB}.${action.kind}Description`, {
            name: action.peer.displayName || action.peer.baseUrl,
          })}
          confirmLabel={t(`${TAB}.${action.kind}`)}
          intent={action.kind === "quarantine" ? "warning" : "primary"}
          onConfirm={() => runAction(action)}
          onClose={() => setAction(null)}
          onDone={() => {
            setAction(null);
            peers.mutate();
          }}
        />
      )}
    </div>
  );
}

/**
 * The runtime federation switch. The gateway exposes no read of the current
 * state, so this shows the outcome of the last switch made here.
 */
function KillSwitch() {
  const { t } = useTranslation();
  const { getToken } = useFederationOperator();

  const [target, setTarget] = useState<boolean | null>(null);
  const [last, setLast] = useState<InstanceSetting | null>(null);

  return (
    <Card padding="sm" width="alwaysFull" height="adaptive">
      <Card.Header>
        <Typography as="h5" decoration="faded">
          {t(`${TAB}.switch.title`)}
        </Typography>
      </Card.Header>

      <Card.Body width="full">
        <div className="flex flex-col gap-3 w-full">
          <Typography as="small" decoration="smooth">
            {t(`${TAB}.switch.description`)}
          </Typography>

          {last && (
            <Typography as="p" data-testid="federation-switch-state">
              {t(
                last.value === true
                  ? `${TAB}.switch.nowOn`
                  : `${TAB}.switch.nowOff`,
                { date: formatDate(last.updated ?? last.created) }
              )}
            </Typography>
          )}

          <div className="flex flex-wrap gap-2">
            <Button size="sm" intent="primary" onClick={() => setTarget(true)}>
              {t(`${TAB}.switch.turnOn`)}
            </Button>
            <Button size="sm" intent="danger" onClick={() => setTarget(false)}>
              {t(`${TAB}.switch.turnOff`)}
            </Button>
          </div>
        </div>
      </Card.Body>

      {target !== null && (
        <ConfirmModal
          title={t(
            target ? `${TAB}.switch.turnOnTitle` : `${TAB}.switch.turnOffTitle`
          )}
          description={t(
            target
              ? `${TAB}.switch.turnOnDescription`
              : `${TAB}.switch.turnOffDescription`
          )}
          confirmLabel={t(
            target ? `${TAB}.switch.turnOn` : `${TAB}.switch.turnOff`
          )}
          intent={target ? "primary" : "danger"}
          onConfirm={async () =>
            setLast(await setEnabled({ enabled: target }, getToken))
          }
          onClose={() => setTarget(null)}
          onDone={() => setTarget(null)}
        />
      )}
    </Card>
  );
}
