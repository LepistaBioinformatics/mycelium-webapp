"use client";

import PageBody from "@/components/ui/PageBody";
import { Dropdown, DropdownItem } from "flowbite-react";
import { useEffect, useMemo, useState } from "react";
import AccountModal, { AccountModalProps } from "./AccountModal";
import AccountDetails from "./AccountDetails";
import PaginatedAccounts, { PaginatedAccountsProps } from "./PaginatedAccounts";
import useProfile from "@/hooks/use-profile";
import { useParams, useSearchParams } from "react-router";
import { MdManageAccounts } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";
import useTenantDetails from "@/hooks/use-tenant-details";
import { useDispatch } from "react-redux";
import { setTenantInfo } from "@/states/tenant.state";
import Typography from "@/components/ui/Typography";

interface Props extends Pick<PaginatedAccountsProps, "restrictAccountTypeTo"> {}

export default function Accounts({ restrictAccountTypeTo }: Props) {
  const { t } = useTranslation();

  const params = useParams();

  const tenantId = useMemo(() => {
    if (!params.tenantId) return null;

    return params.tenantId as string;
  }, [params.tenantId]);

  const dispatch = useDispatch();

  const { tenantStatus } = useTenantDetails({ tenantId });

  useEffect(() => {
    if (
      tenantStatus &&
      typeof tenantStatus === "object" &&
      "active" in tenantStatus
    ) {
      dispatch(setTenantInfo(tenantStatus.active));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantStatus]);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [modalScope, setModalScope] =
    useState<AccountModalProps["scope"]>("subscription");
  const [forceMutate, setForceMutate] = useState<Date | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const { hasAdminPrivileges } = useProfile({
    roles: [MycRole.SubscriptionsManager],
    permissions: [MycPermission.Write],
  });

  const handleOpenModal = (scope: AccountModalProps["scope"]) => {
    setIsNewModalOpen(true);
    setModalScope(scope);
  };

  const handleCloseModal = () => {
    setIsNewModalOpen(false);
    setForceMutate(new Date());

    // Remove accountId from search params
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      accountId: "",
    });
  };

  const handleSuccess = () => {
    setForceMutate(new Date());
    handleCloseModal();
  };

  const shouldCreateAccount = useMemo(() => {
    if (hasAdminPrivileges) return true;

    if (tenantId) return true;

    return false;
  }, [hasAdminPrivileges, tenantId]);

  return (
    <div className="p-1 sm:p-5">
      <PaginatedAccounts
        tenantId={tenantId ?? ""}
        omitToolbar={!shouldCreateAccount || !tenantId}
        omitNamespaceInfo={!!tenantId}
        forceMutate={forceMutate}
        breadcrumb={
          <PageBody.Breadcrumb.Item icon={MdManageAccounts}>
            {t("screens.Dashboard.Accounts.title")}
          </PageBody.Breadcrumb.Item>
        }
        restrictAccountTypeTo={restrictAccountTypeTo}
        toolbar={
          <div className="flex justify-end mx-auto w-full sm:max-w-4xl">
            <Dropdown
              label={
                <FaPlus
                  title={t("screens.Dashboard.Accounts.createAccount")}
                  className="text-2xl"
                />
              }
              color="gray"
              arrowIcon={false}
              dismissOnClick={false}
            >
              <div className="flex flex-col gap-0 text-start px-4 py-3">
                <Typography
                  as="span"
                  decoration="faded"
                  title={t(
                    "screens.Dashboard.Accounts.accountType.tenantScoped.title"
                  )}
                >
                  {t(
                    "screens.Dashboard.Accounts.accountType.tenantScoped.title"
                  )}
                </Typography>
              </div>
              <DropdownItem
                disabled={!shouldCreateAccount}
                onClick={() => handleOpenModal("subscription")}
              >
                <div className="flex flex-col gap-0 text-start">
                  <Typography
                    as="span"
                    decoration="semibold"
                    title={t(
                      "screens.Dashboard.Accounts.accountType.subscription.title"
                    )}
                  >
                    {t(
                      "screens.Dashboard.Accounts.accountType.subscription.title"
                    )}
                  </Typography>
                  <Typography as="small" decoration="faded" width="xxs">
                    {t(
                      "screens.Dashboard.Accounts.accountType.subscription.description"
                    )}
                  </Typography>
                </div>
              </DropdownItem>

              <DropdownItem
                disabled={!shouldCreateAccount}
                onClick={() => handleOpenModal("roleAssociated")}
              >
                <div className="flex flex-col gap-0 text-start">
                  <Typography
                    as="span"
                    decoration="semibold"
                    title={t(
                      "screens.Dashboard.Accounts.accountType.roleAssociated.title"
                    )}
                  >
                    {t(
                      "screens.Dashboard.Accounts.accountType.roleAssociated.title"
                    )}
                  </Typography>
                  <Typography as="small" decoration="faded" width="xxs">
                    {t(
                      "screens.Dashboard.Accounts.accountType.roleAssociated.description"
                    )}
                  </Typography>
                </div>
              </DropdownItem>

              <DropdownItem
                disabled={!hasAdminPrivileges}
                onClick={() => handleOpenModal("systemScoped")}
              >
                <div className="flex flex-col gap-0 text-start">
                  <Typography as="span" decoration="semibold">
                    {t(
                      "screens.Dashboard.Accounts.accountType.systemScoped.title"
                    )}
                  </Typography>
                  <Typography as="small" decoration="faded" width="xxs">
                    {t(
                      "screens.Dashboard.Accounts.accountType.systemScoped.description"
                    )}
                  </Typography>
                </div>
              </DropdownItem>
            </Dropdown>
          </div>
        }
      />

      <AccountDetails />

      <AccountModal
        isOpen={isNewModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        scope={modalScope}
      />
    </div>
  );
}
