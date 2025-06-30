import PageBody from "@/components/ui/PageBody";
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import AccountModal from "./AccountModal";
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
  const [forceMutate, setForceMutate] = useState<Date | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const { hasAdminPrivileges } = useProfile({
    roles: [MycRole.SubscriptionsManager],
    permissions: [MycPermission.Write],
  });

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
    handleCloseModal();
    setForceMutate(new Date());
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
        forceMutate={forceMutate}
        breadcrumb={
          <PageBody.Breadcrumb.Item icon={MdManageAccounts}>
            {t("screens.Dashboard.Accounts.title")}
          </PageBody.Breadcrumb.Item>
        }
        restrictAccountTypeTo={restrictAccountTypeTo}
        toolbar={
          <div className="flex justify-end mx-auto w-full sm:max-w-4xl">
            <Button
              onClick={() => setIsNewModalOpen(true)}
              size="sm"
              rounded="full"
              intent="link"
              disabled={!shouldCreateAccount}
            >
              <FaPlus
                title={t("screens.Dashboard.Accounts.createAccount")}
                className="text-2xl"
              />
            </Button>
          </div>
        }
      />

      <AccountDetails />

      <AccountModal
        isOpen={isNewModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
