import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
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
import { TextInput } from "flowbite-react";
import { useDispatch } from "react-redux";
import { setNotification } from "@/states/notification.state";
import useProfile from "@/hooks/use-profile";
import PageBody from "@/components/ui/PageBody";
import ControlPanelBreadcrumbItem from "../ControlPanelBreadcrumbItem";
import { MdChecklist } from "react-icons/md";

type Account = components["schemas"]["Account"];
type AccountStatus = "loading" | "exists" | "missing";

const META_KEYS = [
  { key: "phone_number", labelKey: "phone", placeholder: "+1 555 000 0000" },
  { key: "telegram_user", labelKey: "telegram", placeholder: "@username" },
  { key: "whatsapp_user", labelKey: "whatsapp", placeholder: "+1 555 000 0000" },
  { key: "locale", labelKey: "locale", placeholder: "en" },
] as const;

type MetaKey = (typeof META_KEYS)[number]["key"];
type MetaRecord = Record<MetaKey, string>;
type MetaBoolRecord = Record<MetaKey, boolean>;

function makeMetaRecord(value: string): MetaRecord {
  return {
    phone_number: value,
    telegram_user: value,
    whatsapp_user: value,
    locale: value,
  };
}

function makeMetaBoolRecord(value: boolean): MetaBoolRecord {
  return {
    phone_number: value,
    telegram_user: value,
    whatsapp_user: value,
    locale: value,
  };
}

