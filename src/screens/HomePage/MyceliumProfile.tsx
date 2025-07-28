import { useTranslation } from "react-i18next";
import Typography from "@/components/ui/Typography";
import { useAuth0, User } from "@auth0/auth0-react";
import { useCallback, useEffect, useState } from "react";
import { components } from "@/services/openapi/mycelium-schema";
import useSWR from "swr";
import { buildPath } from "@/services/openapi/mycelium-api";
import { SubmitHandler, useForm } from "react-hook-form";
import FormField from "@/components/ui/FomField";
import Button from "@/components/ui/Button";
import { TextInput } from "flowbite-react";
import { useNavigate } from "react-router";
import Countdown from "react-countdown";

type Profile = components["schemas"]["Profile"];

type Inputs = {
  firstName: string;
  lastName: string;
};

enum RegisteringStatus {
  NotStarted = "not-started",
  Account = "account",
  Finished = "finished",
  Error = "error",
}

interface Props {
  user: User | null;
}

export default function MyceliumProfile({ user }: Props) {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);

  const { getAccessTokenSilently } = useAuth0();

  const [registeringUser, setRegisteringUser] = useState<boolean>(false);

  const [registeringAccount, setRegisteringAccount] = useState<boolean>(false);

  const [registeringStatus, setRegisteringStatus] = useState<RegisteringStatus>(
    RegisteringStatus.NotStarted
  );

  const [needsRegistration, setNeedsRegistration] = useState<
    boolean | undefined
  >(undefined);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      firstName: user?.given_name,
      lastName: user?.family_name,
    },
  });

  const firstName = watch("firstName");
  const lastName = watch("lastName");

  const handleRegisterUser = async ({
    firstName,
    lastName,
  }: Pick<Inputs, "firstName" | "lastName">) => {
    if (registeringStatus !== RegisteringStatus.NotStarted) return;

    setRegisteringUser(true);

    try {
      if (!user?.email) throw new Error("User email is required");

      const token = await getAccessTokenSilently();

      if (!token) throw new Error("Token is required");

      const registeringResponse = await fetch(
        buildPath("/_adm/beginners/users"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user?.email,
            firstName,
            lastName,
          }),
        }
      );

      if (registeringResponse.ok) {
        setRegisteringStatus(RegisteringStatus.Account);
        return registeringResponse.json();
      }

      throw new Error(await registeringResponse.text());
    } catch (error) {
      setError(error as string);
      setRegisteringStatus(RegisteringStatus.Error);
    } finally {
      setRegisteringUser(false);
    }
  };

  const handleRegisterAccount = async (response: { id?: string }) => {
    console.debug("handleRegisterAccount", response);

    setRegisteringAccount(true);

    try {
      if (!user?.email) throw new Error("User email is required");

      const token = await getAccessTokenSilently();

      if (!token) throw new Error("Token is required");

      const registeringResponse = await fetch(
        buildPath("/_adm/beginners/accounts"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: user?.email }),
        }
      );

      if (registeringResponse.ok) {
        setTimeout(() => {
          setRegisteringStatus(RegisteringStatus.Finished);
        }, 1000);

        return;
      }

      throw new Error(await registeringResponse.text());
    } catch (error) {
      setError(error as string);
      setRegisteringStatus(RegisteringStatus.Error);
    } finally {
      setRegisteringAccount(false);
    }
  };

  /**
   * Fetches the user profile from the backend
   *
   * @param url - The URL to fetch the profile from.
   * @returns The user profile.
   */
  const fetcher = useCallback(
    async (url: string) => {
      const token = await getAccessTokenSilently();
      if (!token) throw new Error("Token is required");

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return response.json() as Promise<Profile>;
      }

      /**
       * 401: Unauthorized
       *
       * User is logged in at the client application, but the backend is not
       * aware of this.
       */
      if (response.status === 401) {
        setNeedsRegistration(false);
        return null;
      }

      /**
       * 403: User not registered
       *
       * User is logged in at the client application, but not registered at the
       * backend.
       */
      if (response.status === 403) {
        setNeedsRegistration(true);
        return null;
      }

      /**
       * Other errors
       *
       * The backend is not able to process the request.
       */
      //parseHttpError(response);
    },
    [getAccessTokenSilently]
  );

  const { data: profile, mutate: mutateProfile } = useSWR(
    !needsRegistration ? buildPath("/_adm/beginners/profile") : null,
    fetcher,
    {
      revalidateIfStale: true,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateOnMount: true,
      refreshInterval: 15000,
    }
  );

  const onSubmit: SubmitHandler<Inputs> = ({ firstName, lastName }, event) => {
    event?.preventDefault();

    Promise.resolve()
      .then(() => handleRegisterUser({ firstName, lastName }))
      .then((response) => handleRegisterAccount(response))
      .then(() => setRegisteringStatus(RegisteringStatus.Finished))
      .then(() => mutateProfile())
      .catch((error) => {
        console.error(error);
        setError(error as string);
      });
  };

  const navigateToDashboard = useCallback(() => {
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  }, [navigate]);

  useEffect(() => {
    if (!profile) return;

    if (profile.accId) navigateToDashboard();
  }, [navigateToDashboard, profile]);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-8 items-center justify-center align-middle h-fit">
      {needsRegistration && (
        <div className="mt-5 flex flex-col items-center justify-center gap-4">
          <Typography as="h5" width="xs" center decoration="smooth">
            {t("screens.HomePage.MyceliumProfile.title")}
          </Typography>

          {registeringStatus === RegisteringStatus.Finished && (
            <>
              <Countdown
                date={Date.now() + 1000 * 5}
                onComplete={navigateToDashboard}
                renderer={({ seconds }) => (
                  <Typography as="h5">
                    {t("screens.HomePage.MyceliumProfile.countdown", {
                      seconds,
                    })}
                  </Typography>
                )}
              />

              <Button onClick={navigateToDashboard}>
                {t("screens.HomePage.MyceliumProfile.forceRedirect")}
              </Button>
            </>
          )}

          {registeringStatus === RegisteringStatus.Error && (
            <Typography as="h5">
              {t("screens.HomePage.MyceliumProfile.error")}
            </Typography>
          )}

          {[RegisteringStatus.NotStarted, RegisteringStatus.Error].includes(
            registeringStatus
          ) && (
            <>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col items-center justify-center gap-0 w-full"
              >
                <FormField
                  label={t(
                    "screens.HomePage.MyceliumProfile.form.firstName.label"
                  )}
                  title={t(
                    "screens.HomePage.MyceliumProfile.form.firstName.title"
                  )}
                >
                  <TextInput
                    {...register("firstName", { required: true })}
                    placeholder={t(
                      "screens.HomePage.MyceliumProfile.form.firstName.placeholder"
                    )}
                    defaultValue={user?.given_name ?? ""}
                    type="text"
                    autoFocus
                  />

                  {errors.firstName && <span>{errors.firstName.message}</span>}
                </FormField>

                <FormField
                  label={t(
                    "screens.HomePage.MyceliumProfile.form.lastName.label"
                  )}
                  title={t(
                    "screens.HomePage.MyceliumProfile.form.lastName.title"
                  )}
                >
                  <TextInput
                    {...register("lastName", { required: true })}
                    placeholder={t(
                      "screens.HomePage.MyceliumProfile.form.lastName.placeholder"
                    )}
                    defaultValue={user?.family_name ?? ""}
                    type="text"
                  />

                  {errors.lastName && <span>{errors.lastName.message}</span>}
                </FormField>

                <Button
                  type="submit"
                  fullWidth
                  rounded
                  disabled={
                    registeringAccount ||
                    registeringUser ||
                    firstName === undefined ||
                    lastName === undefined
                  }
                >
                  {registeringAccount || registeringUser
                    ? t("screens.HomePage.MyceliumProfile.submitting")
                    : t("screens.HomePage.MyceliumProfile.submit")}
                </Button>
              </form>

              <div className="flex flex-col items-center justify-center gap-2">
                {error && <span>{error.toString()}</span>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
