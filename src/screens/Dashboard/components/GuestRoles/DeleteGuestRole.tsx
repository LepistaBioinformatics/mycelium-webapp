"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import useSuspenseError from "@/hooks/use-suspense-error";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type GuestRole = components["schemas"]["GuestRole"];

interface Props {
  guestRole: GuestRole;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteGuestRole({ guestRole, isOpen, onClose }: Props) {
  const { t } = useTranslation();

  const { getAccessTokenSilently } = useAuth0();

  const [isLoading, setIsLoading] = useState(false);

  const { parseHttpError } = useSuspenseError();

  const handleDelete = async () => {
    setIsLoading(true);

    const token = await getAccessTokenSilently();

    if (!guestRole.id) return;

    await fetch(
      buildPath("/_adm/guests-manager/guest-roles/{guest_role_id}", {
        path: { guest_role_id: guestRole.id },
      }),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(parseHttpError)
      .then(onClose)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography as="h2">
          {t("screens.Dashboard.GuestRoles.DeleteGuestRole.title")}
        </Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-2 w-full">
          <Typography as="p">
            {t("screens.Dashboard.GuestRoles.DeleteGuestRole.description")}
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
                ? t("screens.Dashboard.GuestRoles.DeleteGuestRole.deleting")
                : t("screens.Dashboard.GuestRoles.DeleteGuestRole.delete")}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
