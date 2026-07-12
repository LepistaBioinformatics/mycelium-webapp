import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import { metaCreate } from "@/services/rpc/tenantOwner";
import { setNotification } from "@/states/notification.state";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

type Tenant = components["schemas"]["Tenant"];
type TenantMetaKey = components["schemas"]["TenantMetaKey"];

interface Props {
  tenant: Tenant;
  mutateTenantStatus: () => void;
}

interface NotificationsFormValues {
  website_url: string;
  support_email: string;
  locale: string;
}

const FIELD_KEYS: TenantMetaKey[] = ["website_url", "support_email", "locale"];

// Matches the gateway's notification template folders
// (templates/{en-us,pt-br,es}) — dispatch_notification uses this value as a
// literal path prefix, falling back to en-us if the folder doesn't exist.
const NOTIFICATION_LOCALE_OPTIONS = [
  { value: "en-us", label: "English" },
  { value: "pt-br", label: "Português (Brasil)" },
  { value: "es", label: "Español" },
];

const INPUT =
  "w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 px-0 py-1.5 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-violet-500 dark:focus:border-brand-violet-400 placeholder-zinc-400 dark:placeholder-zinc-600";
const LABEL =
  "text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide";

export default function NotificationsCard({
  tenant,
  mutateTenantStatus,
}: Props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);

  const { hasEnoughPermissions, getAccessTokenSilently } = useProfile({
    tenantOwnerNeeded: [tenant.id ?? ""],
    roles: [MycRole.TenantManager],
    permissions: [MycPermission.Read],
    restrictSystemAccount: true,
  });

  const meta = (tenant.meta ?? {}) as Record<string, string>;

  const { register, handleSubmit, reset } = useForm<NotificationsFormValues>({
    defaultValues: {
      website_url: meta["website_url"] ?? "",
      support_email: meta["support_email"] ?? "",
      locale: meta["locale"] ?? "",
    },
  });

  if (!hasEnoughPermissions) return null;

  const BASE =
    "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings";

  const onSubmit = async (values: NotificationsFormValues) => {
    if (!tenant.id) return;

    setIsSaving(true);

    const results = await Promise.allSettled(
      FIELD_KEYS.filter(
        (key) => values[key as keyof NotificationsFormValues] !== ""
      ).map((key) =>
        metaCreate(
          {
            tenantId: tenant.id!,
            key,
            value: values[key as keyof NotificationsFormValues],
          },
          getAccessTokenSilently
        )
      )
    );

    setIsSaving(false);

    const failed = results.filter((r) => r.status === "rejected");

    if (failed.length > 0) {
      dispatch(
        setNotification({
          type: "error",
          notification: `${failed.length} field(s) failed to save.`,
        })
      );
      return;
    }

    reset(values);
    mutateTenantStatus();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card padding="sm" height="adaptive" group scroll={false}>
        <Card.Header>
          <div className="flex flex-col gap-2">
            <Typography as="h5">{t(`${BASE}.notifications.title`)}</Typography>
            <Typography as="span" decoration="smooth" width="sm">
              {t(`${BASE}.notifications.description`)}
            </Typography>
          </div>
        </Card.Header>

        <Card.Body>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className={LABEL}>{t(`${BASE}.websiteUrl.title`)}</label>
              <Typography as="small" decoration="smooth">
                {t(`${BASE}.websiteUrl.description`)}
              </Typography>
              <input
                {...register("website_url")}
                className={INPUT}
                placeholder="https://"
                type="url"
              />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className={LABEL}>{t(`${BASE}.supportEmail.title`)}</label>
              <Typography as="small" decoration="smooth">
                {t(`${BASE}.supportEmail.description`)}
              </Typography>
              <input
                {...register("support_email")}
                className={INPUT}
                placeholder="support@example.com"
                type="email"
              />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className={LABEL}>{t(`${BASE}.locale.title`)}</label>
              <Typography as="small" decoration="smooth">
                {t(`${BASE}.locale.description`)}
              </Typography>
              <select
                {...register("locale")}
                className={`${INPUT} cursor-pointer bg-white dark:bg-brand-950`}
              >
                <option value="" className="bg-white dark:bg-brand-950">
                  {t(`${BASE}.locale.placeholder`)}
                </option>
                {NOTIFICATION_LOCALE_OPTIONS.map(({ value, label }) => (
                  <option
                    key={value}
                    value={value}
                    className="bg-white dark:bg-brand-950"
                  >
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card.Body>
      </Card>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-white bg-brand-violet-500 hover:bg-brand-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? t(`${BASE}.saving`) : t(`${BASE}.save`)}
        </button>
      </div>
    </form>
  );
}
