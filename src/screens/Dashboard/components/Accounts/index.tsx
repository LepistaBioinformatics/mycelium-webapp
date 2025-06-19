import PageBody from "@/components/ui/PageBody";
import { components } from "@/services/openapi/mycelium-schema";
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { useSelector } from "react-redux";
import { RootState } from "@/states/store";
import AccountModal from "./AccountModal";
import AccountDetails from "./AccountDetails";
import PaginatedAccounts from "./PaginatedAccounts";
import useProfile from "@/hooks/use-profile";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";
import { useSearchParams } from "react-router";
import { MdManageAccounts } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa";

type Account = components["schemas"]["Account"];

export default function Accounts() {
  const { t } = useTranslation();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [forceMutate, setForceMutate] = useState<Date | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const { hasAdminPrivileges } = useProfile({
    roles: [MycRole.SubscriptionsManager],
    permissions: [MycPermission.Write],
    restrictSystemAccount: true,
  });

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  useEffect(() => {
    const accountId = searchParams.get("accountId");
    if (accountId) handleAccountIdChange(accountId);
  }, []);

  const handleAccountIdChange = (accountId: string | null) => {
    if (accountId) {
      setCurrentAccountId(accountId);
      setIsViewModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsNewModalOpen(false);
    setIsViewModalOpen(false);
    setCurrentAccount(null);
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

  const handleClickOnAccount = (account: Account) => {
    if (account.id) {
      setSearchParams({ accountId: account.id });
      handleAccountIdChange(account.id);
    }
  };

  const shouldCreateAccount = useMemo(() => {
    if (hasAdminPrivileges) return true;

    if (tenantInfo?.id) return true;

    return false;
  }, [hasAdminPrivileges, tenantInfo]);

  return (
    <div className="p-1 sm:p-5">
      <PaginatedAccounts
        tenantId={tenantInfo?.id ?? ""}
        handleClickOnAccount={handleClickOnAccount}
        forceMutate={forceMutate}
        breadcrumb={
          <PageBody.Breadcrumb.Item icon={MdManageAccounts}>
            {t("screens.Dashboard.Accounts.title")}
          </PageBody.Breadcrumb.Item>
        }
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

      {isViewModalOpen && currentAccountId && (
        <AccountDetails
          isOpen={isViewModalOpen}
          onClose={handleCloseModal}
          accountId={currentAccountId}
        />
      )}

      <AccountModal
        isOpen={isNewModalOpen}
        account={currentAccount}
        accountId={currentAccountId}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
