import AccountName from "@/components/AccountName";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FomField";
import { TextInput } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import validateEmail from "@/functions/validate-email";
import useProfile from "@/hooks/use-profile";
import { cn } from "@/lib/utils";
import { components } from "@/services/openapi/mycelium-schema";
import { guestsGuestUserToSubscriptionAccount } from "@/services/rpc/subscriptionsManager";
import { RootState } from "@/states/store";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { Check, Mail, Pencil } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import GuestRoleSelector, {
  GuestRoleSelectorProps,
} from "../GuestRoleSelector";

type Account = components["schemas"]["Account"];
type GuestRole = components["schemas"]["GuestRole"];

type Step = "email" | "role";

interface InviteError {
  title: string;
  detail?: string;
}

const PREFIX = "screens.Dashboard.Accounts.GuestToAccountModal";

interface Props extends Pick<GuestRoleSelectorProps, "restrictRoleToSlug"> {
  account: Account;
  isOpen: boolean;
  onClose: () => void;
  /** Called after a guest was invited, so the caller can refresh its lists */
  onInvited?: () => void;
  tenantId?: string | null;
}

/** Invite a user to an account in two steps: email, then role. */
export default function GuestToAccountModal({
  account,
  isOpen,
  onClose,
  onInvited,
  tenantId: tenantIdProp,
  ...guestRoleSelectorProps
}: Props) {
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<GuestRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<InviteError | null>(null);

  const { getAccessTokenSilently } = useProfile({
    roles: [MycRole.SubscriptionsManager],
    permissions: [MycPermission.Write],
    restrictSystemAccount: true,
  });

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const tenantId = useMemo(() => {
    if (tenantIdProp) return tenantIdProp;
    if (tenantInfo?.id) return tenantInfo.id;

    return null;
  }, [tenantIdProp, tenantInfo?.id]);

  const emailIsValid = validateEmail(email);

  const handleClose = () => {
    setStep("email");
    setEmail("");
    setSelectedRole(null);
    setError(null);
    onClose();
  };

  const goToRoleStep = (event: FormEvent) => {
    event.preventDefault();
    if (!emailIsValid) return;
    setError(null);
    setStep("role");
  };

  const handleInvite = async () => {
    if (!selectedRole?.id || !account.id) return;

    if (!tenantId) {
      setError({ title: t(`${PREFIX}.errors.missingTenant`) });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await guestsGuestUserToSubscriptionAccount(
        {
          tenantId,
          accountId: account.id,
          roleId: selectedRole.id,
          email: email.trim(),
        },
        getAccessTokenSilently
      );

      onInvited?.();

      handleClose();
    } catch (reason) {
      // Keep the gateway's reason as the detail under a friendly title.
      setError({
        title: t(`${PREFIX}.errors.generic`),
        detail:
          reason instanceof Error
            ? reason.message.replace(/^RPC error \([^)]*\) in [^:]+: /, "")
            : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} handleClose={handleClose}>
      <Modal.Header handleClose={handleClose}>
        <Typography as="h4">{t(`${PREFIX}.title`)}</Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-6 p-1 sm:p-3 w-full xl:min-w-[500px]">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              {t(`${PREFIX}.form.account.label`)}
            </span>
            <span className="font-display text-lg font-semibold text-foreground">
              <AccountName account={account} />
            </span>
          </div>

          <Stepper step={step} />

          {step === "email" && (
            <form className="flex flex-col gap-4" onSubmit={goToRoleStep}>
              <FormField
                id="email"
                label={t(`${PREFIX}.form.email.label`)}
                title={t(`${PREFIX}.form.email.title`)}
              >
                <TextInput
                  id="email"
                  type="email"
                  icon={Mail}
                  placeholder={t(`${PREFIX}.form.email.placeholder`)}
                  sizing="md"
                  autoFocus
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                {email && !emailIsValid && (
                  <span className="text-xs text-muted-foreground">
                    {t(`${PREFIX}.form.email.invalid`)}
                  </span>
                )}
              </FormField>

              <div className="flex justify-end">
                <Button type="submit" disabled={!emailIsValid}>
                  {t(`${PREFIX}.continue`)}
                </Button>
              </div>
            </form>
          )}

          {step === "role" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-3 py-2 dark:bg-surface-900">
                <span className="flex min-w-0 items-center gap-2 text-sm">
                  <Mail className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-foreground">{email}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Pencil className="size-3" />
                  {t(`${PREFIX}.changeEmail`)}
                </button>
              </div>

              <GuestRoleSelector
                label={t(`${PREFIX}.form.role.label`)}
                title={t(`${PREFIX}.form.role.title`)}
                selectedRole={selectedRole}
                setSelectedRole={(role) => setSelectedRole(role)}
                shouldBeSystemRole={account.isSystemAccount}
                {...guestRoleSelectorProps}
              />

              {error && (
                <Banner intent="error" boxed={false} title={error.title}>
                  {error.detail && (
                    <Typography as="small" decoration="smooth">
                      {error.detail}
                    </Typography>
                  )}
                </Banner>
              )}

              <div className="flex justify-between gap-3">
                <Button
                  intent="secondary"
                  onClick={() => setStep("email")}
                  disabled={isSubmitting}
                >
                  {t(`${PREFIX}.back`)}
                </Button>
                <Button
                  onClick={handleInvite}
                  disabled={!selectedRole || isSubmitting}
                >
                  {isSubmitting
                    ? t(`${PREFIX}.sending`)
                    : t(`${PREFIX}.form.invite`)}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}

function Stepper({ step }: { step: Step }) {
  const { t } = useTranslation();
  const steps: Step[] = ["email", "role"];
  const currentIndex = steps.indexOf(step);

  return (
    <ol className="flex items-center gap-3" aria-label={t(`${PREFIX}.steps.label`)}>
      {steps.map((item, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;

        return (
          <li key={item} className="flex flex-1 items-center gap-3">
            <span
              aria-current={current ? "step" : undefined}
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                current &&
                  "border-brand-300 bg-brand-100 text-brand-800 dark:border-brand-700 dark:bg-brand-900/60 dark:text-brand-100",
                done &&
                  "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/60 dark:text-green-300",
                !current && !done && "border-border text-muted-foreground"
              )}
            >
              {done ? <Check className="size-3.5" /> : index + 1}
            </span>
            <span
              className={cn(
                "text-sm",
                current ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              {t(`${PREFIX}.steps.${item}`)}
            </span>
            {index < steps.length - 1 && (
              <span className="h-px flex-1 bg-border" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
