import { useTranslation } from "react-i18next";
import Skeleton from "@/components/ui/Skeleton";
import { mutate as mutateSWR } from "swr";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { components } from "@/services/openapi/mycelium-schema";
import {
  accountsCreate,
  accountsGet,
  accountsUpdateName,
  metaCreate,
  metaUpdate,
  profileGet,
} from "@/services/rpc/beginners";
import Button from "@/components/ui/Button";
import Typography from "@/components/ui/Typography";
import FormField from "@/components/ui/FomField";
import { useDispatch } from "react-redux";
import { setNotification } from "@/states/notification.state";
import useProfile, { invalidateProfile } from "@/hooks/use-profile";
import useGatewayHealth from "@/hooks/use-gateway-health";
import PageBody from "@/components/ui/PageBody";
import ControlPanelBreadcrumbItem from "../ControlPanelBreadcrumbItem";
import { MdChecklist } from "react-icons/md";
import { onboardingProgress } from "@/functions/onboarding-progress";
import isPrivilegedAccount from "@/functions/is-privileged-account";
import { TextInput } from "@/components/ui/Input";

type Account = components["schemas"]["Account"];
type AccountStatus = "loading" | "exists" | "missing";

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------
//
// The onboarding collects what identifies the person behind the account:
// their name (the account is created with the email as its name), the
// language, and — for privileged roles, the ones the required-contact banner
// asks for — a phone number and job title (`phone_number`, `job_title`,
// standard `AccountMetaKey`s). Telegram stays on the Profile's Identity tab.

type MetaKey = "locale" | "phone_number" | "job_title";
type MetaRecord = Record<MetaKey, string>;
type MetaBoolRecord = Record<MetaKey, boolean>;

const LOCALE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "es", label: "Español" },
];

function makeMetaRecord(value: string): MetaRecord {
  return { locale: value, phone_number: value, job_title: value };
}

function makeMetaBoolRecord(value: boolean): MetaBoolRecord {
  return { locale: value, phone_number: value, job_title: value };
}

