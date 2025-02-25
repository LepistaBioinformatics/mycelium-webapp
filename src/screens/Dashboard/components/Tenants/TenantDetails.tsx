"use client";

import SideCurtain from "@/components/ui/SideCurtain";
import Typography from "@/components/ui/Typography";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import useProfile from "@/hooks/use-profile";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import PaginatedRecords from "@/types/PaginatedRecords";
import { useAuth0 } from "@auth0/auth0-react";
import { useMemo } from "react";
import useSWR from "swr";

type Tenant = components["schemas"]["Tenant"];
type Account = components["schemas"]["Account"];

interface Props {
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
}

export default function TenantDetails({ isOpen, onClose, tenant }: Props) {
  const { profile } = useProfile();

  const owners = useMemo(() => {
    if (!tenant) return [];

    if ("ids" in tenant.owners) {
      const tenantOwners = tenant.owners.ids;

      if (tenantOwners
        .includes(profile?.owners.find((owner) => owner.isPrincipal)?.id ?? "")) {

        if (tenantOwners.length === 1) {
          return "You";
        } else {
          return <>You and {tenantOwners.length - 1} other</>
        }
      };

      return null;
    }
  }, [tenant, profile?.owners]);

  return (
    <SideCurtain
      open={isOpen}
      title="Tenant details"
      handleClose={onClose}
    >
      <div className="flex flex-col gap-8">
        <div>
          <Typography as="span" decoration="smooth">Name</Typography>
          <Typography as="h2">{tenant.name}</Typography>
        </div>

        <div>
          <Typography as="span" decoration="smooth">Description</Typography>
          <Typography as="p">{tenant.description}</Typography>
        </div>

        <div>
          <Typography as="span" decoration="smooth">Created</Typography>
          <Typography as="p">{formatDDMMYY(new Date(tenant.created), true)}</Typography>
        </div>

        <div>
          <Typography as="span" decoration="smooth">Owners</Typography>
          <Typography as="p">{owners}</Typography>
        </div>
      </div>

      <div>
        {tenant.id && (
          <AssociatedAccounts tenantId={tenant.id} />
        )}
      </div>
    </SideCurtain>
  )
}

function AssociatedAccounts({ tenantId }: { tenantId: string }) {
  const { getAccessTokenSilently } = useAuth0();

  const { data: accounts } = useSWR<PaginatedRecords<Account>>(
    buildPath("/adm/rs/subscriptions-manager/accounts"),
    async (url: string) => {
      const token = await getAccessTokenSilently();

      return await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "x-mycelium-tenant-id": tenantId,
        },
      })
        .then((res) => res.json())
        .catch((err) => {
          console.error(err);
        });
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 1000 * 60 * 2,
    }
  );

  const accountType = (account: Account) => {
    if (typeof account.accountType === "string") {
      return <Typography as="p">{account.accountType}</Typography>;
    }

    return (
      <div>
        <Typography as="span" decoration="smooth">
          {Object.keys(account.accountType).at(0)}
        </Typography>

        <div className="flex flex-col gap-2">
          {Object.entries(account.accountType).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <Typography as="span" decoration="smooth">{key}</Typography>
              <Typography as="p">{value}</Typography>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto">
      <Typography as="span" decoration="smooth">Associated accounts</Typography>
      <div className="flex flex-col gap-2">
        {accounts?.records.map((account) => (
          <div
            key={account.id}
            className="flex flex-col gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-md"
          >
            <Typography as="h3">{account.name}</Typography>

            <div>
              <Typography as="span" decoration="smooth">Created</Typography>
              <Typography as="p">{formatDDMMYY(new Date(account.created), true)}</Typography>
            </div>

            <div>
              <Typography as="span" decoration="smooth">Account type</Typography>
              <Typography as="p">{accountType(account)}</Typography>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
