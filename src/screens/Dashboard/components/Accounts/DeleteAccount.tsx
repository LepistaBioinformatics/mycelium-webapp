"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import useSuspenseError from "@/hooks/use-suspense-error";
import { describeError } from "@/functions/describe-error";
import { bumpAccountsListVersion } from "@/hooks/use-accounts-list-version";
import { accountsDeleteSubscriptionAccount } from "@/services/rpc/tenantManager";
import { components } from "@/services/openapi/mycelium-schema";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type Account = components["schemas"]["Account"];

interface Props {
  account: Account;
  isOpen: boolean;
  onClose: () => void;
  /** Called once the gateway confirmed the deletion */
  onDeleted: () => void;
  tenantId: string;
}

export default function DeleteAccount({
  account,
  isOpen,
  onClose,
  onDeleted,
  tenantId,
}: Props) {
  const { t } = useTranslation();

  const { getAccessTokenSilently } = useProfile({
    roles: [MycRole.TenantManager],
    permissions: [MycPermission.Write],
    restrictSystemAccount: true,
  });

  const { dispatchError, dispacheSuccess } = useSuspenseError();

  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!account.id) return;

    setIsLoading(true);

    try {
      await accountsDeleteSubscriptionAccount(
        { tenantId, accountId: account.id },
        getAccessTokenSilently
      );

      dispacheSuccess(
        t("screens.Dashboard.Accounts.DeleteAccount.deleted", {
          name: account.name,
        })
      );
      bumpAccountsListVersion();
      onDeleted();
    } catch (err: unknown) {
      dispatchError(describeError(err));
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography as="h2">
          {t("screens.Dashboard.Accounts.DeleteAccount.title")}
        </Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-2 w-full">
          <Typography as="p">
            {t("screens.Dashboard.Accounts.DeleteAccount.description")}
          </Typography>

          <div>
            <Button
              intent="danger"
              onClick={handleDelete}
              disabled={isLoading}
             
              fullWidth
            >
              {isLoading
                ? t("screens.Dashboard.Accounts.DeleteAccount.deleting")
                : t("screens.Dashboard.Accounts.DeleteAccount.delete")}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
