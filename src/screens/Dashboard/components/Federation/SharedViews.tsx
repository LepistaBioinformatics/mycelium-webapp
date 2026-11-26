import Typography from "@/components/ui/Typography";
import { useTranslation } from "react-i18next";
import { PREFIX } from "./shared";

export function LoadError() {
  const { t } = useTranslation();

  return (
    <Typography decoration="smooth" as="p">
      <span className="text-red-600 dark:text-red-400">
        {t(`${PREFIX}.loadError`)}
      </span>
    </Typography>
  );
}

export function Empty() {
  const { t } = useTranslation();

  return <Typography decoration="smooth">{t(`${PREFIX}.empty`)}</Typography>;
}

const TONES = {
  good: "border-status-production text-status-production bg-status-production/10",
  info: "border-status-stable text-status-stable bg-status-stable/10",
  warn: "border-status-research text-status-research bg-status-research/10",
  bad: "border-red-300 text-red-600 bg-red-50 dark:border-red-700 dark:text-red-400 dark:bg-red-900/20",
  muted:
    "border-zinc-300 text-zinc-600 bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:bg-surface-900",
};

const STATUS_TONES: Record<string, keyof typeof TONES> = {
  active: "good",
  declared: "muted",
  handshaking: "info",
  pending: "info",
  degraded: "warn",
  unreachable: "warn",
  quarantined: "bad",
  untrusted: "bad",
  revoked: "muted",
  enabled: "good",
  disabled: "muted",
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-block rounded-lg border px-1.5 py-0.5 font-mono text-xs uppercase ${
        TONES[STATUS_TONES[status] ?? "muted"]
      }`}
    >
      {t(`${PREFIX}.statuses.${status}`)}
    </span>
  );
}
