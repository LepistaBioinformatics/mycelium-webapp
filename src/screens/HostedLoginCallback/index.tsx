import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

import PageBody from "@/components/ui/PageBody";
import Button from "@/components/ui/Button";
import Typography from "@/components/ui/Typography";
import { HorizontalLoadingBar } from "@/components/ui/HorizontalLoadingBar";
import { useNativeAuthContext } from "@/contexts/NativeAuthContext";
import {
  completeHostedLogin,
  startHostedLogin,
  type HostedLoginTokenResponse,
} from "@/services/auth/hosted-login";

/**
 * Landing route of the gateway-hosted login: exchanges the one-time code for
 * the session token, then opens the dashboard.
 */
export default function HostedLoginCallback() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useNativeAuthContext();
  const [searchParams] = useSearchParams();

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // SWR (not useEffect) runs the exchange once per code: concurrent mounts
  // share one request, which matters because the code is single-use.
  const { error } = useSWR<HostedLoginTokenResponse>(
    code && state ? ["hosted-login-callback", code, state] : null,
    () => completeHostedLogin(code ?? "", state ?? ""),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
      onSuccess: (res) => {
        setAuth(res.access_token, {
          id: res.user.id ?? undefined,
          email: res.user.email,
          firstName: res.user.firstName ?? undefined,
          lastName: res.user.lastName ?? undefined,
        });
        navigate("/dashboard", { replace: true });
      },
    }
  );

  const failed = !code || !state || Boolean(error);

  return (
    <PageBody justify="center" flex className="h-[95vh]">
      <div className="flex flex-col gap-6 w-full max-w-sm mx-auto items-center">
        {!failed && (
          <>
            <HorizontalLoadingBar isLoading />
            <Typography as="p" decoration="smooth" center>
              {t("screens.HostedLogin.callback.signingIn")}
            </Typography>
          </>
        )}

        {failed && (
          <>
            <Typography as="h2" center>
              {t("screens.HostedLogin.callback.failed")}
            </Typography>
            <Typography as="p" decoration="smooth" center>
              {t("screens.HostedLogin.callback.failedDetail")}
            </Typography>
            <Button
              type="button"
              fullWidth
              center
              onClick={() => void startHostedLogin()}
            >
              {t("screens.HostedLogin.callback.retry")}
            </Button>
          </>
        )}
      </div>
    </PageBody>
  );
}
