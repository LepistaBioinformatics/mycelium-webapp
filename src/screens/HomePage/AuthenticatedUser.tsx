import Typography from "@/components/ui/Typography";
import Card from "@/components/ui/Card";
import { useAuth0, User } from "@auth0/auth0-react";
import FlowContainer, { flowContainerStyles } from "./FlowContainer";
import { VariantProps } from "class-variance-authority";
import { useEffect, useMemo, useState } from "react";
import { buildPath } from "@/services/openapi/mycelium-api";
import useSWR from "swr";
import { components } from "@/services/openapi/mycelium-schema";
import Divider from "@/components/ui/Divider";
import Button from "@/components/ui/Button";

type CheckEmailStatusResponse =
  components["schemas"]["CheckEmailStatusResponse"];

interface Props extends VariantProps<typeof flowContainerStyles> {
  user: User | null;
  setStatus: (status: CheckEmailStatusResponse) => void;
}

export default function AuthenticatedUser({ show, user, setStatus }: Props) {
  const { getAccessTokenSilently } = useAuth0();

  const [registeringUserWithProvider, setRegisteringUserWithProvider] =
    useState<boolean>(false);

  const {
    data: emailStatus,
    isLoading: isLoadingEmailStatus,
    mutate: mutateEmailStatus,
  } = useSWR(
    user?.email
      ? buildPath("/adm/rs/beginners/users/status", {
          query: { email: user.email },
        })
      : null,
    (url) =>
      fetch(url).then((res) => res.json() as Promise<CheckEmailStatusResponse>),
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
    }
  );

  const userSituation = useMemo(() => {
    if (!emailStatus) return null;

    return emailStatus.status;
  }, [emailStatus]);

  const handleRegisterUserWithProvider = async () => {
    setRegisteringUserWithProvider(true);

    try {
      if (!user?.email) throw new Error("User email is required");

      const token = await getAccessTokenSilently();

      const registeringResponse = await fetch(
        buildPath("/adm/rs/beginners/users"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user?.email,
            firstName: user?.given_name,
            lastName: user?.family_name,
          }),
        }
      );

      if (registeringResponse.ok) {
        mutateEmailStatus();
        return;
      }

      console.error(await registeringResponse.text());
    } catch (error) {
      console.error(error);
    } finally {
      setRegisteringUserWithProvider(false);
    }
  };

  useEffect(() => {
    if (!userSituation || !emailStatus) return;

    if (
      ["RegisteredWithExternalProvider", "RegisteredWithInternalProvider"]
        .map((s) => s.toUpperCase())
        .includes(userSituation?.toUpperCase())
    ) {
      setStatus(emailStatus);
    }
  }, [userSituation, emailStatus]);

  return (
    <FlowContainer show={show}>
      <Card minHeight="50vh" height="fit" width="6xl">
        <Card.Header>
          <Typography as="h1">{user?.name}</Typography>
        </Card.Header>

        <Card.Body>
          <Typography>
            <span className="text-sm">Logged in as</span>
            <br />
            <span className="font-semibold">{user?.email}</span>
          </Typography>

          <Divider style="partial" />

          {isLoadingEmailStatus && (
            <div>
              <Typography>
                We are checking if you have an account
                <span className="animate-ping inline-block ml-2 h-2 w-2 rounded-full bg-blue-500" />
              </Typography>

              <img
                src="/undraw.co/undraw_file-searching_2ne8.svg"
                alt="Searching for your email address..."
                width={150}
                height={150}
                className="mt-4 mx-auto"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            {!isLoadingEmailStatus && (
              <div>
                {userSituation?.toUpperCase() === "NOTREGISTERED" && (
                  <div>
                    <Typography as="h2">{userSituation}</Typography>

                    <Typography>
                      Your email was not found in our records
                    </Typography>

                    <div className="flex flex-col items-center justify-center gap-8 mt-4">
                      <Button
                        rounded
                        onClick={handleRegisterUserWithProvider}
                        disabled={registeringUserWithProvider}
                      >
                        <Typography as="h4">
                          {registeringUserWithProvider
                            ? "Registering..."
                            : "Click to register"}
                        </Typography>
                      </Button>

                      <img
                        src="/undraw.co/undraw_page-not-found_6wni.svg"
                        alt={userSituation}
                        width={150}
                        height={150}
                        className="mt-4 mx-auto"
                      />
                    </div>
                  </div>
                )}

                {userSituation &&
                  [
                    "RegisteredWithExternalProvider".toUpperCase(),
                    "RegisteredWithInternalProvider".toUpperCase(),
                  ].includes(userSituation?.toUpperCase()) && (
                    <div>
                      <Typography as="h2">All ready!</Typography>

                      <Typography>User successfully registered</Typography>

                      <img
                        src="/undraw.co/undraw_landing-page_tsx8.svg"
                        alt={userSituation}
                        width={150}
                        height={150}
                        className="mt-4 mx-auto"
                      />
                    </div>
                  )}
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </FlowContainer>
  );
}
