import { useTranslation } from "react-i18next";
import Typography from "@/components/ui/Typography";
import Card from "@/components/ui/Card";
import { useAuth0, User } from "@auth0/auth0-react";
import FlowContainer, { flowContainerStyles } from "./FlowContainer";
import { VariantProps } from "class-variance-authority";
import { useEffect, useMemo } from "react";
import Button from "@/components/ui/Button";

interface Props extends VariantProps<typeof flowContainerStyles> {
  setUser: (user: User) => void;
}

export default function AnonymousUser({ show, setUser }: Props) {
  const { t } = useTranslation();

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
      <div className="flex flex-col gap-4 items-center justify-center">
        <Card width="full">
          <Card.Header>
            <Typography as="h1">
              {t("screens.HomePage.AnonymousUser.title")}
            </Typography>
          </Card.Header>

          <Card.Body>
            {shouldAuthenticate ? (
              <div className="flex flex-col gap-4">
                <Typography width="xs" as="h4">
                  {t("screens.HomePage.AnonymousUser.subtitle")}
                </Typography>
                <Button
                  onClick={getAccessTokenWithPopup}
                  rounded
                  fullWidth
                  center
                >
                  <Typography width="xs" as="h4">
                    <span className="!text-white !dark:text-white">
                      {t("screens.HomePage.AnonymousUser.button")}
                    </span>
                  </Typography>
                </Button>
              </div>
            ) : (
              <Typography>
                {t("screens.HomePage.AnonymousUser.processing")}
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
      </div>
    </FlowContainer>
  );
}