export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, profile, getAccessTokenSilently } = useProfile();
  const { isGatewayDown } = useGatewayHealth();

  const [accountStatus, setAccountStatus] = useState<AccountStatus>("loading");
  const [account, setAccount] = useState<Account | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [metaValues, setMetaValues] = useState<MetaRecord>(makeMetaRecord(""));
  const [metaSaving, setMetaSaving] = useState<MetaBoolRecord>(makeMetaBoolRecord(false));
  const [metaSaved, setMetaSaved] = useState<MetaBoolRecord>(makeMetaBoolRecord(false));
  const [isEditing, setIsEditing] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const tKey = "screens.Dashboard.Onboarding";

  const emailStr = user?.email
    ? `${user.email.username}@${user.email.domain}`
    : "";

  useEffect(() => {
    if (!user?.email) return;

    profileGet({ withUrl: false }, getAccessTokenSilently)
      .then(() => accountsGet(getAccessTokenSilently))
      .then((acc) => {
        if (acc) {
          setAccount(acc);
          setAccountStatus("exists");
        } else {
          setAccountStatus("missing");
        }
      })
      .catch((error) => {
        // fetch() rejects with TypeError when the gateway is unreachable:
        // that says nothing about the account, so keep "loading" (the
        // unavailable overlay covers the screen) and retry once it is back.
        if (error instanceof TypeError) return;
        setAccountStatus("missing");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, isGatewayDown]);

  useEffect(() => {
    if (!account?.meta) return;
    setMetaValues((prev) => ({
      locale: account.meta?.locale ?? prev.locale,
      phone_number: account.meta?.phone_number ?? prev.phone_number,
      job_title: account.meta?.job_title ?? prev.job_title,
    }));
    if (account.meta?.locale) {
      const i18nKey = account.meta.locale === "pt-BR" ? "ptBr" : account.meta.locale;
      i18n.changeLanguage(i18nKey);
    }
  }, [account, i18n]);

  const handleCreateAccount = useCallback(async () => {
    if (!emailStr) return;
    setIsCreatingAccount(true);
    try {
      await accountsCreate({ name: emailStr }, getAccessTokenSilently);

      // The app loaded the profile at sign-in, when there was no account yet;
      // refresh it so the dashboard routes get registered.
      await invalidateProfile();
      // The sidebar's onboarding ring-3 reads the account from this SWR key
      void mutateSWR("rpc:beginners.accounts.get");

      const [acc] = await Promise.all([
        accountsGet(getAccessTokenSilently),
        profileGet({ withUrl: false }, getAccessTokenSilently),
      ]);

      if (acc) {
        setAccount(acc);
        setAccountStatus("exists");
      } else {
        setAccountStatus("missing");
      }
    } catch (error) {
      dispatch(
        setNotification({
          notification:
            error instanceof Error ? error.message : t(`${tKey}.error`),
          type: "error",
        })
      );
    } finally {
      setIsCreatingAccount(false);
    }
  }, [emailStr, getAccessTokenSilently, dispatch, t, tKey]);

  const handleSaveName = useCallback(async () => {
    if (!account?.id || nameValue.trim() === "") return;
    setIsSavingName(true);
    try {
      const updated = await accountsUpdateName(
        { accountId: account.id, name: nameValue.trim() },
        getAccessTokenSilently
      );
      setAccount((prev) => (prev ? { ...prev, name: updated?.name ?? nameValue.trim() } : prev));
      void mutateSWR("rpc:beginners.accounts.get");
    } catch (error) {
      dispatch(
        setNotification({
          notification:
            error instanceof Error ? error.message : t(`${tKey}.error`),
          type: "error",
        })
      );
    } finally {
      setIsSavingName(false);
    }
  }, [account?.id, nameValue, getAccessTokenSilently, dispatch, t, tKey]);

  const handleSaveMeta = useCallback(
    async (key: MetaKey) => {
      setMetaSaving((prev) => ({ ...prev, [key]: true }));
      try {
        const meta = account?.meta as Record<string, string> | undefined;
        const value = metaValues[key];
        const isExisting = meta != null && key in meta;

        if (isExisting) {
          await metaUpdate({ key, value }, getAccessTokenSilently);
        } else {
          await metaCreate({ key, value }, getAccessTokenSilently);
        }

        setAccount((prev) =>
          prev ? { ...prev, meta: { ...prev.meta, [key]: value } } : prev
        );

        if (key === "locale") {
          const i18nKey = value === "pt-BR" ? "ptBr" : value;
          i18n.changeLanguage(i18nKey);
        }

        setMetaSaved((prev) => ({ ...prev, [key]: true }));
        void mutateSWR("rpc:beginners.accounts.get");
        setTimeout(
          () => setMetaSaved((prev) => ({ ...prev, [key]: false })),
          2000
        );
      } catch (error) {
        dispatch(
          setNotification({
            notification:
              error instanceof Error ? error.message : t(`${tKey}.error`),
            type: "error",
          })
        );
      } finally {
        setMetaSaving((prev) => ({ ...prev, [key]: false }));
      }
    },
    [account, metaValues, getAccessTokenSilently, dispatch, t, i18n, tKey]
  );

  const meta = account?.meta as Record<string, string> | undefined;
  const privileged = isPrivilegedAccount(profile);
  const progress = onboardingProgress(
    accountStatus === "exists" ? account : null,
    emailStr,
    privileged
  );
  const localeSet = progress.steps.locale;
  const completedSteps = progress.done;
  const allDone = progress.isComplete;
  const contactChanged =
    metaValues.phone_number !== (meta?.phone_number ?? "") ||
    metaValues.job_title !== (meta?.job_title ?? "");

  const handleSaveContact = async () => {
    if (metaValues.phone_number !== (meta?.phone_number ?? "")) {
      await handleSaveMeta("phone_number");
    }
    if (metaValues.job_title !== (meta?.job_title ?? "")) {
      await handleSaveMeta("job_title");
    }
  };

  return (
    <div className="p-1 sm:p-5">
      <PageBody.Breadcrumb>
        <ControlPanelBreadcrumbItem />
        <PageBody.Breadcrumb.Item icon={MdChecklist}>
          {t(`${tKey}.breadcrumb`)}
        </PageBody.Breadcrumb.Item>
      </PageBody.Breadcrumb>

      <div className="max-w-2xl mx-auto flex flex-col gap-8 mt-4">
        {/* B — Welcome header */}
        <WelcomeHeader emailStr={emailStr} tKey={tKey} />

        {/* A — Progress bar */}
        {accountStatus === "loading" ? (
          <Skeleton shape="block" className="h-10 w-full" />
        ) : (
          <ProgressBar completed={completedSteps} total={progress.total} tKey={tKey} />
        )}

        {/* D — All done: completion card */}
        {allDone && !isEditing ? (
          <CompletionCard
            tKey={tKey}
            onNavigate={() => navigate("/dashboard/profile")}
            onEdit={() => setIsEditing(true)}
          />
        ) : (
          <>
            {/* Timeline */}
            <div className="relative flex flex-col border-l-2 border-brand-violet-200 dark:border-brand-violet-800 ml-3 gap-0">
              {/* Step 1 — Create account */}
              <TimelineItem
                done={accountStatus === "exists"}
                loading={accountStatus === "loading"}
                label={t(`${tKey}.createAccount.stepLabel`)}
              >
                {accountStatus === "loading" && (
                  <Typography decoration="smooth" as="small">
                    {t(`${tKey}.checkingAccount`)}
                  </Typography>
                )}
                {accountStatus === "exists" && (
                  <Typography as="small" decoration="smooth">
                    {t(`${tKey}.createAccount.complete`)}
                  </Typography>
                )}
                {accountStatus === "missing" && (
                  <div className="flex flex-col gap-3">
                    <Typography as="small" decoration="smooth">
                      {t(`${tKey}.createAccount.description`)}
                    </Typography>
                    <Button
                      onClick={handleCreateAccount}
                      disabled={isCreatingAccount}
                      size="sm"
                    >
                      {isCreatingAccount
                        ? t(`${tKey}.createAccount.creating`)
                        : t(`${tKey}.createAccount.button`)}
                    </Button>
                  </div>
                )}
              </TimelineItem>

              {/* Step 2 — Name */}
              <TimelineItem
                done={progress.steps.name}
                disabled={accountStatus !== "exists"}
                label={t(`${tKey}.name.title`)}
              >
                <div className="flex flex-col gap-2">
                  <Typography as="small" decoration="smooth">
                    {t(`${tKey}.name.description`)}
                  </Typography>
                  <FormField label={t(`${tKey}.name.label`)} id="onboarding-name">
                    <TextInput
                      id="onboarding-name"
                      value={nameValue || (progress.steps.name ? account?.name ?? "" : "")}
                      disabled={accountStatus !== "exists"}
                      placeholder={t(`${tKey}.name.placeholder`)}
                      autoComplete="name"
                      onChange={(event) => setNameValue(event.target.value)}
                    />
                  </FormField>
                  {nameValue.trim() !== "" && nameValue.trim() !== account?.name && (
                    <Button
                      onClick={handleSaveName}
                      disabled={isSavingName}
                      intent="secondary"
                      size="sm"
                    >
                      {isSavingName ? t(`${tKey}.saving`) : t(`${tKey}.save`)}
                    </Button>
                  )}
                </div>
              </TimelineItem>

              {/* Step 3 — Locale */}
              <TimelineItem
                done={localeSet}
                disabled={accountStatus !== "exists"}
                label={t(`${tKey}.meta.locale.title`)}
              >
                <div className="flex flex-col gap-2">
                  <Typography as="small" decoration="smooth">
                    {t(`${tKey}.meta.locale.description`)}
                  </Typography>

                  <FormField label={t(`${tKey}.meta.locale.title`)} id="locale">
                    <LocaleSelect
                      id="locale"
                      value={metaValues.locale}
                      disabled={accountStatus !== "exists"}
                      onChange={(val) =>
                        setMetaValues((prev) => ({ ...prev, locale: val }))
                      }
                      tKey={tKey}
                    />
                  </FormField>

                  {metaValues.locale !== (meta?.locale ?? "") && (
                    <Button
                      onClick={() => handleSaveMeta("locale")}
                      disabled={
                        accountStatus !== "exists" ||
                        metaSaving.locale ||
                        metaValues.locale.trim() === ""
                      }
                      intent="secondary"
                      size="sm"
                    >
                      {metaSaved.locale
                        ? t(`${tKey}.saved`)
                        : metaSaving.locale
                          ? t(`${tKey}.saving`)
                          : t(`${tKey}.save`)}
                    </Button>
                  )}
                </div>
              </TimelineItem>

              {/* Step 4 — Work contact (required for privileged roles) */}
              <TimelineItem
                done={progress.steps.contact}
                disabled={accountStatus !== "exists"}
                label={t(`${tKey}.contact.title`)}
                optional={!privileged}
              >
                <div className="flex flex-col gap-2">
                  <Typography as="small" decoration="smooth">
                    {privileged
                      ? t(`${tKey}.contact.requiredDescription`)
                      : t(`${tKey}.contact.optionalDescription`)}
                  </Typography>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label={t(`${tKey}.contact.phone`)} id="onboarding-phone">
                      <TextInput
                        id="onboarding-phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+1 555 000 0000"
                        value={metaValues.phone_number}
                        disabled={accountStatus !== "exists"}
                        onChange={(event) =>
                          setMetaValues((prev) => ({ ...prev, phone_number: event.target.value }))
                        }
                      />
                    </FormField>
                    <FormField label={t(`${tKey}.contact.jobTitle`)} id="onboarding-job">
                      <TextInput
                        id="onboarding-job"
                        autoComplete="organization-title"
                        placeholder={t(`${tKey}.contact.jobTitlePlaceholder`)}
                        value={metaValues.job_title}
                        disabled={accountStatus !== "exists"}
                        onChange={(event) =>
                          setMetaValues((prev) => ({ ...prev, job_title: event.target.value }))
                        }
                      />
                    </FormField>
                  </div>
                  {contactChanged && (
                    <Button
                      onClick={handleSaveContact}
                      disabled={metaSaving.phone_number || metaSaving.job_title}
                      intent="secondary"
                      size="sm"
                    >
                      {metaSaving.phone_number || metaSaving.job_title
                        ? t(`${tKey}.saving`)
                        : t(`${tKey}.save`)}
                    </Button>
                  )}
                </div>
              </TimelineItem>
            </div>

            {/* E — Go to dashboard */}
            {accountStatus === "exists" && (
              <div className="flex justify-center pb-8">
                <Button onClick={() => navigate("/dashboard/profile")}>
                  {t(`${tKey}.goToDashboard`)}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WelcomeHeader (B)
// ---------------------------------------------------------------------------

function WelcomeHeader({ emailStr, tKey }: { emailStr: string; tKey: string }) {
  const { t } = useTranslation();
  const initials = emailStr ? (emailStr[0] ?? "?").toUpperCase() : "?";

  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-200 ring-1 ring-brand-200 dark:ring-brand-700 flex items-center justify-center font-bold text-xl shrink-0">
        {initials}
      </div>
      <div className="flex flex-col gap-0.5">
        <Typography as="h3">
          {t(`${tKey}.welcome`, { name: emailStr })}
        </Typography>
        <Typography decoration="smooth">{t(`${tKey}.subtitle`)}</Typography>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProgressBar (A)
// ---------------------------------------------------------------------------

function ProgressBar({
  completed,
  total,
  tKey,
}: {
  completed: number;
  total: number;
  tKey: string;
}) {
  const { t } = useTranslation();
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <Typography as="small" decoration="smooth">
          {t(`${tKey}.progress`, { done: completed, total })}
        </Typography>
        <Typography as="small" decoration="smooth">
          {pct}%
        </Typography>
      </div>
      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
        <div
          className="h-full bg-brand-violet-500 dark:bg-brand-violet-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CompletionCard (D)
// ---------------------------------------------------------------------------

function CompletionCard({
  tKey,
  onNavigate,
  onEdit,
}: {
  tKey: string;
  onNavigate: () => void;
  onEdit: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-brand-violet-100 dark:bg-surface-900 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-brand-violet-500 dark:text-brand-violet-400"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        <Typography as="h3">{t(`${tKey}.completionTitle`)}</Typography>
        <Typography decoration="smooth">
          {t(`${tKey}.completionSubtitle`)}
        </Typography>
      </div>
      <div className="flex gap-3">
        <Button intent="secondary" onClick={onEdit}>
          {t(`${tKey}.edit`)}
        </Button>
        <Button onClick={onNavigate}>
          {t(`${tKey}.goToDashboard`)}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LocaleSelect (F)
// ---------------------------------------------------------------------------

function LocaleSelect({
  id,
  value,
  disabled,
  onChange,
  tKey,
}: {
  id: string;
  value: string;
  disabled: boolean;
  onChange: (val: string) => void;
  tKey: string;
}) {
  const { t } = useTranslation();

  return (
    <select
      id={id}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full rounded-md border border-input bg-field text-foreground shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2"
    >
      <option value="">{t(`${tKey}.meta.locale.placeholder`)}</option>
      {LOCALE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ---------------------------------------------------------------------------
// TimelineItem
// ---------------------------------------------------------------------------

interface TimelineItemProps {
  done: boolean;
  loading?: boolean;
  disabled?: boolean;
  optional?: boolean;
  label: string;
  children: React.ReactNode;
}

function TimelineItem({
  done,
  loading,
  disabled,
  optional,
  label,
  children,
}: TimelineItemProps) {
  const dotColor = done
    ? "bg-brand-violet-500 dark:bg-brand-violet-400 border-brand-violet-500 dark:border-brand-violet-400"
    : loading
      ? "bg-zinc-300 dark:bg-zinc-600 border-zinc-300 dark:border-zinc-600 animate-pulse"
      : disabled
        ? "bg-zinc-200 dark:bg-zinc-700 border-zinc-200 dark:border-zinc-700"
        : "bg-white dark:bg-surface-950 border-brand-violet-400 dark:border-brand-violet-500";

  return (
    <div className="relative pl-8 pb-8">
      {/* Dot */}
      <div
        className={`absolute left-[-9px] top-1 w-4 h-4 rounded-lg border-2 ${dotColor} flex items-center justify-center`}
      >
        {done && (
          <svg
            className="w-2.5 h-2.5 text-white dark:text-zinc-900"
            fill="none"
            viewBox="0 0 10 8"
          >
            <path
              d="M1 4l3 3 5-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Label */}
      <div className="flex items-center gap-2 mb-2">
        <Typography as="h6" decoration={disabled ? "smooth" : "normal"}>
          {label}
        </Typography>
        {optional && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal">
            (optional)
          </span>
        )}
      </div>

      {/* Content */}
      <div className={disabled ? "opacity-40 pointer-events-none" : undefined}>
        {children}
      </div>
    </div>
  );
}
