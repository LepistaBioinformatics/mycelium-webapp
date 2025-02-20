import { useState } from "react";
import PageBody from "@/components/ui/PageBody";
import AppHeader from "@/components/ui/AppHeader";
import { User } from "@auth0/auth0-react";
import AnonymousUser from "./AnonymousUser";
import AuthenticatedUser from "./AuthenticatedUser";
import useSWR from "swr";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";

type CheckEmailStatusResponse = components["schemas"]["CheckEmailStatusResponse"];

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

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
        <div className="my-auto">
          {user
            ? <AuthenticatedUser user={user} />
            : <AnonymousUser setUser={setUser} />
          }
        </div>
      </PageBody.Content>
    </PageBody>
  );
};
