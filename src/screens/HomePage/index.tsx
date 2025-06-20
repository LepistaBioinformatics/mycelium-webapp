import PageBody from "@/components/ui/PageBody";
import AppHeader from "@/components/ui/AppHeader";
import { useAuth0 } from "@auth0/auth0-react";
import AuthenticatedUser from "./AuthenticatedUser";
import Typography from "@/components/ui/Typography";
import { useTranslation } from "react-i18next";
import FlowContainer from "./FlowContainer";
import Button from "@/components/ui/Button";
import MyceliumProfile from "./MyceliumProfile";

export default function HomePage() {
  const { t } = useTranslation();

  const { user, isAuthenticated, isLoading, logout, getAccessTokenWithPopup } =
    useAuth0();

  const Container = ({ children }: BaseProps) => {
    return (
      <PageBody justify="center" flex className="h-screen pt-[5rem]">
        <AppHeader discrete logout={logout} />

        <PageBody.Content gap={3}>
          <div className="flex sm:flex-row flex-col gap-4 items-center justify-around w-full">
            <div className="flex flex-col gap-4 items-center justify-center">
              {children}
            </div>

            <div className="hidden sm:block">
              <Typography as="h1">{t("screens.HomePage.title")}</Typography>
              <img
                src="/custom/home-logo.png"
                alt="Mycelium logo"
                width={150}
                height={150}
                className="mt-4 mx-auto"
              />
            </div>
          </div>
        </PageBody.Content>
      </PageBody>
    );
  };

  if (user && isAuthenticated) {
    return (
      <Container>
        <FlowContainer show>
          <div className="flex flex-col gap-8 items-center justify-center h-[100%]">
            <AuthenticatedUser user={user} />
            <MyceliumProfile user={user} />
          </div>
        </FlowContainer>
      </Container>
    );
  }

  return (
    <Container>
      <FlowContainer show>
        <div className="flex flex-col gap-8 items-center justify-center align-middle h-[100%]">
          <Typography as="h2" width="xxs" center>
            {t("screens.HomePage.AnonymousUser.title")}
          </Typography>

          <div className="flex flex-col gap-4 w-[100%] sm:w-[70%] mx-auto">
            <Button
              onClick={getAccessTokenWithPopup}
              rounded
              fullWidth
              center
              disabled={isLoading}
            >
              <span className="!text-white !dark:text-white text-xl">
                {t("screens.HomePage.AnonymousUser.button")}
              </span>
            </Button>
          </div>
        </div>
      </FlowContainer>
    </Container>
  );
}
