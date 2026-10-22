import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { setNotification } from "@/states/notification.state";
import {
  HOSTED_LOGIN_CLIENT_ID,
  startHostedLogin,
} from "@/services/auth/hosted-login";

/** Start the gateway-hosted login from a user click. */
export default function useHostedLogin() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isRedirecting, setIsRedirecting] = useState(false);

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
    isHostedLogin: Boolean(HOSTED_LOGIN_CLIENT_ID),
    isRedirecting,
    signIn,
  };
}
