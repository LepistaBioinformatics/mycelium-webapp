import { useTranslation } from "react-i18next";
import { NativeUser } from "@/types/NativeAuth";
import useProfile from "@/hooks/use-profile";
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
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setNotification } from "@/states/notification.state";

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

interface Props {
  user: NativeUser | null;
}

export default function MyceliumProfile({ user }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getAccessTokenSilently } = useProfile();

  const [accountStatus, setAccountStatus] =
    useState<AccountStatus>("loading");
  const [account, setAccount] = useState<Account | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const [metaValues, setMetaValues] = useState<MetaRecord>(
    makeMetaRecord("")
  );
  const [metaSaving, setMetaSaving] =
    useState<MetaBoolRecord>(makeMetaBoolRecord(false));
  const [metaSaved, setMetaSaved] =
    useState<MetaBoolRecord>(makeMetaBoolRecord(false));

  // Check account existence via profileGet on mount
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
  // getAccessTokenSilently is stable across renders (memoized in the hook)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  // Pre-fill meta values from account when account loads
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
              : t("screens.HomePage.OnboardingChecklist.error"),
          type: "error",
        })
      );
    } finally {
      setIsCreatingAccount(false);
    }
  }, [user, getAccessTokenSilently, dispatch, t]);

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
                : t("screens.HomePage.OnboardingChecklist.error"),
            type: "error",
          })
        );
      } finally {
        setMetaSaving((prev) => ({ ...prev, [key]: false }));
      }
    },
    [account, metaValues, getAccessTokenSilently, dispatch, t]
  );

  if (!user) return null;

  const tKey = "screens.HomePage.OnboardingChecklist";

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      {/* Required section */}
      <div className="flex flex-col gap-3">
        <Typography as="h5" decoration="smooth">
          {t(`${tKey}.requiredSection`)}
        </Typography>

        <div className="flex flex-col gap-2 border rounded-lg p-4 dark:border-zinc-700">
          {accountStatus === "loading" && (
            <Typography decoration="smooth">
              {t(`${tKey}.checkingAccount`)}
            </Typography>
          )}

          {accountStatus === "exists" && (
            <div className="flex items-center gap-2">
              <span className="text-green-500">&#10003;</span>
              <Typography>{t(`${tKey}.createAccount.complete`)}</Typography>
            </div>
          )}

          {accountStatus === "missing" && (
            <div className="flex flex-col gap-2">
              <Typography as="h6">
                {t(`${tKey}.createAccount.title`)}
              </Typography>
              <Typography as="small" decoration="smooth">
                {t(`${tKey}.createAccount.description`)}
              </Typography>
              <Button
                onClick={handleCreateAccount}
                disabled={isCreatingAccount}
                fullWidth
                rounded
              >
                {isCreatingAccount
                  ? t(`${tKey}.createAccount.creating`)
                  : t(`${tKey}.createAccount.button`)}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Optional section — only visible once account exists */}
      {accountStatus === "exists" && (
        <div className="flex flex-col gap-3">
          <Typography as="h5" decoration="smooth">
            {t(`${tKey}.optionalSection`)}
          </Typography>

          <div className="flex flex-col gap-4">
            {META_KEYS.map(({ key, labelKey, placeholder }) => (
              <div
                key={key}
                className="flex flex-col gap-2 border rounded-lg p-4 dark:border-zinc-700"
              >
                <FormField
                  label={t(`${tKey}.meta.${labelKey}.title`)}
                  id={key}
                >
                  <TextInput
                    id={key}
                    type="text"
                    placeholder={placeholder}
                    value={metaValues[key]}
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
                  disabled={metaSaving[key] || metaValues[key].trim() === ""}
                  intent="secondary"
                  rounded
                  fullWidth
                >
                  {metaSaved[key]
                    ? t(`${tKey}.saved`)
                    : metaSaving[key]
                      ? t(`${tKey}.saving`)
                      : t(`${tKey}.save`)}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Go to dashboard */}
      {accountStatus === "exists" && (
        <Button
          onClick={() => navigate("/dashboard")}
          fullWidth
          rounded
        >
          {t(`${tKey}.goToDashboard`)}
        </Button>
      )}
    </div>
  );
}
