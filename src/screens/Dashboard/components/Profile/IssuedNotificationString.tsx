import Button from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";
import { Check, Copy, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const PREFIX = "screens.Dashboard.NotificationConnectionString.issued";

interface Props {
  connectionString: string;
  onDone: () => void;
}

/** The freshly issued notification string, shown once */
export default function IssuedNotificationString({
  connectionString,
  onDone,
}: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(connectionString);
    setCopied(true);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <div className="flex flex-col gap-1">
          <span className="font-medium">{t(`${PREFIX}.warningTitle`)}</span>
          <span>{t(`${PREFIX}.warning`)}</span>
        </div>
      </div>

      <TextInput value={connectionString} readOnly aria-label={t(`${PREFIX}.label`)} />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button intent="secondary" onClick={onDone}>
          {t(`${PREFIX}.done`)}
        </Button>
        <Button onClick={handleCopy}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? t(`${PREFIX}.copied`) : t(`${PREFIX}.copy`)}
        </Button>
      </div>
    </div>
  );
}
