import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { TextInput } from "@/components/ui/Input";
import { Link } from "react-router";
import {
  FaArrowCircleDown,
  FaBookOpen,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";
import { MdSecurity, MdSpeed, MdExtension, MdErrorOutline } from "react-icons/md";

import Typography from "@/components/ui/Typography";
import AppHeader from "@/components/ui/AppHeader";
import { buttonStyles } from "@/components/ui/button-styles";

import { requestMagicLink, verifyMagicLink } from "@/services/auth/magic-link";
import { setNotification } from "@/states/notification.state";
import { useNativeAuthContext } from "@/contexts/NativeAuthContext";
import { InvalidCodeError } from "@/types/NativeAuth";
import useProfile from "@/hooks/use-profile";
import { useAppConfig } from "@/hooks/use-app-config";
import useHostedLogin from "@/hooks/use-hosted-login";
import { withBasePath } from "@/functions/with-base-path";
import CtaButton from "@/components/ui/CtaButton";
import { KeyRound, LogIn, Mail } from "lucide-react";

type EmailForm = { email: string };
type CodeForm = { code: string };

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setAuth } = useNativeAuthContext();
  const { isAuthenticated, isLoadingUser, logout } = useProfile();
  const { appConfig } = useAppConfig();
  const { isHostedLogin, isMagicLink, isRedirecting, signIn } =
    useHostedLogin();

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
    <div className="bg-background min-h-screen flex flex-col">

      {/* Full-page logo background — light mode */}
      <div className="fixed inset-0 z-0 dark:hidden bg-[url(/logo-blackwhite.png)] bg-center bg-cover opacity-[0.14]" />
      {/* Full-page logo background — dark mode */}
      <div className="fixed inset-0 z-0 hidden dark:block bg-[url(/logo-color.png)] bg-center bg-cover opacity-[0.18]" />

      <AppHeader discrete logout={logout} />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-1 items-center justify-center min-h-[calc(100vh-4rem)]">

        {/* Auth panel */}
        <div className="relative z-10 w-full max-w-md px-4 flex flex-col gap-6">

          {/* Brand */}
          <div className="flex flex-col gap-2 text-center">
            <Typography as="h1" decoration="bold" center>
              {appConfig?.domainName ?? t(`${tHome}.hero.name`)}
            </Typography>
            <Typography as="p" decoration="smooth" center>
              {t(`${tHome}.hero.tagline`)}
            </Typography>
          </div>

          {/* Forms (magic link) sit in a card; the hosted sign-in is a single
              link, so it stands on the page without one. */}
          <div
            className={
              isHostedLogin
                ? "flex flex-col items-center"
                : "flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-raised"
            }
          >
          {isHostedLogin && (
            <CtaButton
              variant="link"
              icon={LogIn}
              onClick={signIn}
              loading={isRedirecting}
            >
              {isRedirecting
                ? t("screens.HostedLogin.redirecting")
                : t("screens.HostedLogin.signIn")}
            </CtaButton>
          )}

          {isMagicLink && step === "email" && (
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
                prominent
                {...emailForm.register("email", { required: true })}
              />
              <CtaButton
                type="submit"
                icon={Mail}
                loading={emailForm.formState.isSubmitting}
              >
                {emailForm.formState.isSubmitting
                  ? t(`${tHome}.auth.sending`)
                  : t("screens.LoginPage.emailStep.submit")}
              </CtaButton>
            </form>
          )}

          {isMagicLink && step === "code" && (
            <form
              onSubmit={codeForm.handleSubmit(onSubmitCode)}
              className="flex flex-col gap-6"
            >
              <p className="text-sm text-center text-muted-foreground">
                {t("screens.LoginPage.codeStep.instruction")}{" "}
                <span className="text-primary dark:text-brand-300 font-medium">
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
                prominent
                className="[&_input]:text-2xl [&_input]:tracking-[0.5em] [&_input]:text-center [&_input]:font-mono"
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
              <CtaButton
                type="submit"
                icon={KeyRound}
                loading={codeForm.formState.isSubmitting}
              >
                {codeForm.formState.isSubmitting
                  ? t(`${tHome}.auth.verifying`)
                  : t("screens.LoginPage.codeStep.submit")}
              </CtaButton>
              <button
                type="button"
                onClick={handleBack}
                className={buttonStyles({ intent: "link", size: "sm", fullWidth: true })}
              >
                {t("screens.LoginPage.codeStep.back")}
              </button>
            </form>
          )}
          </div>
        </div>
      </section>

      {/* ── Scroll hint ───────────────────────────────────────────────────── */}
      <div className="flex justify-center py-6">
        <FaArrowCircleDown className="text-xl animate-bounce text-muted-foreground/60" />
      </div>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="relative z-10 bg-muted/70 dark:bg-surface-900/80 px-6 py-20 border-t border-border backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          <Typography as="h2" center decoration="bold">
            {t(`${tHome}.features.title`)}
          </Typography>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <FeatureCard
              icon={<MdSecurity className="size-6" />}
              title={t(`${tHome}.features.security.title`)}
              description={t(`${tHome}.features.security.description`)}
            />
            <FeatureCard
              icon={<MdSpeed className="size-6" />}
              title={t(`${tHome}.features.performance.title`)}
              description={t(`${tHome}.features.performance.description`)}
            />
            <FeatureCard
              icon={<MdExtension className="size-6" />}
              title={t(`${tHome}.features.extensibility.title`)}
              description={t(`${tHome}.features.extensibility.description`)}
            />
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 bg-card px-6 py-12 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between gap-8">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <img
                src={withBasePath("logo-icon-square.png")}
                alt="MAG"
                className="hidden dark:block w-7 h-7 object-contain"
              />
              <img
                src={withBasePath("logo-blackwhite.png")}
                alt="MAG"
                className="block dark:hidden w-7 h-7 object-contain opacity-80"
              />
              <Typography as="p" decoration="smooth">
                {appConfig?.domainName ?? t(`${tHome}.hero.name`)}
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
              <FooterLink href="https://lepistabioinformatics.github.io/mycelium/" icon={<FaBookOpen />}>
                Documentation
              </FooterLink>
              <Link
                to="/error-codes"
                className="flex gap-2 items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MdErrorOutline />
                {t("screens.PublicErrorCodes.footerLink")}
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <Typography as="p" decoration="smooth">
              {appConfig?.domainName ?? t(`${tHome}.hero.name`)} &copy;{" "}
              {new Date().getFullYear()}
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
    <div className="flex flex-col gap-4 p-6 rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-raised">
      <div className="size-12 flex items-center justify-center rounded-lg border border-brand-200 bg-brand-100 text-brand-700 dark:border-brand-700 dark:bg-brand-900/60 dark:text-brand-200">
        {icon}
      </div>
      <Typography as="h5" decoration="semibold">{title}</Typography>
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
      className="flex gap-2 items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}
