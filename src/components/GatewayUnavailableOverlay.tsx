import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MdCloudOff } from "react-icons/md";

import Button from "@/components/ui/Button";
import Typography from "@/components/ui/Typography";
import useGatewayHealth from "@/hooks/use-gateway-health";

/**
 * Dims the whole app and blocks interaction while the API gateway is
 * unreachable, so the screens can't mislead the user (e.g. onboarding asking
 * to create an account because every request is failing).
 */
export default function GatewayUnavailableOverlay() {
  const { t } = useTranslation();
  const { isGatewayDown, retry } = useGatewayHealth();
  const [isRetrying, setIsRetrying] = useState(false);

  if (!isGatewayDown) return null;

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="gateway-unavailable-title"
      aria-describedby="gateway-unavailable-description"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50 sm:bg-opacity-60 px-4"
    >
      <div className="flex flex-col items-center gap-4 max-w-md w-full p-6 rounded-lg border border-brand-600 shadow-sm dark:shadow-none bg-white dark:bg-surface-950 text-center">
        <MdCloudOff className="text-4xl text-infra-500" aria-hidden="true" />

        <div id="gateway-unavailable-title">
          <Typography as="h3">
            {t("components.GatewayUnavailableOverlay.title")}
          </Typography>
        </div>

        <div id="gateway-unavailable-description">
          <Typography as="p" decoration="smooth">
            {t("components.GatewayUnavailableOverlay.description")}
          </Typography>
        </div>

        <Button onClick={handleRetry} disabled={isRetrying}>
          {isRetrying
            ? t("components.GatewayUnavailableOverlay.retrying")
            : t("components.GatewayUnavailableOverlay.retry")}
        </Button>
      </div>
    </div>
  );
}
