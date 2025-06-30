import PageBody from "@/components/ui/PageBody";
import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { useSelector } from "react-redux";
import { RootState } from "@/states/store";
import AccountModal from "./AccountModal";
import AccountDetails from "./AccountDetails";
import PaginatedAccounts from "./PaginatedAccounts";
import useProfile from "@/hooks/use-profile";
import { useSearchParams } from "react-router";
import { MdManageAccounts } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa";

export default function Accounts() {
  const { t } = useTranslation();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [forceMutate, setForceMutate] = useState<Date | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const { hasAdminPrivileges } = useProfile();

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

    if (tenantInfo?.id) return true;

    return false;
  }, [hasAdminPrivileges, tenantInfo]);

  return (
    <div className="p-1 sm:p-5">
      <PaginatedAccounts
        tenantId={tenantInfo?.id ?? ""}
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

      <AccountDetails onClose={handleCloseModal} />

      <AccountModal
        isOpen={isNewModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
