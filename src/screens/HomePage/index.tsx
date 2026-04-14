import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { TextInput } from "flowbite-react";
import { Link } from "react-router";
import {
  FaArrowCircleDown,
  FaBookOpen,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";
import { MdSecurity, MdSpeed, MdExtension } from "react-icons/md";

import Typography from "@/components/ui/Typography";
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

  const [searchParams, setSearchParams] = useSearchParams();
  const step = (searchParams.get("step") as "email" | "code") ?? "email";
  const submittedEmail = searchParams.get("email") ?? "";
  const [invalidCode, setInvalidCode] = useState(false);

  const emailForm = useForm<EmailForm>();
  const codeForm = useForm<CodeForm>();

  useEffect(() => {
    if (!isLoadingUser && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isLoadingUser, isAuthenticated, navigate]);

  const onSubmitEmail = async (data: EmailForm) => {
    try {
      await requestMagicLink(data.email);
      setSearchParams({ step: "code", email: data.email });
    } catch (err) {
      dispatch(
        setNotification({
          notification:
            err instanceof Error
              ? err.message
              : t("screens.LoginPage.emailStep.error"),
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
    setSearchParams({});
    setInvalidCode(false);
    codeForm.reset();
  };

  const tHome = "screens.HomePage";

  if (isLoadingUser) return null;

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen flex flex-col">

      {/* Full-page logo background — light mode */}
      <div className="fixed inset-0 z-0 dark:hidden bg-[url(/logo-blackwhite.png)] bg-center bg-cover opacity-[0.14]" />
      {/* Full-page logo background — dark mode */}
      <div className="fixed inset-0 z-0 hidden dark:block bg-[url(/logo-color.png)] bg-center bg-cover opacity-[0.18]" />

      <AppHeader discrete logout={logout} />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-1 items-center justify-center min-h-[calc(100vh-4rem)]">

        {/* Auth panel */}
        <div className="relative z-10 w-full max-w-md px-6 flex flex-col gap-8">

          {/* Brand */}
          <div className="flex flex-col gap-2 text-center">
            <Typography as="h1" decoration="bold" center>
              {t(`${tHome}.hero.name`)}
            </Typography>
            <Typography as="p" decoration="smooth" center>
              {t(`${tHome}.hero.tagline`)}
            </Typography>
          </div>

          {step === "email" && (
            <form
              onSubmit={emailForm.handleSubmit(onSubmitEmail)}
              className="flex flex-col gap-6"
            >
              <TextInput
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                className="[&_input]:text-2xl [&_input]:py-6 [&_input]:px-5 [&_input]:bg-white/90 [&_input]:dark:bg-zinc-900/90 [&_input]:border-2 [&_input]:border-zinc-400 [&_input]:dark:border-zinc-600 [&_input]:shadow-md [&_input]:dark:shadow-[0_0_24px_4px_rgba(139,92,246,0.45)] [&_input]:focus:border-brand-violet-500 [&_input]:dark:focus:border-brand-violet-400 [&_input]:focus:ring-0 [&_input]:dark:focus:shadow-[0_0_32px_8px_rgba(139,92,246,0.65)]"
                {...emailForm.register("email", { required: true })}
              />
              <button
                type="submit"
                disabled={emailForm.formState.isSubmitting}
                className="
                  w-full py-4 px-6 text-lg font-semibold
                  transition-all duration-200
                  bg-brand-violet-600 hover:bg-brand-violet-700 text-white
                  dark:bg-brand-violet-500 dark:hover:bg-brand-violet-600
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-md hover:shadow-brand-violet-500/30 hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-brand-violet-500 focus:ring-offset-2
                  dark:focus:ring-offset-zinc-900
                "
              >
                {emailForm.formState.isSubmitting
                  ? t(`${tHome}.auth.sending`)
                  : t("screens.LoginPage.emailStep.submit")}
              </button>
            </form>
          )}

          {step === "code" && (
            <form
              onSubmit={codeForm.handleSubmit(onSubmitCode)}
              className="flex flex-col gap-6"
            >
              <p className="text-sm text-center text-zinc-500 dark:text-zinc-400">
                {t("screens.LoginPage.codeStep.instruction")}{" "}
                <span className="text-brand-violet-600 dark:text-brand-violet-400 font-medium">
                  {submittedEmail}
                </span>
              </p>
              <TextInput
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                autoComplete="one-time-code"
                autoFocus
                placeholder="000000"
                className="[&_input]:text-3xl [&_input]:tracking-[0.5em] [&_input]:text-center [&_input]:font-mono [&_input]:py-6 [&_input]:bg-white/90 [&_input]:dark:bg-zinc-900/90 [&_input]:border-2 [&_input]:border-zinc-400 [&_input]:dark:border-zinc-600 [&_input]:shadow-md [&_input]:dark:shadow-[0_0_24px_4px_rgba(139,92,246,0.45)] [&_input]:focus:border-brand-violet-500 [&_input]:dark:focus:border-brand-violet-400 [&_input]:focus:ring-0 [&_input]:dark:focus:shadow-[0_0_32px_8px_rgba(139,92,246,0.65)]"
                {...codeForm.register("code", {
                  required: true,
                  pattern: /^[0-9]{6}$/,
                })}
              />
              {invalidCode && (
                <p className="text-sm text-red-500 dark:text-red-400 text-center">
                  {t("screens.LoginPage.codeStep.invalidCode")}
                </p>
              )}
              <button
                type="submit"
                disabled={codeForm.formState.isSubmitting}
                className="
                  w-full py-4 px-6 text-lg font-semibold
                  transition-all duration-200
                  bg-brand-violet-600 hover:bg-brand-violet-700 text-white
                  dark:bg-brand-violet-500 dark:hover:bg-brand-violet-600
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-md hover:shadow-brand-violet-500/30 hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-brand-violet-500 focus:ring-offset-2
                  dark:focus:ring-offset-zinc-900
                "
              >
                {codeForm.formState.isSubmitting
                  ? t(`${tHome}.auth.verifying`)
                  : t("screens.LoginPage.codeStep.submit")}
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="
                  w-full py-3 px-6 text-sm font-medium
                  transition-colors duration-200
                  text-zinc-500 dark:text-zinc-400
                  hover:text-zinc-900 dark:hover:text-zinc-200
                  focus:outline-none
                "
              >
                {t("screens.LoginPage.codeStep.back")}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── Scroll hint ───────────────────────────────────────────────────── */}
      <div className="flex justify-center py-6">
        <FaArrowCircleDown className="text-xl animate-bounce text-zinc-400 dark:text-zinc-600" />
      </div>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="relative z-10 bg-zinc-100 dark:bg-zinc-900 px-6 py-20 border-t border-zinc-300 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          <Typography as="h2" center decoration="bold">
            {t(`${tHome}.features.title`)}
          </Typography>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <FeatureCard
              icon={<MdSecurity className="text-3xl text-brand-violet-500" />}
              title={t(`${tHome}.features.security.title`)}
              description={t(`${tHome}.features.security.description`)}
            />
            <FeatureCard
              icon={<MdSpeed className="text-3xl text-brand-violet-500" />}
              title={t(`${tHome}.features.performance.title`)}
              description={t(`${tHome}.features.performance.description`)}
            />
            <FeatureCard
              icon={<MdExtension className="text-3xl text-brand-violet-500" />}
              title={t(`${tHome}.features.extensibility.title`)}
              description={t(`${tHome}.features.extensibility.description`)}
            />
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 bg-white dark:bg-zinc-950 px-6 py-12 border-t border-zinc-300 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between gap-8">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <img
                src="/logo-icon-square.png"
                alt="MAG"
                className="hidden dark:block w-7 h-7 object-contain"
              />
              <img
                src="/logo-blackwhite.png"
                alt="MAG"
                className="block dark:hidden w-7 h-7 object-contain opacity-80"
              />
              <Typography as="p" decoration="smooth">
                Mycelium API Gateway
              </Typography>
            </div>
            <div className="flex flex-col gap-2.5">
              <FooterLink href="https://www.linkedin.com/showcase/mycelium-api-gateway-mag/" icon={<FaLinkedin />}>
                MAG on LinkedIn
              </FooterLink>
              <FooterLink href="https://github.com/LepistaBioinformatics/mycelium" icon={<FaGithub />}>
                MAG on GitHub
              </FooterLink>
              <FooterLink href="https://github.com/LepistaBioinformatics/mycelium-webapp" icon={<FaGithub />}>
                MyWAPP on GitHub
              </FooterLink>
              <FooterLink href="https://lepistabioinformatics.github.io/mycelium-docs/" icon={<FaBookOpen />}>
                Documentation
              </FooterLink>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <Typography as="p" decoration="smooth">
              Mycelium &copy; 2025
            </Typography>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── FeatureCard ──────────────────────────────────────────────────────────────

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="
      flex flex-col gap-4 p-6 
      bg-white border border-zinc-200 shadow-md
      dark:bg-zinc-950 dark:border-zinc-800
    ">
      <div className="
        w-12 h-12 flex items-center justify-center
        bg-brand-violet-50 dark:bg-brand-violet-950
      ">
        {icon}
      </div>
      <Typography as="h5" decoration="bold">{title}</Typography>
      <Typography as="p" decoration="smooth">{description}</Typography>
    </div>
  );
}

// ── FooterLink ───────────────────────────────────────────────────────────────

interface FooterLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function FooterLink({ href, icon, children }: FooterLinkProps) {
  return (
    <Link
      to={href}
      target="_blank"
      className="
        flex gap-2 items-center text-sm
        text-zinc-500 dark:text-zinc-500
        hover:text-brand-violet-600 dark:hover:text-brand-violet-400
        transition-colors
      "
    >
      {icon}
      {children}
    </Link>
  );
}
