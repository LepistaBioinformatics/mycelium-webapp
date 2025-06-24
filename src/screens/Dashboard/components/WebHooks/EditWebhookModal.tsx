"use client";

import WebhookModal, { WebhookModalProps } from "./WebhookModal";
import { components } from "@/services/openapi/mycelium-schema";

type WebHook = components["schemas"]["WebHook"];

interface Props extends WebhookModalProps {
  webhook: WebHook;
}

export default function EditWebhookModal({
  isOpen,
  onClose,
  onSuccess,
  webhook,
}: Props) {
  return (
    <WebhookModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      webhook={webhook}
    />
  );
}
