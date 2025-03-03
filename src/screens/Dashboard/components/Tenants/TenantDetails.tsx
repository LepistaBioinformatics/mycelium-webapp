"use client";

import { PiGearFineFill } from "react-icons/pi";
import Button from "@/components/ui/Button";
import SideCurtain from "@/components/ui/SideCurtain";
import Typography from "@/components/ui/Typography";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import useProfile from "@/hooks/use-profile";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import PaginatedRecords from "@/types/PaginatedRecords";
import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import DeleteTenant from "./DeleteTenant";
import { useDispatch, useSelector } from "react-redux";
import { FaRegStar, FaStar } from "react-icons/fa";
import { RootState } from "@/states/store";
import { setTenantInfo } from "@/states/tenant.state";
import { TENANT_ID_HEADER } from "@/constants/http-headers";
import AccountType from "@/components/AccountType";
import Owners from "@/components/Owners";
import Banner from "@/components/ui/Banner";
import CreateManagementAccount from "./CreateManagementAccount";

type Tenant = components["schemas"]["Tenant"];
type Account = components["schemas"]["Account"];

interface Props {
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
}

export default function TenantDetails({ isOpen, onClose, tenant }: Props) {
  const { profile, getAccessTokenSilently } = useProfile();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateManagementAccountModalOpen, setIsCreateManagementAccountModalOpen] = useState(false);

  const [accounts, setAccounts] = useState<Account[] | null>(null);

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const dispatch = useDispatch();

  const setTokenPublicInformation = useCallback(async (tenantId: string | null | undefined) => {
    if (!tenantId) return;

    if (tenantInfo?.id === tenantId) {
      dispatch(setTenantInfo(null));
      return;
    };

    const token = await getAccessTokenSilently();

    await fetch(
      buildPath(
        "/adm/rs/beginners/tenants/{tenant_id}",
        { path: { tenant_id: tenantId } }
      ),
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((res) => res.json())
      .then((data) => dispatch(setTenantInfo(data)))
      .catch((err) => console.error(err));
  }, [tenantInfo, getAccessTokenSilently]);

  const owners = useMemo(() => {
    if (!tenant) return null;

    if ("ids" in tenant.owners) {
      const tenantOwners = tenant.owners.ids;

      if (tenantOwners.includes(
        profile?.owners.find((owner) => owner.isPrincipal)?.id ?? ""
      )) {

        if (tenantOwners.length === 1) {
          return "You";
        } else {
          return <>You and {tenantOwners.length - 1} other</>
        }
      };

      return null;
    }
  }, [tenant, profile?.owners]);

  const hasTenantManager = useMemo(
    () => hasTenantManagerAccount(accounts),
    [accounts]
  );

  return (
    <SideCurtain
      open={isOpen}
      title="Tenant details"
      handleClose={onClose}
    >
      <div className="flex flex-col gap-8">
        <div>
          <Typography as="span" decoration="smooth">Name</Typography>
          <Typography as="h2">
            <div className="flex items-center gap-2">
              {tenant.name}
              <span className="cursor-pointer">
                {tenantInfo?.id === tenant.id ? (
                  <FaStar
                    className="text-yellow-500"
                    onClick={() => setTokenPublicInformation(tenant.id)}
                  />
                ) : (
                  <FaRegStar
                    className="text-gray-500"
                    onClick={() => setTokenPublicInformation(tenant.id)}
                  />
                )}
              </span>
            </div>
          </Typography>
        </div>

        <div>
          <Typography as="span" decoration="smooth">Description</Typography>
          <Typography as="p">{tenant.description}</Typography>
        </div>

        <div>
          <Typography as="span" decoration="smooth">Created</Typography>
          <Typography as="p">{formatDDMMYY(new Date(tenant.created), true)}</Typography>
        </div>

        {owners && (
          <div>
            <Typography as="span" decoration="smooth">Owners</Typography>
            <Typography as="p">{owners}</Typography>
          </div>
        )}
      </div>

      <div>
        {tenant.id && (
          <AssociatedAccounts tenantId={tenant.id} setAccounts={setAccounts} />
        )}
      </div>

      <details>
        <summary className="cursor-pointer border-2 border-transparent border-dashed hover:border-slate-500 p-2 my-8 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <Typography as="span">
            Advanced actions
          </Typography>
        </summary>

        <div className="flex flex-col gap-8">
          <Banner intent="info">
            <div className="flex justify-between gap-2 my-5">
              <div className="flex flex-col gap-2">
                <Typography as="span">
                  Create management account
                </Typography>

                <Typography as="small" decoration="smooth">
                  Management accounts are used to manage the tenant.
                </Typography>
              </div>

              <div>
                <Button
                  rounded
                  intent="info"
                  onClick={() => setIsCreateManagementAccountModalOpen(true)}
                  disabled={hasTenantManager}
                >
                  {hasTenantManager ? "Management account already exists" : "Create"}
                </Button>
              </div>
            </div>
          </Banner>

          <Banner intent="warning">
            <div className="flex justify-between gap-2 my-5">
              <div className="flex flex-col gap-2">
                <Typography as="span">
                  Delete tenant
                </Typography>

                <Typography as="small" decoration="smooth">
                  This action cannot be undone.
                </Typography>
              </div>

              <div>
                <Button rounded intent="danger" onClick={() => setIsDeleteModalOpen(true)}>
                  Delete
                </Button>
              </div>
            </div>
          </Banner>
        </div>
      </details>

      {!hasTenantManagerAccount && (
        <CreateManagementAccount
          isOpen={isCreateManagementAccountModalOpen}
          tenantId={tenant.id}
          onClose={() => setIsCreateManagementAccountModalOpen(false)}
        />
      )}


      <DeleteTenant
        tenant={tenant}
        isOpen={isDeleteModalOpen}
        onClose={onClose}
      />
    </SideCurtain>
  )
}

