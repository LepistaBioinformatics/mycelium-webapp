import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import Typography from "@/components/ui/Typography";
import {
  GrantTranslationRule,
  translationsDelete,
  translationsList,
  translationsSetEnabled,
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
import { FaPlus } from "react-icons/fa";
import useSWR from "swr";
import {
  cellClassName,
  rowClassName,
  tableTheme,
} from "../WebHooks/ExecutionEvents/table-theme";
import ConfirmModal from "./ConfirmModal";
import CreateTranslationRuleModal from "./CreateTranslationRuleModal";
import {
  peerName,
  PREFIX,
  swrOptions,
  useFederationOperator,
  usePeers,
} from "./shared";
import { Empty, LoadError, StatusBadge } from "./SharedViews";

const TAB = `${PREFIX}.Translations`;

type RuleAction = {
  rule: GrantTranslationRule;
  kind: "enable" | "disable" | "delete";
};

export default function TranslationsTab() {
  const { t } = useTranslation();
  const { canFetch, getToken } = useFederationOperator();
  const { byId } = usePeers();

  const rules = useSWR(
    canFetch ? ["rpc", "federation.translations.list"] : null,
    () => translationsList({}, getToken),
    swrOptions
  );

  const [isCreating, setIsCreating] = useState(false);
  const [action, setAction] = useState<RuleAction | null>(null);

  const runAction = ({ rule, kind }: RuleAction) =>
    kind === "delete"
      ? translationsDelete({ ruleId: rule.id }, getToken)
      : translationsSetEnabled(
          { ruleId: rule.id, enabled: kind === "enable" },
          getToken
        );

  const perm = (value: string) => t(`${PREFIX}.permissions.${value}`);

  return (
    <Card padding="sm" width="alwaysFull" height="adaptive">
      <Card.Header>
        <div className="flex justify-between items-center gap-3 w-full">
          <Typography as="h5" decoration="faded">
            {t(`${TAB}.title`)}
          </Typography>
          <Button
            size="sm"
            intent="link"
            onClick={() => setIsCreating(true)}
            aria-label={t(`${TAB}.create`)}
          >
            <span className="flex items-center gap-2">
              <FaPlus /> {t(`${TAB}.create`)}
            </span>
          </Button>
        </div>
      </Card.Header>

      <Card.Body width="full">
        <div className="flex flex-col gap-2 w-full">
          <Typography as="small" decoration="smooth">
            {t(`${TAB}.description`)}
          </Typography>

          {rules.isLoading && <Skeleton.Table rows={3} cols={9} />}
          {rules.error && <LoadError />}
          {!rules.isLoading && !rules.error && !rules.data?.length && (
            <Empty />
          )}
          {!!rules.data?.length && (
            <div className="overflow-x-auto scrollbar w-full">
              <Table theme={tableTheme} data-testid="federation-translations">
                <TableHead>
                  <TableHeadCell>{t(`${PREFIX}.peer`)}</TableHeadCell>
                  <TableHeadCell>
                    {t(`${TAB}.columns.issuerTenant`)}
                  </TableHeadCell>
                  <TableHeadCell>{t(`${TAB}.columns.issuerRole`)}</TableHeadCell>
                  <TableHeadCell>
                    {t(`${TAB}.columns.issuerMinPerm`)}
                  </TableHeadCell>
                  <TableHeadCell>
                    {t(`${TAB}.columns.localAccount`)}
                  </TableHeadCell>
                  <TableHeadCell>{t(`${TAB}.columns.localRole`)}</TableHeadCell>
                  <TableHeadCell>{t(`${TAB}.columns.localPerm`)}</TableHeadCell>
                  <TableHeadCell>{t(`${TAB}.columns.enabled`)}</TableHeadCell>
                  <TableHeadCell>
                    <span className="sr-only">{t(`${PREFIX}.actions`)}</span>
                  </TableHeadCell>
                </TableHead>
                <TableBody className="divide-y divide-zinc-200 dark:divide-surface-800">
                  {rules.data.map((rule) => (
                    <TableRow key={rule.id} className={rowClassName}>
                      <TableCell className={cellClassName}>
                        {peerName(byId.get(rule.peerId), rule.peerId)}
                      </TableCell>
                      <TableCell className={`${cellClassName} font-mono`}>
                        {rule.issuer.tenantId}
                      </TableCell>
                      <TableCell className={`${cellClassName} font-mono`}>
                        {rule.issuer.role}
                      </TableCell>
                      <TableCell className={cellClassName}>
                        {perm(rule.issuer.minPerm)}
                      </TableCell>
                      <TableCell className={`${cellClassName} font-mono`}>
                        {rule.local.accountId}
                      </TableCell>
                      <TableCell className={`${cellClassName} font-mono`}>
                        {rule.local.guestRoleId}
                      </TableCell>
                      <TableCell className={cellClassName}>
                        {perm(rule.local.perm)}
                      </TableCell>
                      <TableCell className={cellClassName}>
                        <StatusBadge
                          status={rule.enabled ? "enabled" : "disabled"}
                        />
                      </TableCell>
                      <TableCell className={cellClassName}>
                        <div className="flex gap-2">
                          <Button
                            size="xs"
                            intent="secondary"
                            onClick={() =>
                              setAction({
                                rule,
                                kind: rule.enabled ? "disable" : "enable",
                              })
                            }
                          >
                            {t(rule.enabled ? `${TAB}.disable` : `${TAB}.enable`)}
                          </Button>
                          <Button
                            size="xs"
                            intent="danger"
                            onClick={() => setAction({ rule, kind: "delete" })}
                          >
                            {t(`${TAB}.delete`)}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card.Body>

      {isCreating && (
        <CreateTranslationRuleModal
          onClose={() => setIsCreating(false)}
          onSuccess={() => {
            setIsCreating(false);
            rules.mutate();
          }}
        />
      )}

      {action && (
        <ConfirmModal
          title={t(`${TAB}.${action.kind}Title`)}
          description={t(`${TAB}.${action.kind}Description`, {
            role: action.rule.issuer.role,
          })}
          confirmLabel={t(`${TAB}.${action.kind}`)}
          intent={action.kind === "enable" ? "primary" : "danger"}
          onConfirm={() => runAction(action)}
          onClose={() => setAction(null)}
          onDone={() => {
            setAction(null);
            rules.mutate();
          }}
        />
      )}
    </Card>
  );
}
