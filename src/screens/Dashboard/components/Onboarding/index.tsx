import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { TextInput } from "flowbite-react";
import { useDispatch } from "react-redux";
import { setNotification } from "@/states/notification.state";
import useProfile from "@/hooks/use-profile";
import PageBody from "@/components/ui/PageBody";
import ControlPanelBreadcrumbItem from "../ControlPanelBreadcrumbItem";
import { MdChecklist } from "react-icons/md";

type Account = components["schemas"]["Account"];
type AccountStatus = "loading" | "exists" | "missing";

// ---------------------------------------------------------------------------
// Phone utilities
// ---------------------------------------------------------------------------

interface CountryCode {
  code: string;
  flag: string;
  name: string;
}

const COUNTRY_CODES: CountryCode[] = [
  // Americas
  { code: "55",  flag: "🇧🇷", name: "Brasil (+55)" },
  { code: "1",   flag: "🇺🇸", name: "USA / Canada (+1)" },
  { code: "54",  flag: "🇦🇷", name: "Argentina (+54)" },
  { code: "52",  flag: "🇲🇽", name: "México (+52)" },
  { code: "57",  flag: "🇨🇴", name: "Colombia (+57)" },
  { code: "56",  flag: "🇨🇱", name: "Chile (+56)" },
  { code: "51",  flag: "🇵🇪", name: "Perú (+51)" },
  { code: "58",  flag: "🇻🇪", name: "Venezuela (+58)" },
  { code: "593", flag: "🇪🇨", name: "Ecuador (+593)" },
  { code: "591", flag: "🇧🇴", name: "Bolivia (+591)" },
  { code: "595", flag: "🇵🇾", name: "Paraguay (+595)" },
  { code: "598", flag: "🇺🇾", name: "Uruguay (+598)" },
  { code: "502", flag: "🇬🇹", name: "Guatemala (+502)" },
  { code: "503", flag: "🇸🇻", name: "El Salvador (+503)" },
  { code: "504", flag: "🇭🇳", name: "Honduras (+504)" },
  { code: "505", flag: "🇳🇮", name: "Nicaragua (+505)" },
  { code: "506", flag: "🇨🇷", name: "Costa Rica (+506)" },
  { code: "507", flag: "🇵🇦", name: "Panamá (+507)" },
  { code: "53",  flag: "🇨🇺", name: "Cuba (+53)" },
  { code: "1809",flag: "🇩🇴", name: "Rep. Dominicana (+1809)" },
  // Europe
  { code: "351", flag: "🇵🇹", name: "Portugal (+351)" },
  { code: "34",  flag: "🇪🇸", name: "España (+34)" },
  { code: "44",  flag: "🇬🇧", name: "UK (+44)" },
  { code: "49",  flag: "🇩🇪", name: "Deutschland (+49)" },
  { code: "33",  flag: "🇫🇷", name: "France (+33)" },
  { code: "39",  flag: "🇮🇹", name: "Italia (+39)" },
  { code: "31",  flag: "🇳🇱", name: "Nederland (+31)" },
  { code: "32",  flag: "🇧🇪", name: "Belgique (+32)" },
  { code: "41",  flag: "🇨🇭", name: "Schweiz (+41)" },
  { code: "43",  flag: "🇦🇹", name: "Österreich (+43)" },
  { code: "46",  flag: "🇸🇪", name: "Sverige (+46)" },
  { code: "47",  flag: "🇳🇴", name: "Norge (+47)" },
  { code: "45",  flag: "🇩🇰", name: "Danmark (+45)" },
  { code: "358", flag: "🇫🇮", name: "Suomi (+358)" },
  { code: "48",  flag: "🇵🇱", name: "Polska (+48)" },
  { code: "7",   flag: "🇷🇺", name: "Россия (+7)" },
  { code: "380", flag: "🇺🇦", name: "Україна (+380)" },
  { code: "420", flag: "🇨🇿", name: "Česká republika (+420)" },
  { code: "40",  flag: "🇷🇴", name: "România (+40)" },
  { code: "36",  flag: "🇭🇺", name: "Magyarország (+36)" },
  { code: "30",  flag: "🇬🇷", name: "Ελλάδα (+30)" },
  { code: "353", flag: "🇮🇪", name: "Ireland (+353)" },
  // Middle East & Turkey
  { code: "90",  flag: "🇹🇷", name: "Türkiye (+90)" },
  { code: "971", flag: "🇦🇪", name: "UAE (+971)" },
  { code: "966", flag: "🇸🇦", name: "Saudi Arabia (+966)" },
  { code: "972", flag: "🇮🇱", name: "Israel (+972)" },
  { code: "974", flag: "🇶🇦", name: "Qatar (+974)" },
  { code: "965", flag: "🇰🇼", name: "Kuwait (+965)" },
  { code: "98",  flag: "🇮🇷", name: "Iran (+98)" },
  // Asia
  { code: "91",  flag: "🇮🇳", name: "India (+91)" },
  { code: "81",  flag: "🇯🇵", name: "Japan (+81)" },
  { code: "86",  flag: "🇨🇳", name: "China (+86)" },
  { code: "82",  flag: "🇰🇷", name: "South Korea (+82)" },
  { code: "62",  flag: "🇮🇩", name: "Indonesia (+62)" },
  { code: "66",  flag: "🇹🇭", name: "Thailand (+66)" },
  { code: "84",  flag: "🇻🇳", name: "Việt Nam (+84)" },
  { code: "63",  flag: "🇵🇭", name: "Philippines (+63)" },
  { code: "60",  flag: "🇲🇾", name: "Malaysia (+60)" },
  { code: "65",  flag: "🇸🇬", name: "Singapore (+65)" },
  { code: "92",  flag: "🇵🇰", name: "Pakistan (+92)" },
  { code: "880", flag: "🇧🇩", name: "Bangladesh (+880)" },
  { code: "94",  flag: "🇱🇰", name: "Sri Lanka (+94)" },
  { code: "95",  flag: "🇲🇲", name: "Myanmar (+95)" },
  // Africa
  { code: "27",  flag: "🇿🇦", name: "South Africa (+27)" },
  { code: "234", flag: "🇳🇬", name: "Nigeria (+234)" },
  { code: "20",  flag: "🇪🇬", name: "Egypt (+20)" },
  { code: "254", flag: "🇰🇪", name: "Kenya (+254)" },
  { code: "233", flag: "🇬🇭", name: "Ghana (+233)" },
  { code: "212", flag: "🇲🇦", name: "Maroc (+212)" },
  { code: "213", flag: "🇩🇿", name: "Algérie (+213)" },
  { code: "216", flag: "🇹🇳", name: "Tunisie (+216)" },
  { code: "255", flag: "🇹🇿", name: "Tanzania (+255)" },
  { code: "251", flag: "🇪🇹", name: "Ethiopia (+251)" },
  // Oceania
  { code: "61",  flag: "🇦🇺", name: "Australia (+61)" },
  { code: "64",  flag: "🇳🇿", name: "New Zealand (+64)" },
];

