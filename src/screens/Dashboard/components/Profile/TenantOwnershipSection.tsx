import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import TenantResolver from "./TenantResolver";
import {
  TenantOwnershipInfoCard,
  TenantOwnershipInfoTableRow,
} from "./TenantOwnershipInfo";
import { components } from "@/services/openapi/mycelium-schema";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableHead, TableHeadCell } from "flowbite-react";

type TenantOwnership = components["schemas"]["TenantOwnership"];

interface Props {
  tenantsOwnership: TenantOwnership[] | null;
}

export default function TenantOwnershipSection({ tenantsOwnership }: Props) {
  const { t } = useTranslation();

  if (!tenantsOwnership) return null;

  return (
    <Card padding="sm" width="alwaysFull" height="adaptive">
      <Card.Header>
        <Typography as="h5" decoration="faded">
          {t("screens.Dashboard.TenantOwnershipSection.title")}
        </Typography>
      </Card.Header>

      <Card.Body width="full">
        <div className="hidden sm:block">
          <div className="overflow-x-auto">
            <Table
              striped
              theme={{
                root: {
                  base: "w-full text-left text-sm text-gray-500 dark:text-gray-400",
                },
                head: {
                  cell: {
                    base: "bg-zinc-50 px-6 py-3 group-first/head:first:rounded-tl-lg group-first/head:last:rounded-tr-lg dark:bg-zinc-700",
                  },
                },
                body: {
                  base: "bg-zinc-50 dark:bg-zinc-700",
                  cell: {
                    base: "bg-zinc-50 dark:bg-zinc-800 group-hover/row:bg-zinc-100 dark:group-hover/row:bg-zinc-900 px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg",
                  },
                },
                row: {
                  base: "group/row bg-transparent",
                  hovered: "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  striped:
                    "odd:bg-white even:bg-zinc-50 odd:dark:bg-zinc-800 even:dark:bg-zinc-700",
                },
              }}
            >
              <TableHead>
                <TableHeadCell>
                  {t("screens.Dashboard.TenantOwnershipInfo.name")}
                </TableHeadCell>
                <TableHeadCell>
                  {t("screens.Dashboard.TenantOwnershipInfo.since.prefix")}
                </TableHeadCell>
                <TableHeadCell>
                  {t("screens.Dashboard.TenantOwnershipInfo.description.title")}
                </TableHeadCell>
                <TableHeadCell>
                  {t("screens.Dashboard.TenantOwnershipInfo.actions.title")}
                </TableHeadCell>
              </TableHead>

              <TableBody className="divide-y">
                {tenantsOwnership
                  ?.sort((a, b) => b.since.localeCompare(a.since))
                  ?.map((tenant, index) => (
                    <TenantResolver
                      key={tenant.tenant}
                      tenantId={tenant.tenant}
                    >
                      <TenantOwnershipInfoTableRow
                        since={tenant.since}
                        tenantId={tenant.tenant}
                        index={index}
                      />
                    </TenantResolver>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 scrollbar w-full sm:hidden">
          {tenantsOwnership
            ?.sort((a, b) => b.since.localeCompare(a.since))
            ?.map((tenant) => (
              <TenantResolver key={tenant.tenant} tenantId={tenant.tenant}>
                <TenantOwnershipInfoCard
                  since={tenant.since}
                  tenantId={tenant.tenant}
                />
              </TenantResolver>
            ))}
        </div>
      </Card.Body>
    </Card>
  );
}