/**
 * Renders the associated accounts of the tenant
 * 
 * @param tenantId - The tenant id
 * @returns The associated accounts of the tenant
 */
function AssociatedAccounts({
  tenantId,
  setAccounts
}: {
  tenantId: string,
  setAccounts: (accounts: Account[]) => void
}) {
  const { getAccessTokenSilently } = useAuth0();

  const { data: accounts } = useSWR<PaginatedRecords<Account>>(
    buildPath("/adm/rs/subscriptions-manager/accounts"),
    async (url: string) => {
      const token = await getAccessTokenSilently();

      return await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          [TENANT_ID_HEADER]: tenantId,
        },
      })
        .then((res) => res.json())
        .catch(console.error);
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      refreshInterval: 1000 * 60 * 2,
    }
  );

  useEffect(() => {
    if (accounts) setAccounts(accounts.records);
  }, [accounts]);

  return (
    <div className="flex flex-col gap-2 overflow-y-auto">
      <Typography as="span" decoration="smooth">Associated accounts</Typography>
      <div className="flex flex-col gap-2">
        {accounts?.records.map((account) => {
          const isTenantManager = isTenantManagerAccount(account);

          return (
            <div
              key={account.id}
              className="flex flex-col gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-md"
            >
              <div className="flex justify-between gap-5 w-full -mb-3">
                <div>
                  {isTenantManager
                    ? (
                      <Typography as="h3" highlight>
                        <div className="flex items-center gap-2">
                          <PiGearFineFill className="inline-block" />
                          <span>Management account</span>
                        </div>
                      </Typography>
                    ) : (
                      <Typography as="h3">
                        {account.name}
                      </Typography>
                    )}
                </div>
                <AccountType account={account} />
              </div>

              {typeof account.accountType !== "string" && (
                <AccountType account={account} part="values" />
              )}

              <Owners account={account} />

              <Typography as="small" decoration="smooth">
                Created: {formatDDMMYY(new Date(account.created), true)}
              </Typography>
            </div>
          )
        })}
      </div>
    </div >
  )
}

function hasTenantManagerAccount(accounts: Account[] | null) {
  if (!accounts) return false;

  return accounts.some(isTenantManagerAccount);
}

function isTenantManagerAccount(account: Account) {
  if (typeof account.accountType === "string") {
    return false;
  }

  if (typeof account.accountType === "object") {
    const keys = Object.keys(account.accountType);

    return keys.some((key) => {
      if (key === "tenantManager") return true;
    });
  }

  return false;
}