function formatLocal(digits: string, code: string): string {
  if (code === "55") {
    const d = digits.slice(0, 11);
    if (d.length === 0) return "";
    if (d.length <= 2) return "(" + d;
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10)
      return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }
  if (code === "1") {
    const d = digits.slice(0, 10);
    if (d.length === 0) return "";
    if (d.length <= 3) return "(" + d;
    if (d.length <= 6) return "(" + d.slice(0, 3) + ") " + d.slice(3);
    return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
  }
  const d = digits.slice(0, 12);
  if (d.length === 0) return "";
  if (d.length <= 4) return d;
  if (d.length <= 8) return d.slice(0, 4) + " " + d.slice(4);
  return d.slice(0, 4) + " " + d.slice(4, 8) + " " + d.slice(8);
}

function buildPhone(code: string, formattedLocal: string): string {
  if (!formattedLocal.trim()) return "";
  return "+" + code + " " + formattedLocal;
}

function parsePhone(value: string): { code: string; localDigits: string } {
  if (!value || !value.startsWith("+")) {
    return { code: "55", localDigits: value.replace(/\D/g, "") };
  }
  const allDigits = value.slice(1).replace(/\D/g, "");
  const sorted = [...COUNTRY_CODES].sort(
    (a, b) => b.code.length - a.code.length
  );
  for (const c of sorted) {
    if (allDigits.startsWith(c.code)) {
      return { code: c.code, localDigits: allDigits.slice(c.code.length) };
    }
  }
  return { code: "55", localDigits: allDigits };
}

type MetaKey = "phone_number" | "whatsapp_user" | "locale";
type MetaRecord = Record<MetaKey, string>;
type MetaBoolRecord = Record<MetaKey, boolean>;

const LOCALE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "es", label: "Español" },
];

const TEXT_INPUT_THEME = {
  field: {
    input: {
      colors: {
        custom:
          "border-zinc-400 bg-brand-violet-50 text-zinc-900 focus:border-brand-violet-500 focus:ring-brand-violet-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 dark:focus:border-brand-violet-400 dark:focus:ring-brand-violet-400",
      },
    },
  },
};

function makeMetaRecord(value: string): MetaRecord {
  return {
    phone_number: value,
    whatsapp_user: value,
    locale: value,
  };
}

function makeMetaBoolRecord(value: boolean): MetaBoolRecord {
  return {
    phone_number: value,
    whatsapp_user: value,
    locale: value,
  };
}

