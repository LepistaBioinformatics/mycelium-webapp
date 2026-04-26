import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import useProfile from "@/hooks/use-profile";
import { MYCELIUM_API_URL } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { setTelegramConfig } from "@/services/telegram";
import { setNotification } from "@/states/notification.state";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

type Tenant = components["schemas"]["Tenant"];

interface Props {
  tenant: Tenant;
}

interface FormValues {
  botToken: string;
  webhookSecret: string;
}

const BASE = "screens.Dashboard.TelegramConfig";

const INPUT =
  "w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 px-0 py-1.5 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-violet-500 dark:focus:border-brand-violet-400 placeholder-zinc-400 dark:placeholder-zinc-600";
const LABEL =
  "text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide";

export default function TelegramConfigCard({ tenant }: Props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const webhookUrl = `${MYCELIUM_API_URL}/auth/telegram/webhook/${tenant.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const { hasEnoughPermissions, getAccessTokenSilently } = useProfile({
    tenantOwnerNeeded: [tenant.id ?? ""],
    roles: [MycRole.TenantManager],
    permissions: [MycPermission.Write],
    restrictSystemAccount: true,
  });

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { botToken: "", webhookSecret: "" },
  });

  if (!hasEnoughPermissions) return null;

  const onSubmit = async (values: FormValues) => {
    if (!tenant.id) return;

    setIsSaving(true);

    try {
      await setTelegramConfig(
        { botToken: values.botToken, webhookSecret: values.webhookSecret },
        tenant.id,
        getAccessTokenSilently,
      );

      dispatch(
        setNotification({ type: "success", notification: t(`${BASE}.saved`) }),
      );

      reset({ botToken: "", webhookSecret: "" });
    } catch {
      dispatch(
        setNotification({ type: "error", notification: t(`${BASE}.error`) }),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card padding="sm" height="adaptive" group>
      <Card.Header>
        <div className="flex flex-col gap-2">
          <Typography as="h5">{t(`${BASE}.title`)}</Typography>
          <Typography as="span" decoration="smooth" width="sm">
            {t(`${BASE}.description`)}
          </Typography>
        </div>
      </Card.Header>

      <Card.Body>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <label className={LABEL}>{t(`${BASE}.webhookUrl.label`)}</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className={`${INPUT} flex-1 cursor-text select-all`}
              />
              <Button type="button" size="xs" onClick={handleCopy}>
                {copied
                  ? t(`${BASE}.webhookUrl.copied`)
                  : t(`${BASE}.webhookUrl.copy`)}
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
          <div className="flex flex-col gap-1">
            <label className={LABEL}>{t(`${BASE}.botToken.label`)}</label>
            <input
              type="password"
              autoComplete="off"
              className={INPUT}
              placeholder={t(`${BASE}.botToken.placeholder`)}
              {...register("botToken", { required: true })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className={LABEL}>{t(`${BASE}.webhookSecret.label`)}</label>
            <input
              type="password"
              autoComplete="off"
              className={INPUT}
              placeholder={t(`${BASE}.webhookSecret.placeholder`)}
              {...register("webhookSecret", { required: true, minLength: 8 })}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? t(`${BASE}.saving`) : t(`${BASE}.save`)}
            </Button>
          </div>
        </form>
      </Card.Body>
    </Card>
  );
}
