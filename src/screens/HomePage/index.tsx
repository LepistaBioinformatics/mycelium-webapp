import { useMemo, useState } from "react";
import PageBody from "@/components/ui/PageBody";
import AppHeader from "@/components/ui/AppHeader";
import { useAuth0, User } from "@auth0/auth0-react";
import AnonymousUser from "./AnonymousUser";
import AuthenticatedUser from "./AuthenticatedUser";
import { components } from "@/services/openapi/mycelium-schema";
import ValidatedUser from "./ValidatedUser";
import UnRegisteredUser from "./UnRegisteredUser";

type CheckEmailStatusResponse =
  components["schemas"]["CheckEmailStatusResponse"];

enum Step {
  CheckUserAuthentication = "check-user-authentication",
  CheckEmailRegistrationStatus = "check-email-registration-status",
  CheckAccountAvailability = "check-account-availability",
  CheckProfileAvailability = "check-profile-availability",
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<CheckEmailStatusResponse | null>(null);
  const { logout } = useAuth0();

  const currentStep = useMemo(() => {
    if (!user) return Step.CheckUserAuthentication;

    if (user.email && !status) return Step.CheckEmailRegistrationStatus;

    if (user.email && status && !status.hasAccount)
      return Step.CheckAccountAvailability;

    if (user.email && status && status.hasAccount)
      return Step.CheckProfileAvailability;

    return Step.CheckUserAuthentication;
  }, [user, status]);

  return (
    <PageBody justify="center" flex className="h-screen pt-[5rem]">
      <AppHeader discrete logout={logout} />

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

        <UnRegisteredUser
          show={currentStep === Step.CheckAccountAvailability}
          status={status}
          setStatus={setStatus}
        />

        <ValidatedUser show={currentStep === Step.CheckProfileAvailability} />
      </PageBody.Content>
    </PageBody>
  );
}
