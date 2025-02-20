//
// # Home Page
//
// See the diagram to understand the flow:
// - docs/draw.io/home-page-flow.png
//

import { useMemo, useState } from "react";
import PageBody from "@/components/ui/PageBody";
import AppHeader from "@/components/ui/AppHeader";
import { User } from "@auth0/auth0-react";
import AnonymousUser from "./AnonymousUser";
import AuthenticatedUser from "./AuthenticatedUser";
import useSWR from "swr";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import ValidatedUser from "./ProfiledUser";
import RegisteredUser from "./RegisteredUser";

type CheckEmailStatusResponse = components["schemas"]["CheckEmailStatusResponse"];

enum Step {
  CheckUserAuthentication = "check-user-authentication",
  CheckEmailRegistrationStatus = "check-email-registration-status",
  CheckAccountAvailability = "check-account-availability",
  CheckProfileAvailability = "check-profile-availability",
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<CheckEmailStatusResponse | null>(null);

  const currentStep = useMemo(() => {
    if (!user) return Step.CheckUserAuthentication;

    if (user.email && !status) return Step.CheckEmailRegistrationStatus;

    if (user.email && status && !status.hasAccount) return Step.CheckAccountAvailability;

    if (user.email && status && status.hasAccount) return Step.CheckProfileAvailability;

    return Step.CheckUserAuthentication;
  }, [user, status]);

  const { } = useSWR(
    user?.email
      ? buildPath("/adm/rs/beginners/users/status", { query: { email: user.email } })
      : null,
    (url) => fetch(url).then(res => res.json() as Promise<CheckEmailStatusResponse>),
  );

  return (
    <PageBody>
      <AppHeader discrete />

      <PageBody.Content flex="center" gap={3}>
        <AnonymousUser
          show={currentStep === Step.CheckUserAuthentication}
          setUser={setUser}
        />

        <AuthenticatedUser
          show={currentStep === Step.CheckEmailRegistrationStatus}
          setStatus={setStatus}
          user={user}
        />

        <RegisteredUser
          show={currentStep === Step.CheckAccountAvailability}
        />

        <ValidatedUser
          show={currentStep === Step.CheckProfileAvailability}
        />
      </PageBody.Content>
    </PageBody>
  );
};
