import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { setNotification } from "@/states/notification.state";
import { useAppConfig } from "@/hooks/use-app-config";
import {
  BUILD_HOSTED_LOGIN_CLIENT_ID,
  startHostedLogin,
} from "@/services/auth/hosted-login";

/** Start the gateway-hosted login from a user click. */
export default function useHostedLogin() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { appConfig, appConfigError } = useAppConfig();

  const isHostedLogin = Boolean(
    BUILD_HOSTED_LOGIN_CLIENT_ID || appConfig?.hostedLoginClientId
  );
  const isResolved = Boolean(
    BUILD_HOSTED_LOGIN_CLIENT_ID || appConfig || appConfigError
  );

  const signIn = useCallback(async () => {
    setIsRedirecting(true);
    try {
      await startHostedLogin();
    } catch {
      setIsRedirecting(false);
      dispatch(
        setNotification({
          notification: t("screens.HostedLogin.startError"),
          type: "error",
        })
      );
    }
  }, [dispatch, t]);

  return {
    isHostedLogin,
    /** The built-in magic-link form; false until the client id is resolved. */
    isMagicLink: isResolved && !isHostedLogin,
    isRedirecting,
    signIn,
  };
}
