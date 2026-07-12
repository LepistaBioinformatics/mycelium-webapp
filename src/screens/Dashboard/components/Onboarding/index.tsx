import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { components } from "@/services/openapi/mycelium-schema";
import {
  accountsCreate,
  accountsGet,
  metaCreate,
  metaUpdate,
  profileGet,
} from "@/services/rpc/beginners";
import Button from "@/components/ui/Button";
import Typography from "@/components/ui/Typography";
import FormField from "@/components/ui/FomField";
import { useDispatch } from "react-redux";
import { setNotification } from "@/states/notification.state";
import useProfile from "@/hooks/use-profile";
import PageBody from "@/components/ui/PageBody";
import ControlPanelBreadcrumbItem from "../ControlPanelBreadcrumbItem";
import { MdChecklist } from "react-icons/md";
import { FaTelegramPlane } from "react-icons/fa";
import { ActiveTab } from "../Profile/active-tab";

type Account = components["schemas"]["Account"];
type AccountStatus = "loading" | "exists" | "missing";

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------
//
// Only `locale` is collected here. `phone_number` and `whatsapp_user` were
// removed (2026-07-11): they're stored by the gateway (`AccountMetaKey`) but
// never read by anything — no SMS, no WhatsApp notification, nothing consumes
// them. `telegram_user` DOES have a real integration (alternate login via the
// Telegram bot — core/src/use_cases/gateway/telegram/*), so it stays
// reachable from here, but as an optional, non-blocking link out to the
// existing "Identity" tab rather than a step collected inline.

type MetaKey = "locale";
type MetaRecord = Record<MetaKey, string>;
type MetaBoolRecord = Record<MetaKey, boolean>;

const LOCALE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "es", label: "Español" },
];

function makeMetaRecord(value: string): MetaRecord {
  return { locale: value };
}

function makeMetaBoolRecord(value: boolean): MetaBoolRecord {
  return { locale: value };
}

// Steps: account + locale = 2. Telegram is an optional, uncounted extra.
const TOTAL_STEPS = 2;

function isTelegramLinked(meta: Record<string, string> | undefined): boolean {
  try {
    const raw = meta?.telegram_user;
    if (!raw) return false;
    const parsed = JSON.parse(raw) as unknown;
    return (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as Record<string, unknown>).id === "number"
    );
  } catch {
    return false;
  }
}

export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, getAccessTokenSilently } = useProfile();

  const [accountStatus, setAccountStatus] = useState<AccountStatus>("loading");
  const [account, setAccount] = useState<Account | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [metaValues, setMetaValues] = useState<MetaRecord>(makeMetaRecord(""));
  const [metaSaving, setMetaSaving] = useState<MetaBoolRecord>(makeMetaBoolRecord(false));
  const [metaSaved, setMetaSaved] = useState<MetaBoolRecord>(makeMetaBoolRecord(false));
  const [isEditing, setIsEditing] = useState(false);

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
      .catch(() => {
        setAccountStatus("missing");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  useEffect(() => {
    if (!account?.meta) return;
    setMetaValues((prev) => ({
      locale: account.meta?.locale ?? prev.locale,
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
  const localeSet = !!(meta?.locale);
  const telegramSet = isTelegramLinked(meta);

  const completedSteps =
    (accountStatus === "exists" ? 1 : 0) + (localeSet ? 1 : 0);

  const allDone = completedSteps === TOTAL_STEPS;

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
        <ProgressBar completed={completedSteps} total={TOTAL_STEPS} tKey={tKey} />

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

              {/* Step 2 — Locale */}
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

              {/* Optional — Connect Telegram (not counted in progress) */}
              <TimelineItem
                done={telegramSet}
                disabled={accountStatus !== "exists"}
                label={t(`${tKey}.meta.telegram.title`)}
                optional
              >
                <div className="flex flex-col gap-3">
                  <Typography as="small" decoration="smooth">
                    {telegramSet
                      ? t(`${tKey}.meta.telegram.linkedHint`)
                      : t(`${tKey}.meta.telegram.linkHint`)}
                  </Typography>

                  {!telegramSet && (
                    <div>
                      <Button
                        intent="secondary"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/dashboard/profile?tab=${ActiveTab.TelegramIdentity}`
                          )
                        }
                      >
                        <span className="inline-flex items-center gap-2">
                          <FaTelegramPlane />
                          {t(`${tKey}.meta.telegram.button`)}
                        </span>
                      </Button>
                    </div>
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
      <div className="w-12 h-12 rounded-full bg-brand-violet-500 dark:bg-brand-violet-400 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
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
      <div className="w-16 h-16 rounded-full bg-brand-violet-100 dark:bg-brand-900 flex items-center justify-center">
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
      className="block w-full rounded-lg border border-brand-600 bg-brand-violet-50 px-3 py-2 text-zinc-900 focus:border-brand-violet-500 focus:ring-1 focus:ring-brand-violet-500 focus:outline-none dark:bg-brand-950 dark:text-white dark:focus:border-brand-violet-400 dark:focus:ring-brand-violet-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
        : "bg-white dark:bg-brand-950 border-brand-violet-400 dark:border-brand-violet-500";

  return (
    <div className="relative pl-8 pb-8">
      {/* Dot */}
      <div
        className={`absolute -left-[9px] top-1 w-4 h-4 rounded-lg border-2 ${dotColor} flex items-center justify-center`}
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