// Steps: account + phone + messaging (telegram|whatsapp) + locale = 4
const TOTAL_STEPS = 4;

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
  const [sameAsPhone, setSameAsPhone] = useState(false);
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
      phone_number: account.meta?.phone_number ?? prev.phone_number,
      whatsapp_user: account.meta?.whatsapp_user ?? prev.whatsapp_user,
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

  const saveSingleMeta = useCallback(
    async (
      key: MetaKey,
      value: string,
      meta: Record<string, string> | undefined
    ) => {
      const isExisting = meta != null && key in meta;
      if (isExisting) {
        await metaUpdate({ key, value }, getAccessTokenSilently);
      } else {
        await metaCreate({ key, value }, getAccessTokenSilently);
      }
      setAccount((prev) =>
        prev ? { ...prev, meta: { ...prev.meta, [key]: value } } : prev
      );
    },
    [getAccessTokenSilently]
  );

  const handleSaveMeta = useCallback(
    async (key: MetaKey) => {
      setMetaSaving((prev) => ({ ...prev, [key]: true }));
      try {
        const meta = account?.meta as Record<string, string> | undefined;
        const value = metaValues[key];

        await saveSingleMeta(key, value, meta);

        if (key === "phone_number" && sameAsPhone) {
          await saveSingleMeta("whatsapp_user", value, meta);
          setMetaValues((prev) => ({ ...prev, whatsapp_user: value }));
        }

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
    [account, metaValues, sameAsPhone, saveSingleMeta, dispatch, t, i18n, tKey]
  );

  const meta = account?.meta as Record<string, string> | undefined;
  const phoneSet = !!(meta?.phone_number);
  const messagingSet = !!(meta?.whatsapp_user);
  const localeSet = !!(meta?.locale);

  const completedSteps =
    (accountStatus === "exists" ? 1 : 0) +
    (localeSet ? 1 : 0) +
    (phoneSet ? 1 : 0) +
    (messagingSet ? 1 : 0);

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
                optional
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

              {/* Step 3 — Phone */}
              <TimelineItem
                done={phoneSet}
                disabled={accountStatus !== "exists"}
                label={t(`${tKey}.meta.phone.title`)}
                optional
              >
                <PhoneField
                  id="phone_number"
                  value={metaValues.phone_number}
                  savedValue={meta?.phone_number ?? ""}
                  saving={metaSaving.phone_number}
                  saved={metaSaved.phone_number}
                  disabled={accountStatus !== "exists"}
                  description={t(`${tKey}.meta.phone.description`)}
                  label={t(`${tKey}.meta.phone.title`)}
                  onChange={(val) =>
                    setMetaValues((prev) => ({
                      ...prev,
                      phone_number: val,
                      ...(sameAsPhone ? { whatsapp_user: val } : {}),
                    }))
                  }
                  onSave={() => handleSaveMeta("phone_number")}
                  tKey={tKey}
                />
              </TimelineItem>

              {/* Step 4 — Messaging (Telegram + WhatsApp) */}
              <TimelineItem
                done={messagingSet}
                disabled={accountStatus !== "exists"}
                label={t(`${tKey}.meta.messaging.title`)}
                optional
              >
                <div className="flex flex-col gap-4">
                  <Typography as="small" decoration="smooth">
                    {t(`${tKey}.meta.messaging.description`)}
                  </Typography>

                  <div className="flex flex-col gap-1">
                    <Typography as="small" decoration="faded">
                      {t(`${tKey}.meta.telegram.title`)}
                    </Typography>
                    <Typography as="small" decoration="smooth">
                      {t(`${tKey}.meta.telegram.linkHint`)}
                    </Typography>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={sameAsPhone}
                        disabled={
                          accountStatus !== "exists" ||
                          metaValues.phone_number.trim() === ""
                        }
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSameAsPhone(checked);
                          if (checked) {
                            setMetaValues((prev) => ({
                              ...prev,
                              whatsapp_user: prev.phone_number,
                            }));
                          }
                        }}
                        className="w-4 h-4 accent-brand-violet-500 disabled:opacity-40"
                      />
                      <Typography as="small" decoration="smooth">
                        {t(`${tKey}.meta.whatsapp.sameAsPhone`)}
                      </Typography>
                    </label>

                    <PhoneField
                      id="whatsapp_user"
                      value={
                        sameAsPhone
                          ? metaValues.phone_number
                          : metaValues.whatsapp_user
                      }
                      savedValue={meta?.whatsapp_user ?? ""}
                      saving={metaSaving.whatsapp_user}
                      saved={
                        metaSaved.whatsapp_user ||
                        (sameAsPhone && metaSaved.phone_number)
                      }
                      disabled={accountStatus !== "exists" || sameAsPhone}
                      hideSave={sameAsPhone}
                      label={t(`${tKey}.meta.whatsapp.title`)}
                      onChange={(val) =>
                        setMetaValues((prev) => ({
                          ...prev,
                          whatsapp_user: val,
                        }))
                      }
                      onSave={() => handleSaveMeta("whatsapp_user")}
                      tKey={tKey}
                    />

                    {sameAsPhone &&
                      metaValues.phone_number.trim() !== "" &&
                      metaValues.phone_number !== (meta?.whatsapp_user ?? "") && (
                        <Button
                          onClick={() => handleSaveMeta("whatsapp_user")}
                          disabled={metaSaving.whatsapp_user}
                          intent="secondary"
                         
                          size="sm"
                        >
                          {metaSaved.whatsapp_user
                            ? t(`${tKey}.saved`)
                            : metaSaving.whatsapp_user
                              ? t(`${tKey}.saving`)
                              : t(`${tKey}.save`)}
                        </Button>
                      )}
                  </div>
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
// PhoneField — country code selector + masked phone input
// ---------------------------------------------------------------------------

