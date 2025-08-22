"use client";

import { cva, VariantProps } from "class-variance-authority";
import { MdManageAccounts } from "react-icons/md";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import { useCallback } from "react";
import MiniBox from "@/components/ui/MiniBox";
import IntroSection from "@/components/ui/IntroSection";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { IoMdMore } from "react-icons/io";
import { TableCell, TableRow } from "flowbite-react";

interface Props {
  since: string;
  index?: number;
  tenantId: string;
  tenantName?: string;
}

export function TenantOwnershipInfoTableRow({
  since,
  tenantId,
  tenantName,
  index,
}: Props) {
  const { t } = useTranslation();

  const ActionsCell = () => (
    <TableCell>
      <TenantOwnershipInfoActions tenantId={tenantId} />
    </TableCell>
  );

  const Since = () => (
    <TableCell>{formatDDMMYY(new Date(since), true)}</TableCell>
  );

  const EmptyCell = () => <TableCell>---</TableCell>;

  const HeaderCell = useCallback(
    ({ name }: { name?: string }) => {
      if (!name) {
        return <EmptyCell />;
      }

      return (
        <TableCell className="text-indigo-500 dark:text-lime-500 hover:underline font-bold">
          <Link to={`/dashboard/tenants/${tenantId}`}>{name}</Link>
        </TableCell>
      );
    },
    [tenantId, t]
  );

  const Container = ({ children }: BaseProps) => (
    <TableRow
      key={index}
      className="bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      {children}
      <ActionsCell />
    </TableRow>
  );

  return (
    <Container>
      <HeaderCell name={tenantName} />
      <Since />
    </Container>
  );
}

export function TenantOwnershipInfoCard({
  since,
  tenantId,
  tenantName,
}: Props) {
  const { t } = useTranslation();

  const Since = () => (
    <IntroSection.Item
      prefix={t("screens.Dashboard.TenantOwnershipInfo.since.prefix")}
      title={t("screens.Dashboard.TenantOwnershipInfo.since.title", {
        tenantId,
      })}
    >
      {formatDDMMYY(new Date(since), true)}
    </IntroSection.Item>
  );

  const TenantData = useCallback(() => {
    return (
      <div>
        <IntroSection
          content={
            <div className="flex items-center gap-2">
              <Link
                title={t("screens.Dashboard.TenantOwnershipInfo.name")}
                className="text-indigo-500 dark:text-lime-500 hover:underline"
                to={`/dashboard/tenants/${tenantId}`}
              >
                {tenantName}
              </Link>
            </div>
          }
        >
          <Since />
        </IntroSection>
      </div>
    );
  }, [Since, t, tenantName, tenantId]);

  return (
    <MiniBox>
      <div className="flex items-center justify-between gap-3 group">
        <TenantData />
        <div className="h-full flex items-center justify-center">
          <IoMdMore className="text-3xl hidden sm:block group-hover:hidden transition-all duration-500" />

          <div className="min-h-full sm:hidden sm:group-hover:block transition-all duration-500">
            <TenantOwnershipInfoActions
              tenantId={tenantId}
              direction="column"
            />
          </div>
        </div>
      </div>
    </MiniBox>
  );
}

const styles = cva("flex items-center gap-12 sm:gap-4", {
  variants: {
    direction: {
      row: "flex-row",
      column: "flex-col",
    },
  },
  defaultVariants: {
    direction: "row",
  },
});

function TenantOwnershipInfoActions({
  tenantId,
  direction,
}: VariantProps<typeof styles> & { tenantId: string }) {
  const { t } = useTranslation();

  return (
    <div className={styles({ direction })}>
      <Link
        to={`/dashboard/tenants/${tenantId}/accounts`}
        className="flex flex-col items-center gap-2 p-1 rounded-lg bg-indigo-500 dark:bg-lime-500"
        title={t("screens.Dashboard.TenantOwnershipInfo.manageAccounts")}
      >
        <MdManageAccounts
          size={18}
          className="text-zinc-50 dark:text-zinc-900"
        />
      </Link>
    </div>
  );
}
