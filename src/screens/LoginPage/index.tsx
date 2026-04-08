import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { TextInput } from "flowbite-react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import PageBody from "@/components/ui/PageBody";
import AppHeader from "@/components/ui/AppHeader";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FomField";
import Typography from "@/components/ui/Typography";

import { requestMagicLink, verifyMagicLink } from "@/services/auth/magic-link";
import { setNotification } from "@/states/notification.state";
import { useNativeAuthContext } from "@/contexts/NativeAuthContext";
import { InvalidCodeError } from "@/types/NativeAuth";

type EmailForm = { email: string };
type CodeForm = { code: string };

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setAuth } = useNativeAuthContext();

  const [step, setStep] = useState<"email" | "code">("email");
  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  const [invalidCode, setInvalidCode] = useState(false);

  const emailForm = useForm<EmailForm>();
  const codeForm = useForm<CodeForm>();

  const onSubmitEmail = async (data: EmailForm) => {
    try {
      await requestMagicLink(data.email);
      setSubmittedEmail(data.email);
      setStep("code");
    } catch (err) {
      dispatch(
        setNotification({
          notification:
            err instanceof Error ? err.message : "Failed to send magic link",
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
      navigate("/");
    } catch (err) {
      if (err instanceof InvalidCodeError) {
        setInvalidCode(true);
      } else {
        dispatch(
          setNotification({
            notification:
              err instanceof Error
                ? err.message
                : "Magic link verification failed",
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

  return (
    <PageBody justify="center" flex className="h-[95vh]">
      <AppHeader discrete logout={() => undefined} />

      <PageBody.Content gap={3} padding="none">
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
            {step === "email" && (
              <>
                <Typography as="h2" center>
                  {t("screens.LoginPage.emailStep.title")}
                </Typography>

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
                <Typography as="h2" center>
                  {t("screens.LoginPage.codeStep.title")}
                </Typography>

                <Typography decoration="smooth" center>
                  {t("screens.LoginPage.codeStep.instruction")}
                </Typography>

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
                      {...codeForm.register("code", {
                        required: true,
                        pattern: /^[0-9]{6}$/,
                      })}
                    />
                    {invalidCode && (
                      <Typography as="small" decoration="smooth">
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
      </PageBody.Content>
    </PageBody>
  );
}
