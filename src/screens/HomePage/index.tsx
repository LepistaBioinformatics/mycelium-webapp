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
import {
  FaArrowAltCircleDown,
  FaBookReader,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";

export default function HomePage() {
  const { t } = useTranslation();

  const { user, isAuthenticated, isLoading, logout, getAccessTokenWithPopup } =
    useAuth0();

  const Container = ({ children }: BaseProps) => {
    return (
      <PageBody justify="center" flex className="h-[95vh]">
        <AppHeader discrete logout={logout} />

        <PageBody.Content gap={3} padding="none">
          <div className="flex sm:flex-row flex-col gap-4 items-center justify-around w-full">
            <div className="flex flex-col items-center justify-center hidden sm:block bg-[url(/custom/mag.png)] bg-repeat-y bg-center bg-no-repeat bg-cover w-1/2 h-[95vh] z-40 group">
              <div className="h-full w-full flex flex-col items-center justify-center backdrop-blur-lg hover:backdrop-blur-none bg-indigo-700/50 group-hover:bg-transparent dark:bg-zinc-900/50 transition-all transition-discrete duration-[500ms]">
                <div className="flex flex-col gap-4 items-center justify-center h-fit w-fit bg-lime-100 rounded-full group-hover:-translate-y-[60%] group-hover:scale-50 transition-all transition-discrete duration-[500ms]">
                  <img
                    src="/custom/home-logo-dark.png"
                    alt="Mycelium API Gateway"
                    className="mx-auto rounded-full border-2 border-lime-500 hue-rotate-90 dark:hue-rotate-0 group-hover:hue-rotate-0"
                    width={300}
                    height={300}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 items-center justify-center w-full sm:w-2/3 h-screen sm:h-fit">
              {children}
            </div>
          </div>
        </PageBody.Content>

        <PageBody.Footer>
          <FaArrowAltCircleDown className="text-2xl w-full mx-auto -mt-3 animate-bounce text-zinc-500 dark:text-zinc-400" />

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
                <FaLinkedin /> MAG on LinkedIn
              </Link>
              <Link
                to="https://github.com/LepistaBioinformatics/mycelium"
                target="_blank"
                className="flex gap-2 items-center"
              >
                <FaGithub /> MAG on GitHub
              </Link>
              <Link
                to="https://github.com/LepistaBioinformatics/mycelium-webapp"
                target="_blank"
                className="flex gap-2 items-center"
              >
                <FaGithub /> MyWAPP on GitHub
              </Link>
              <Link
                to="https://lepistabioinformatics.github.io/mycelium-docs/"
                target="_blank"
                className="flex gap-2 items-center"
              >
                <FaBookReader /> MAG Documentation
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
