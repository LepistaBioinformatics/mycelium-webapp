"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";
import { webhooksDelete } from "@/services/rpc/systemManager";
import useProfile from "@/hooks/use-profile";
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

  const { getAccessTokenSilently } = useProfile();

  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!webhook.id) return;

    setIsLoading(true);

    try {
      await webhooksDelete({ webhookId: webhook.id }, getAccessTokenSilently);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      onClose();
    }
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
