import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import {
  accountsGet,
  accountsUpdateName,
  metaCreate,
  metaUpdate,
} from "@/services/rpc/beginners";
import { setNotification } from "@/states/notification.state";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import useSWR from "swr";

type Account = components["schemas"]["Account"];

interface ContactInfoFormValues {
  fullName: string;
  phoneNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  jobTitle: string;
}

const META_FIELD_KEYS: Record<
  Exclude<keyof ContactInfoFormValues, "fullName">,
  string
> = {
  phoneNumber: "phone_number",
  emergencyContactName: "emergency_contact_name",
  emergencyContactPhone: "emergency_contact_phone",
  jobTitle: "job_title",
};

const BASE = "screens.Dashboard.Profile.ContactInfoSection";

const INPUT =
  "w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 px-0 py-1.5 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-violet-500 dark:focus:border-brand-violet-400 placeholder-zinc-400 dark:placeholder-zinc-600";
const LABEL =
  "text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide";

export default function ContactInfoSection() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { getAccessTokenSilently } = useProfile();
  const [isSaving, setIsSaving] = useState(false);

  const { data: account, mutate } = useSWR<Account | null>(
    "rpc:beginners.accounts.get",
    () => accountsGet(getAccessTokenSilently),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const meta = (account?.meta ?? {}) as Record<string, string>;

  const { register, handleSubmit, reset } = useForm<ContactInfoFormValues>({
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      jobTitle: "",
    },
  });

  // `account` arrives asynchronously from SWR after mount, so the RHF
  // lazy-initializer can't seed these defaults — reset() once data lands.
  useEffect(() => {
    if (!account) return;
    reset({
      fullName: account.name ?? "",
      phoneNumber: meta[META_FIELD_KEYS.phoneNumber] ?? "",
      emergencyContactName: meta[META_FIELD_KEYS.emergencyContactName] ?? "",
      emergencyContactPhone: meta[META_FIELD_KEYS.emergencyContactPhone] ?? "",
      jobTitle: meta[META_FIELD_KEYS.jobTitle] ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const onSubmit = async (values: ContactInfoFormValues) => {
    if (!account?.id) return;

    setIsSaving(true);

    const metaResults = await Promise.allSettled(
      (Object.keys(META_FIELD_KEYS) as (keyof typeof META_FIELD_KEYS)[])
        .filter((field) => values[field] !== "")
        .map((field) => {
          const key = META_FIELD_KEYS[field];
          const value = values[field];

          return key in meta
            ? metaUpdate({ key, value }, getAccessTokenSilently)
            : metaCreate({ key, value }, getAccessTokenSilently);
        })
    );

    const nameResult =
      values.fullName !== "" && values.fullName !== account.name
        ? await Promise.allSettled([
            accountsUpdateName(
              { accountId: account.id, name: values.fullName },
              getAccessTokenSilently
            ),
          ])
        : [];

    setIsSaving(false);

    const failed = [...metaResults, ...nameResult].filter(
      (r) => r.status === "rejected"
    );

    if (failed.length > 0) {
      dispatch(
        setNotification({
          type: "error",
          notification: t(`${BASE}.error`),
        })
      );
      return;
    }

    reset(values);
    mutate();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card padding="sm" height="adaptive" group scroll={false}>
        <Card.Header>
          <div className="flex flex-col gap-2">
            <Typography as="h5">{t(`${BASE}.title`)}</Typography>
            <Typography as="span" decoration="smooth" width="sm">
              {t(`${BASE}.description`)}
            </Typography>
          </div>
        </Card.Header>

        <Card.Body>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className={LABEL}>{t(`${BASE}.fullName.title`)}</label>
              <input
                {...register("fullName")}
                className={INPUT}
                placeholder={t(`${BASE}.fullName.placeholder`)}
                type="text"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={LABEL}>{t(`${BASE}.phoneNumber.title`)}</label>
              <input
                {...register("phoneNumber")}
                className={INPUT}
                placeholder="+1 555 000 0000"
                type="tel"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={LABEL}>{t(`${BASE}.jobTitle.title`)}</label>
              <input
                {...register("jobTitle")}
                className={INPUT}
                placeholder={t(`${BASE}.jobTitle.placeholder`)}
                type="text"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={LABEL}>
                {t(`${BASE}.emergencyContactName.title`)}
              </label>
              <Typography as="small" decoration="smooth">
                {t(`${BASE}.emergencyContactName.description`)}
              </Typography>
              <input
                {...register("emergencyContactName")}
                className={INPUT}
                placeholder={t(`${BASE}.emergencyContactName.placeholder`)}
                type="text"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={LABEL}>
                {t(`${BASE}.emergencyContactPhone.title`)}
              </label>
              <input
                {...register("emergencyContactPhone")}
                className={INPUT}
                placeholder="+1 555 000 0000"
                type="tel"
              />
            </div>
          </div>
        </Card.Body>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving || !account?.id}>
          {isSaving ? t(`${BASE}.saving`) : t(`${BASE}.save`)}
        </Button>
      </div>
    </form>
  );
}
