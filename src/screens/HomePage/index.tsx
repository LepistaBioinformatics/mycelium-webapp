import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { TextInput } from "flowbite-react";
import { Link } from "react-router";
import {
  FaArrowAltCircleDown,
  FaBookReader,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";
import { MdSecurity, MdSpeed, MdExtension } from "react-icons/md";

import Button from "@/components/ui/Button";
import Typography from "@/components/ui/Typography";
import FormField from "@/components/ui/FomField";
import AppHeader from "@/components/ui/AppHeader";

import { requestMagicLink, verifyMagicLink } from "@/services/auth/magic-link";
import { setNotification } from "@/states/notification.state";
import { useNativeAuthContext } from "@/contexts/NativeAuthContext";
import { InvalidCodeError } from "@/types/NativeAuth";
import useProfile from "@/hooks/use-profile";

type EmailForm = { email: string };
type CodeForm = { code: string };

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setAuth } = useNativeAuthContext();
  const { isAuthenticated, isLoadingUser, logout } = useProfile();

  const [step, setStep] = useState<"email" | "code">("email");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [invalidCode, setInvalidCode] = useState(false);

  const emailForm = useForm<EmailForm>();
  const codeForm = useForm<CodeForm>();

  // Redirect authenticated users to dashboard once auth state is resolved
  useEffect(() => {
    if (!isLoadingUser && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isLoadingUser, isAuthenticated, navigate]);

  const onSubmitEmail = async (data: EmailForm) => {
    try {
      await requestMagicLink(data.email);
      setSubmittedEmail(data.email);
      setStep("code");
    } catch (err) {
      dispatch(
        setNotification({
          notification:
            err instanceof Error ? err.message : t("screens.LoginPage.emailStep.error"),
          type: "error",
        })
      );
    }
  };

  const onSubmitCode = async (data: CodeForm) => {
    setInvalidCode(false);
    try {
      const res = await verifyMagicLink(submittedEmail, data.code);
      setAuth(res.token, {
        id: res.id ?? undefined,
        email: res.email,
        firstName: res.firstName ?? undefined,
        lastName: res.lastName ?? undefined,
      });
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof InvalidCodeError) {
        setInvalidCode(true);
      } else {
        dispatch(
          setNotification({
            notification:
              err instanceof Error
                ? err.message
                : t("screens.LoginPage.codeStep.error"),
            type: "error",
          })
        );
      }
    }
  };

  const handleBack = () => {
    setStep("email");
    setInvalidCode(false);
    codeForm.reset();
  };

  const tHome = "screens.HomePage";

  // While auth state is loading, render nothing to avoid flash of login form
  if (isLoadingUser) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 min-h-screen">
      <AppHeader discrete logout={logout} />

      {/* Hero ---------------------------------------------------------------- */}
      <section className="relative flex flex-col sm:flex-row min-h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left: brand panel */}
        <div className="hidden sm:flex flex-col items-center justify-center w-1/2 min-h-full bg-brand-violet-600 dark:bg-zinc-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url(/custom/mag.png)] bg-center bg-cover opacity-20" />
          <div className="relative z-10 flex flex-col items-center gap-6 px-12 text-center">
            <img
              src="/custom/home-logo-dark.png"
              alt="Mycelium API Gateway"
              className="rounded-full border-2 border-brand-lime-400 w-40 h-40 object-cover"
            />
            <Typography as="h1" decoration="bold" reverseBackground>
              {t(`${tHome}.hero.name`)}
            </Typography>
            <Typography decoration="smooth" reverseBackground center>
              {t(`${tHome}.hero.tagline`)}
            </Typography>
          </div>
        </div>

        {/* Right: auth form */}
        <div className="flex flex-col items-center justify-center w-full sm:w-1/2 px-6 py-16 sm:py-0">
          <div className="w-full max-w-sm flex flex-col gap-8">
            {/* Mobile logo */}
            <div className="flex sm:hidden flex-col items-center gap-3">
              <img
                src="/custom/home-logo-dark.png"
                alt="Mycelium API Gateway"
                className="rounded-full border-2 border-brand-violet-500 dark:border-brand-lime-500 w-20 h-20 object-cover"
              />
              <Typography as="h3" decoration="bold" center>
                {t(`${tHome}.hero.name`)}
              </Typography>
            </div>

            {/* Auth form */}
            <div className="flex flex-col gap-6">
              {step === "email" && (
                <>
                  <div className="flex flex-col gap-1">
                    <Typography as="h4" center>
                      {t("screens.LoginPage.emailStep.title")}
                    </Typography>
                  </div>

                  <form
                    onSubmit={emailForm.handleSubmit(onSubmitEmail)}
                    className="flex flex-col gap-4"
                  >
                    <FormField
                      label={t("screens.LoginPage.emailStep.label")}
                      id="email"
                    >
                      <TextInput
                        id="email"
                        type="email"
                        autoComplete="email"
                        {...emailForm.register("email", { required: true })}
                      />
                    </FormField>

                    <Button
                      type="submit"
                      fullWidth
                      center
                      rounded
                      disabled={emailForm.formState.isSubmitting}
                    >
                      {t("screens.LoginPage.emailStep.submit")}
                    </Button>
                  </form>
                </>
              )}

              {step === "code" && (
                <>
                  <div className="flex flex-col gap-1">
                    <Typography as="h4" center>
                      {t("screens.LoginPage.codeStep.title")}
                    </Typography>
                    <Typography decoration="smooth" center>
                      {t("screens.LoginPage.codeStep.instruction")}
                    </Typography>
                  </div>

                  <form
                    onSubmit={codeForm.handleSubmit(onSubmitCode)}
                    className="flex flex-col gap-4"
                  >
                    <FormField
                      label={t("screens.LoginPage.codeStep.label")}
                      id="code"
                    >
                      <TextInput
                        id="code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        autoComplete="one-time-code"
                        autoFocus
                        {...codeForm.register("code", {
                          required: true,
                          pattern: /^[0-9]{6}$/,
                        })}
                      />
                      {invalidCode && (
                        <Typography as="small">
                          <span className="text-red-500">
                            {t("screens.LoginPage.codeStep.invalidCode")}
                          </span>
                        </Typography>
                      )}
                    </FormField>

                    <Button
                      type="submit"
                      fullWidth
                      center
                      rounded
                      disabled={codeForm.formState.isSubmitting}
                    >
                      {t("screens.LoginPage.codeStep.submit")}
                    </Button>

                    <Button
                      type="button"
                      intent="secondary"
                      fullWidth
                      center
                      rounded
                      onClick={handleBack}
                    >
                      {t("screens.LoginPage.codeStep.back")}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Scroll hint -------------------------------------------------------- */}
      <div className="flex justify-center py-4 bg-white dark:bg-zinc-900">
        <FaArrowAltCircleDown className="text-2xl animate-bounce text-zinc-400 dark:text-zinc-500" />
      </div>

      {/* Features ----------------------------------------------------------- */}
      <section className="bg-zinc-50 dark:bg-zinc-800 px-6 py-16">
        <div className="max-w-4xl mx-auto flex flex-col gap-10">
          <Typography as="h2" center decoration="smooth">
            {t(`${tHome}.features.title`)}
          </Typography>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <FeatureCard
              icon={<MdSecurity className="text-3xl text-brand-violet-500 dark:text-brand-lime-500" />}
              title={t(`${tHome}.features.security.title`)}
              description={t(`${tHome}.features.security.description`)}
            />
            <FeatureCard
              icon={<MdSpeed className="text-3xl text-brand-violet-500 dark:text-brand-lime-500" />}
              title={t(`${tHome}.features.performance.title`)}
              description={t(`${tHome}.features.performance.description`)}
            />
            <FeatureCard
              icon={<MdExtension className="text-3xl text-brand-violet-500 dark:text-brand-lime-500" />}
              title={t(`${tHome}.features.extensibility.title`)}
              description={t(`${tHome}.features.extensibility.description`)}
            />
          </div>
        </div>
      </section>

      {/* Footer ------------------------------------------------------------- */}
      <footer className="bg-white dark:bg-zinc-900 px-6 py-12 border-t border-zinc-100 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between gap-8">
          <div className="flex flex-col gap-4">
            <Typography as="h5" decoration="smooth">
              {t(`${tHome}.footer.links`)}
            </Typography>
            <div className="flex flex-col gap-3">
              <Link
                to="https://www.linkedin.com/showcase/mycelium-api-gateway-mag/"
                target="_blank"
                className="flex gap-2 items-center text-zinc-600 dark:text-zinc-400 hover:text-brand-violet-500 dark:hover:text-brand-lime-500 transition-colors"
              >
                <FaLinkedin /> MAG on LinkedIn
              </Link>
              <Link
                to="https://github.com/LepistaBioinformatics/mycelium"
                target="_blank"
                className="flex gap-2 items-center text-zinc-600 dark:text-zinc-400 hover:text-brand-violet-500 dark:hover:text-brand-lime-500 transition-colors"
              >
                <FaGithub /> MAG on GitHub
              </Link>
              <Link
                to="https://github.com/LepistaBioinformatics/mycelium-webapp"
                target="_blank"
                className="flex gap-2 items-center text-zinc-600 dark:text-zinc-400 hover:text-brand-violet-500 dark:hover:text-brand-lime-500 transition-colors"
              >
                <FaGithub /> MyWAPP on GitHub
              </Link>
              <Link
                to="https://lepistabioinformatics.github.io/mycelium-docs/"
                target="_blank"
                className="flex gap-2 items-center text-zinc-600 dark:text-zinc-400 hover:text-brand-violet-500 dark:hover:text-brand-lime-500 transition-colors"
              >
                <FaBookReader /> MAG Documentation
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <Typography decoration="smooth">
              Mycelium &copy; 2025
            </Typography>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FeatureCard
// ---------------------------------------------------------------------------

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-3 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm">
      {icon}
      <Typography as="h5">{title}</Typography>
      <Typography decoration="smooth" as="small">
        {description}
      </Typography>
    </div>
  );
}
