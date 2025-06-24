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

type WebHook = components["schemas"]["WebHook"];

interface Props {
  webhook: WebHook;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteWebHook({ webhook, isOpen, onClose }: Props) {
  const { t } = useTranslation();

  const { getAccessTokenSilently } = useAuth0();

  const { parseHttpError } = useSuspenseError();

  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    const token = await getAccessTokenSilently();

    if (!webhook.id) return;

    await fetch(
      buildPath("/adm/rs/system-manager/webhooks/{webhook_id}", {
        path: { webhook_id: webhook.id },
      }),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
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
          {t("screens.Dashboard.Webhooks.DeleteWebHook.title")}
        </Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-2 w-full">
          <Typography as="p">
            {t("screens.Dashboard.Webhooks.DeleteWebHook.description")}
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
                ? t("screens.Dashboard.Webhooks.DeleteWebHook.loading")
                : t("screens.Dashboard.Webhooks.DeleteWebHook.button")}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
