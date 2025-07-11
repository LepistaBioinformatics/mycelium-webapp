"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import { TENANT_ID_HEADER } from "@/constants/http-headers";
import useProfile from "@/hooks/use-profile";
import useSuspenseError from "@/hooks/use-suspense-error";
import { buildPath } from "@/services/openapi/mycelium-api";
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
  tenantId: string;
}

export default function DeleteAccount({
  account,
  isOpen,
  onClose,
  tenantId,
}: Props) {
  const { t } = useTranslation();

  const { getAccessTokenSilently } = useProfile({
    roles: [MycRole.TenantManager],
    permissions: [MycPermission.Write],
    restrictSystemAccount: true,
  });

  const { parseHttpError } = useSuspenseError();

  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    const token = await getAccessTokenSilently();

    if (!account.id) return;

    await fetch(
      buildPath("/adm/rs/tenant-manager/accounts/{account_id}", {
        path: { account_id: account.id },
      }),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          [TENANT_ID_HEADER]: tenantId,
        },
      }
    )
      .then(parseHttpError)
      .catch(console.error)
      .finally(() => {
        setIsLoading(false);
        onClose();
      });
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
              rounded
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
