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
  //tenantStatus,
  //isLoading,
  //error,
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
        <TableCell className="text-indigo-500 dark:text-lime-500 hover:underline">
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

  /* if (tenantStatus === "deleted" || tenantStatus === "unknown") {
    return (
      <Container>
        <EmptyCell />
        <Since />
        <EmptyCell />
      </Container>
    );
  }

  if (tenantStatus === "unauthorized") {
    return (
      <Container>
        <EmptyCell />
        <Since />
        <TableCell>
          {t("screens.Dashboard.TenantOwnershipInfo.unauthorized")}
        </TableCell>
      </Container>
    );
  }

  if (isLoading || !tenantStatus || error) {
    return (
      <Container>
        <EmptyCell />
        <Since />
        <EmptyCell />
      </Container>
    );
  } */

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
}: //tenantStatus,
//isLoading,
//error,
Props) {
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
    // if (isLoading || !tenantStatus || error) {
    //   return <Since />;
    // }

    /* if (tenantStatus === "deleted" || tenantStatus === "unknown") {
      return (
        <div>
          <Since />
          <IntroSection.Item prefix="status" title={title}>
            {tenantStatus === "deleted"
              ? t("screens.Dashboard.TenantOwnershipInfo.deleted")
              : t("screens.Dashboard.TenantOwnershipInfo.unknown")}
          </IntroSection.Item>
        </div>
      );
    } */

    //if (tenantStatus === "unauthorized") {
    //  return (
    //    <div>
    //      <Since />
    //      <IntroSection.Item prefix="status" title={title} isError>
    //        {t("screens.Dashboard.TenantOwnershipInfo.unauthorized")}
    //      </IntroSection.Item>
    //    </div>
    //  );
    //}

    /* const TenantLogo = () => {
      const tags = tenantStatus.active.tags;
      if (!tags) return null;

      const tenantLogo = tags?.find(
        (tag: any) => tag?.value === TenantTagTypes.Brand
      )?.meta?.base64Logo;

      if (tenantLogo) {
        return (
          <img
            src={tenantLogo}
            alt="Tenant logo"
            title={t("screens.Dashboard.TenantOwnershipInfo.logo")}
            className="w-full h-full object-cover rounded-full transition-all duration-200 hover:border-[0.1px] border-indigo-500 dark:border-lime-500 hover:shadow-lg bg-white dark:bg-gray-800"
            style={{
              width: "24px",
              height: "24px",
              objectFit: "cover",
            }}
          />
        );
      }

      return null;
    }; */

    return (
      <div>
        <IntroSection
          content={
            <div className="flex items-center gap-2">
              {/* <TenantLogo /> */}
              <Link
                title={t("screens.Dashboard.TenantOwnershipInfo.name")}
                className="text-indigo-500 dark:text-lime-500 hover:underline"
                to={`/dashboard/tenants/${tenantId}`}
              >
                {tenantName}
              </Link>
            </div>
          }
          as="h3"
        >
          <Since />
          {/* <IntroSection.Item
            prefixProps={{ nowrap: true }}
            prefix={t(
              "screens.Dashboard.TenantOwnershipInfo.description.prefix"
            )}
            title={t("screens.Dashboard.TenantOwnershipInfo.description.title")}
          >
            {tenantStatus.active.description}
          </IntroSection.Item> */}
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

      {/* {error && (
        <Typography as="small" isError>
          {error.message}
        </Typography>
      )} */}
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
