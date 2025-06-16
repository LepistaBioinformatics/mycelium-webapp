import { RiLogoutBoxLine } from "react-icons/ri";
import { useNavigate } from "react-router";
import PageBody from "@/components/ui/PageBody";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import useProfile from "@/hooks/use-profile";
import { useCallback } from "react";
import Countdown from "react-countdown";
import Divider from "./ui/Divider";

export default function NotFound() {
  const navigate = useNavigate();

  const { profile, isLoadingProfile, isAuthenticated } = useProfile();

  const routeUser = useCallback(() => {
    if (isAuthenticated && profile && !isLoadingProfile) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  }, [profile, isAuthenticated, isLoadingProfile, navigate]);

  return (
    <PageBody padding="xl" height="fit" flex="center">
      <Card padding="sm" textAlign="center">
        <Card.Header>
          <Typography as="title">Ops</Typography>
        </Card.Header>

        <Countdown
          date={Date.now() + 10000}
          renderer={({ seconds }) => (
            <Card.Body flex="col" align="center" gap={8}>
              <Typography as="h3" width="xs">
                I'm sorry. I'm trying to solve the page that you are looking for
              </Typography>

              <Divider />

              <Typography as="span" width="full">
                You'll be redirected in {seconds} seconds
              </Typography>

              {!isLoadingProfile && (
                <div className="flex flex-col gap-2">
                  <Typography as="span" width="xs">
                    Use the button below to go home if you don't want to wait
                  </Typography>

                  <div className="flex justify-center">
                    <Button onClick={routeUser} rounded intent="link">
                      <div className="flex items-center gap-2 text-lg uppercase">
                        <RiLogoutBoxLine className="inline text-green-400" />
                        Go home
                      </div>
                    </Button>
                  </div>
                </div>
              )}

              <img
                src="/undraw.co/undraw_server-down_lxs9.svg"
                alt="Unexpected error"
                width={250}
                height={250}
                className="mt-4 mx-auto"
              />
            </Card.Body>
          )}
        //onComplete={routeUser}
        />
      </Card>
    </PageBody>
  );
}
