import PageBody from "@/components/ui/PageBody";
import { components } from "@/services/openapi/mycelium-schema";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { useSelector } from "react-redux";
import { RootState } from "@/states/store";
import AccountModal from "./AccountModal";
import AccountDetails from "./AccountDetails";
import PaginatedAccounts from "./PaginatedAccounts";

type Account = components["schemas"]["Account"];

export default function Accounts() {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [forceMutate, setForceMutate] = useState<Date | null>(null);

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const handleCloseModal = () => {
    setIsNewModalOpen(false);
    setIsViewModalOpen(false);
    setCurrentAccount(null);
    setForceMutate(new Date());
  }

  const handleSuccess = () => {
    handleCloseModal();
    setForceMutate(new Date());
  }

  const handleClickOnAccount = (account: Account) => {
    setCurrentAccount(account);
    setIsViewModalOpen(true);
  }

  return (
    <div className="p-5">
      <PaginatedAccounts
        tenantId={tenantInfo?.id ?? ""}
        handleClickOnAccount={handleClickOnAccount}
        forceMutate={forceMutate}
        breadcrumb={
          <PageBody.Breadcrumb.Item>
            Accounts
          </PageBody.Breadcrumb.Item>
        }
        toolbar={
          <div className="flex justify-start mx-auto w-full xl:max-w-4xl">
            <Button
              onClick={() => setIsNewModalOpen(true)}
              size="sm"
              rounded="full"
              intent="info"
              disabled={!tenantInfo?.id}
            >
              <span className="mx-2">Create account</span>
            </Button>
          </div>
        }
      />

      {isViewModalOpen && currentAccount?.id && (
        <AccountDetails
          isOpen={isViewModalOpen}
          onClose={handleCloseModal}
          accountId={currentAccount.id}
        />
      )}

      <AccountModal
        isOpen={isNewModalOpen}
        account={currentAccount}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
