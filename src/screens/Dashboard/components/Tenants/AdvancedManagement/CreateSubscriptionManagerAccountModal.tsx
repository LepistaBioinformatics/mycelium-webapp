"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import { TENANT_ID_HEADER } from "@/constants/http-headers";
import useProfile from "@/hooks/use-profile";
import useSuspenseError from "@/hooks/use-suspense-error";
import { buildPath } from "@/services/openapi/mycelium-api";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateSubscriptionManagerAccountModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const { t } = useTranslation();

  const params = useParams();

  const tenantId = useMemo(() => {
    if (!params.tenantId) return null;

    return params.tenantId as string;
  }, [params.tenantId]);

  const { hasAdminPrivileges, getAccessTokenSilently } = useProfile();

  const [isLoading, setIsLoading] = useState(false);

  const { parseHttpError } = useSuspenseError();

  const handleLocalSuccess = () => {
    onSuccess();
  };

  const onSubmit = async () => {
    setIsLoading(true);

    if (!tenantId) {
      setIsLoading(false);
      return;
    }

    const token = await getAccessTokenSilently();

    const response = await fetch(buildPath("/_adm/tenant-manager/accounts"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        [TENANT_ID_HEADER]: tenantId,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      parseHttpError(response);
    }

    handleLocalSuccess();
    setIsLoading(false);
  };

  if (!hasAdminPrivileges) {
    return null;
  }

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography>
          {t(
            "screens.Dashboard.Tenants.CreateSubscriptionManagerAccountModal.title"
          )}
        </Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-8">
          <Typography as="span" decoration="faded">
            {t(
              "screens.Dashboard.Tenants.CreateSubscriptionManagerAccountModal.description"
            )}
          </Typography>

          <Button onClick={onSubmit} disabled={isLoading} rounded fullWidth>
            {isLoading
              ? t(
                  "screens.Dashboard.Tenants.CreateSubscriptionManagerAccountModal.creating"
                )
              : t(
                  "screens.Dashboard.Tenants.CreateSubscriptionManagerAccountModal.button"
                )}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