interface PhoneFieldProps {
  id: string;
  value: string;
  savedValue: string;
  saving: boolean;
  saved: boolean;
  disabled: boolean;
  hideSave?: boolean;
  label: string;
  description?: string;
  onChange: (val: string) => void;
  onSave: () => void;
  tKey: string;
}

function PhoneField({
  id,
  value,
  savedValue,
  saving,
  saved,
  disabled,
  hideSave,
  label,
  description,
  onChange,
  onSave,
  tKey,
}: PhoneFieldProps) {
  const { t } = useTranslation();

  const initial = useMemo(() => parsePhone(value), []);  // eslint-disable-line react-hooks/exhaustive-deps
  const [countryCode, setCountryCode] = useState(initial.code);
  const [localDigits, setLocalDigits] = useState(initial.localDigits);
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (value !== lastEmitted.current) {
      const parsed = parsePhone(value);
      setCountryCode(parsed.code);
      setLocalDigits(parsed.localDigits);
      lastEmitted.current = value;
    }
  }, [value]);

  const displayLocal = formatLocal(localDigits, countryCode);
  const fullValue = buildPhone(countryCode, displayLocal);
  const isDirty = fullValue.trim() !== "" && fullValue !== savedValue;

  const emit = (code: string, digits: string) => {
    const full = buildPhone(code, formatLocal(digits, code));
    lastEmitted.current = full;
    onChange(full);
  };

  const handleLocalChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    setLocalDigits(digits);
    emit(countryCode, digits);
  };

  const handleCodeChange = (code: string) => {
    setCountryCode(code);
    emit(code, localDigits);
  };

  const placeholder =
    countryCode === "55"
      ? "(XX) XXXXX-XXXX"
      : countryCode === "1"
        ? "(XXX) XXX-XXXX"
        : "XXXX XXXX XXXX";

  return (
    <div className="flex flex-col gap-2">
      {description && (
        <Typography as="small" decoration="smooth">
          {description}
        </Typography>
      )}
      <FormField label={label} id={id}>
        <div className="flex gap-2">
          <select
            value={countryCode}
            disabled={disabled}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="rounded-lg border border-zinc-400 bg-brand-violet-50 px-2 py-2 text-sm text-zinc-900 focus:border-brand-violet-500 focus:ring-1 focus:ring-brand-violet-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white dark:focus:border-brand-violet-400 dark:focus:ring-brand-violet-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
          <div className="flex-1">
            <TextInput
              id={id}
              type="tel"
              placeholder={placeholder}
              value={displayLocal}
              disabled={disabled}
              color="custom"
              theme={TEXT_INPUT_THEME}
              onChange={(e) => handleLocalChange(e.target.value)}
            />
          </div>
        </div>
      </FormField>
      {!hideSave && isDirty && (
        <Button
          onClick={onSave}
          disabled={disabled || saving}
          intent="secondary"
         
          size="sm"
        >
          {saved
            ? t(`${tKey}.saved`)
            : saving
              ? t(`${tKey}.saving`)
              : t(`${tKey}.save`)}
        </Button>
      )}
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
      <div className="w-16 h-16 rounded-full bg-brand-violet-100 dark:bg-zinc-800 flex items-center justify-center">
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
      className="block w-full-lg border border-zinc-400 bg-brand-violet-50 px-3 py-2 text-zinc-900 focus:border-brand-violet-500 focus:ring-1 focus:ring-brand-violet-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white dark:focus:border-brand-violet-400 dark:focus:ring-brand-violet-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
        : "bg-white dark:bg-zinc-900 border-brand-violet-400 dark:border-brand-violet-500";

  return (
    <div className="relative pl-8 pb-8">
      {/* Dot */}
      <div
        className={`absolute -left-[9px] top-1 w-4 h-4 border-2 ${dotColor} flex items-center justify-center`}
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
