import Typography from "@/components/ui/Typography";
import Card from "@/components/ui/Card";
import { useAuth0, User } from "@auth0/auth0-react";
import FlowContainer, { flowContainerStyles } from "./FlowContainer";
import { VariantProps } from "class-variance-authority";
import { useEffect, useMemo } from "react";
import Button from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";

interface Props extends VariantProps<typeof flowContainerStyles> {
  setUser: (user: User) => void;
}

export default function AnonymousUser({ show, setUser }: Props) {
  const { user, isLoading, isAuthenticated, getAccessTokenWithPopup } =
    useAuth0();

  const shouldAuthenticate = useMemo(() => {
    return !isLoading && !isAuthenticated;
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) return;

    setTimeout(() => {
      if (user) setUser(user);
    }, 200);
  }, [user, setUser]);

  return (
    <FlowContainer show={show}>
      <Card minHeight="50vh" height="fit" width="6xl">
        <Card.Header>
          <Typography as="h1">Welcome</Typography>
        </Card.Header>

        <Divider style="partial" />

        <Card.Body>
          {shouldAuthenticate ? (
            <div className="flex flex-col gap-4">
              <Typography width="xs" as="h4">
                You are not logged in
              </Typography>
              <Button onClick={getAccessTokenWithPopup} rounded>
                <Typography width="xs" as="h4">
                  <span className="!text-white !dark:text-white">
                    Click to login
                  </span>
                </Typography>
              </Button>
            </div>
          ) : (
            <Typography>
              We are checking your email address
              <span className="animate-ping inline-block ml-2 h-2 w-2 rounded-full bg-blue-500" />
            </Typography>
          )}

          <img
            src="/undraw.co/undraw_searching_re_3ra9.svg"
            alt="Searching for your email address..."
            width={150}
            height={150}
            className="mt-4 mx-auto"
          />
        </Card.Body>
      </Card>
    </FlowContainer>
  );
}
