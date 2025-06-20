import PageBody from "@/components/ui/PageBody";
import AppHeader from "@/components/ui/AppHeader";
import { useAuth0 } from "@auth0/auth0-react";
import AuthenticatedUser from "./AuthenticatedUser";
import Typography from "@/components/ui/Typography";
import { useTranslation } from "react-i18next";
import FlowContainer from "./FlowContainer";
import Button from "@/components/ui/Button";
import MyceliumProfile from "./MyceliumProfile";
import { Link } from "react-router";
import { IoMdFingerPrint } from "react-icons/io";
import { FaBookReader, FaGithub, FaLinkedin } from "react-icons/fa";

export default function HomePage() {
  const { t } = useTranslation();

  const { user, isAuthenticated, isLoading, logout, getAccessTokenWithPopup } =
    useAuth0();

  const Container = ({ children }: BaseProps) => {
    return (
      <PageBody justify="center" flex className="h-[97vh]">
        <AppHeader discrete logout={logout} />

        <PageBody.Content gap={3} padding="none">
          <div className="flex sm:flex-row flex-col gap-4 items-center justify-around w-full">
            <div className="flex flex-col items-center justify-center hidden sm:block bg-[url(/custom/mag.png)] bg-repeat-y bg-center bg-no-repeat bg-cover w-1/2 h-[97vh] z-40">
              <div className="h-full w-full flex flex-col items-center justify-center backdrop-blur-md">
                <div className="flex flex-col gap-4 items-center justify-center h-fit w-fit bg-lime-100 rounded-full border-2 border-lime-500">
                  <img
                    src="/custom/home-logo.png"
                    alt="Mycelium API Gateway"
                    className="mx-auto rounded-full"
                    width={300}
                    height={300}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 items-center justify-center w-full sm:w-1/2">
              {children}
            </div>
          </div>
        </PageBody.Content>

        <PageBody.Footer>
          <section className="flex flex-col gap-5">
            <Typography as="h2" decoration="smooth">
              Find us
            </Typography>

            <div className="flex flex-col gap-5">
              <Link
                to="https://www.linkedin.com/showcase/mycelium-api-gateway-mag/"
                target="_blank"
                className="flex gap-2 items-center"
              >
                <FaLinkedin /> MAG
              </Link>
              <Link
                to="https://github.com/LepistaBioinformatics/mycelium"
                target="_blank"
                className="flex gap-2 items-center"
              >
                <FaGithub /> MAG
              </Link>
              <Link
                to="https://github.com/LepistaBioinformatics/mycelium-webapp"
                target="_blank"
                className="flex gap-2 items-center"
              >
                <FaGithub /> MyWAPP
              </Link>
              <Link
                to="https://lepistabioinformatics.github.io/mycelium-docs/"
                target="_blank"
                className="flex gap-2 items-center"
              >
                <FaBookReader /> MAG Docs
              </Link>
            </div>
          </section>

          <section className="flex flex-col gap-5">
            <Typography decoration="smooth">Mycelium &copy; 2025</Typography>
          </section>
        </PageBody.Footer>
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
              <span className="!text-white !dark:text-white text-xl flex justify-center items-center gap-2">
                <IoMdFingerPrint className="text-xl inline-block" />
                {t("screens.HomePage.AnonymousUser.button")}
              </span>
            </Button>
          </div>
        </div>
      </FlowContainer>
    </Container>
  );
}