export default function Onboarding() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, getAccessTokenSilently } = useProfile();

  const [accountStatus, setAccountStatus] = useState<AccountStatus>("loading");
  const [account, setAccount] = useState<Account | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [metaValues, setMetaValues] = useState<MetaRecord>(makeMetaRecord(""));
  const [metaSaving, setMetaSaving] = useState<MetaBoolRecord>(makeMetaBoolRecord(false));
  const [metaSaved, setMetaSaved] = useState<MetaBoolRecord>(makeMetaBoolRecord(false));

  const tKey = "screens.Dashboard.Onboarding";

  useEffect(() => {
    if (!user?.email) return;

    profileGet({ withUrl: false }, getAccessTokenSilently)
      .then(() => accountsGet(getAccessTokenSilently))
      .then((acc) => {
        setAccount(acc);
        setAccountStatus("exists");
      })
      .catch(() => {
        setAccountStatus("missing");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  useEffect(() => {
    if (!account?.meta) return;
    setMetaValues((prev) => ({
      phone_number: account.meta?.phone_number ?? prev.phone_number,
      telegram_user: account.meta?.telegram_user ?? prev.telegram_user,
      whatsapp_user: account.meta?.whatsapp_user ?? prev.whatsapp_user,
      locale: account.meta?.locale ?? prev.locale,
    }));
  }, [account]);

  const handleCreateAccount = useCallback(async () => {
    if (!user?.email) return;
    setIsCreatingAccount(true);
    try {
      const emailStr = `${user.email.username}@${user.email.domain}`;
      await accountsCreate({ name: emailStr }, getAccessTokenSilently);

      const [acc] = await Promise.all([
        accountsGet(getAccessTokenSilently),
        profileGet({ withUrl: false }, getAccessTokenSilently),
      ]);

      setAccount(acc);
      setAccountStatus("exists");
    } catch (error) {
      dispatch(
        setNotification({
          notification:
            error instanceof Error
              ? error.message
              : t(`${tKey}.error`),
          type: "error",
        })
      );
    } finally {
      setIsCreatingAccount(false);
    }
  }, [user, getAccessTokenSilently, dispatch, t, tKey]);

  const handleSaveMeta = useCallback(
    async (key: MetaKey) => {
      setMetaSaving((prev) => ({ ...prev, [key]: true }));
      try {
        const isExisting = account?.meta != null && key in account.meta;
        const value = metaValues[key];

        if (isExisting) {
          await metaUpdate({ key, value }, getAccessTokenSilently);
        } else {
          await metaCreate({ key, value }, getAccessTokenSilently);
        }

        setAccount((prev) =>
          prev ? { ...prev, meta: { ...prev.meta, [key]: value } } : prev
        );
        setMetaSaved((prev) => ({ ...prev, [key]: true }));
        setTimeout(
          () => setMetaSaved((prev) => ({ ...prev, [key]: false })),
          2000
        );
      } catch (error) {
        dispatch(
          setNotification({
            notification:
              error instanceof Error
                ? error.message
                : t(`${tKey}.error`),
            type: "error",
          })
        );
      } finally {
        setMetaSaving((prev) => ({ ...prev, [key]: false }));
      }
    },
    [account, metaValues, getAccessTokenSilently, dispatch, t, tKey]
  );

  return (
    <PageBody padding="md" height="fit">
      <PageBody.Breadcrumb>
        <ControlPanelBreadcrumbItem />
        <PageBody.Breadcrumb.Item icon={MdChecklist}>
          {t(`${tKey}.breadcrumb`)}
        </PageBody.Breadcrumb.Item>
      </PageBody.Breadcrumb>

      <PageBody.Content padding="md" flex="col" gap={8}>
        <div className="flex flex-col gap-2">
          <Typography as="h3">{t(`${tKey}.title`)}</Typography>
          <Typography decoration="smooth">{t(`${tKey}.subtitle`)}</Typography>
        </div>

        {/* Timeline */}
        <div className="relative flex flex-col border-l-2 border-brand-violet-200 dark:border-brand-lime-900 ml-3 gap-0">
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
                  rounded
                  size="sm"
                >
                  {isCreatingAccount
                    ? t(`${tKey}.createAccount.creating`)
                    : t(`${tKey}.createAccount.button`)}
                </Button>
              </div>
            )}
          </TimelineItem>

          {/* Steps 2-5 — Optional meta */}
          {META_KEYS.map(({ key, labelKey, placeholder }) => (
            <TimelineItem
              key={key}
              done={account?.meta != null && key in account.meta && !!account.meta[key]}
              disabled={accountStatus !== "exists"}
              label={t(`${tKey}.meta.${labelKey}.title`)}
              optional
            >
              <div className="flex flex-col gap-2">
                <FormField
                  label={t(`${tKey}.meta.${labelKey}.title`)}
                  id={key}
                >
                  <TextInput
                    id={key}
                    type="text"
                    placeholder={placeholder}
                    value={metaValues[key]}
                    disabled={accountStatus !== "exists"}
                    onChange={(e) =>
                      setMetaValues((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                  />
                </FormField>

                <Button
                  onClick={() => handleSaveMeta(key)}
                  disabled={
                    accountStatus !== "exists" ||
                    metaSaving[key] ||
                    metaValues[key].trim() === ""
                  }
                  intent="secondary"
                  rounded
                  size="sm"
                >
                  {metaSaved[key]
                    ? t(`${tKey}.saved`)
                    : metaSaving[key]
                      ? t(`${tKey}.saving`)
                      : t(`${tKey}.save`)}
                </Button>
              </div>
            </TimelineItem>
          ))}
        </div>
      </PageBody.Content>
    </PageBody>
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
    ? "bg-brand-violet-500 dark:bg-brand-lime-500 border-brand-violet-500 dark:border-brand-lime-500"
    : loading
      ? "bg-zinc-300 dark:bg-zinc-600 border-zinc-300 dark:border-zinc-600 animate-pulse"
      : disabled
        ? "bg-zinc-200 dark:bg-zinc-700 border-zinc-200 dark:border-zinc-700"
        : "bg-white dark:bg-zinc-900 border-brand-violet-400 dark:border-brand-lime-600";

  return (
    <div className="relative pl-8 pb-8">
      {/* Dot */}
      <div
        className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${dotColor} flex items-center justify-center`}
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
        <Typography
          as="h6"
          decoration={disabled ? "smooth" : "normal"}
        >
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
