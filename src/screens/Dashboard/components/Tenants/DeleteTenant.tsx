"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import useSuspenseError from "@/hooks/use-suspense-error";
import { components } from "@/services/openapi/mycelium-schema";
import { tenantsDelete } from "@/services/rpc/managers";
import useProfile from "@/hooks/use-profile";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type Tenant = components["schemas"]["Tenant"];

interface Props {
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteTenant({ tenant, isOpen, onClose }: Props) {
  const { t } = useTranslation();

  const { getAccessTokenSilently } = useProfile();

  const { parseHttpError } = useSuspenseError();

  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!tenant.id) return;

    setIsLoading(true);

    try {
      await tenantsDelete({ id: tenant.id }, getAccessTokenSilently);
    } catch (err) {
      parseHttpError(err as Response);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography as="h2">
          {t("screens.Dashboard.Tenants.DeleteTenant.title")}
        </Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-2 w-full">
          <Typography as="p">
            {t("screens.Dashboard.Tenants.DeleteTenant.description")}
          </Typography>

          <div>
            <Button
              intent="danger"
              onClick={handleDelete}
              disabled={isLoading}
             
              fullWidth
            >
              {isLoading
                ? t("screens.Dashboard.Tenants.DeleteTenant.loading")
                : t("screens.Dashboard.Tenants.DeleteTenant.button")}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
