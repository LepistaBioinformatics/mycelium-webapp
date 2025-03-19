import { RiLogoutBoxLine } from "react-icons/ri";
import { useNavigate } from "react-router";
import PageBody from "@/components/ui/PageBody";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import useProfile from "@/hooks/use-profile";
import { useCallback } from "react";

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

        <Card.Body flex="col" justify="center" align="center" gap={8}>
          <Typography as="h3" width="xs">
            The page you are looking for does not exist
          </Typography>

          {!isLoadingProfile && (
            <Button onClick={routeUser} rounded intent="link">
              <div className="flex items-center gap-2 text-lg uppercase">
                <RiLogoutBoxLine className="inline text-green-400" />
                Go home
              </div>
            </Button>
          )}

          <img
            src="/undraw.co/undraw_server-down_lxs9.svg"
            alt="Unexpected error"
            width={250}
            height={250}
            className="mt-4 mx-auto"
          />
        </Card.Body>
      </Card>
    </PageBody>
  );
}
