import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FomField";
import { Select, TextInput } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import Typography from "@/components/ui/Typography";
import { describeError } from "@/functions/describe-error";
import {
  daysToSeconds,
  notificationExpirationDays,
  notificationIssuanceErrorKey,
} from "@/functions/notification-issuance";
import useProfile from "@/hooks/use-profile";
import useSuspenseError from "@/hooks/use-suspense-error";
import useTenantName from "@/hooks/use-tenant-name";
import { components } from "@/services/openapi/mycelium-schema";
import { tokensCreateNotification } from "@/services/rpc/beginners";
import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import IssuedNotificationString from "./IssuedNotificationString";

type NotificationIssuanceOptions =
  components["schemas"]["NotificationIssuanceOptions"];
type IssuableNotificationService =
  components["schemas"]["IssuableNotificationService"];

const PREFIX = "screens.Dashboard.NotificationConnectionString";
const NO_TENANT = "";
const DEFAULT_DAYS = 30;

interface Props {
  options: NotificationIssuanceOptions;
  onClose: () => void;
  onCreated: () => void;
}

function defaultTenant(service?: IssuableNotificationService): string {
  if (!service || service.allowsNoTenant) return NO_TENANT;
  return service.tenantIds[0] ?? NO_TENANT;
}

/** Issue a connection string a downstream service uses to send emails */
export default function CreateNotificationConnectionStringModal({
  options,
  onClose,
  onCreated,
}: Props) {
  const { t } = useTranslation();
  const { getAccessTokenSilently } = useProfile();
  const { dispatchError } = useSuspenseError();

  const expirationDays = notificationExpirationDays(
    options.maxConnectionStringTtlInDays
  );

  const [name, setName] = useState("");
  const [senderTag, setSenderTag] = useState(
    () => options.services[0]?.senderTag ?? ""
  );
  const [tenantId, setTenantId] = useState(() =>
    defaultTenant(options.services[0])
  );
  const [days, setDays] = useState(
    () =>
      expirationDays.filter((value) => value <= DEFAULT_DAYS).at(-1) ??
      expirationDays[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionString, setConnectionString] = useState<string | null>(
    null
  );

  const service = options.services.find(
    (candidate) => candidate.senderTag === senderTag
  );

  const handleServiceChange = (value: string) => {
    setSenderTag(value);
    setTenantId(
      defaultTenant(options.services.find((s) => s.senderTag === value))
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!days) return;

    setIsSubmitting(true);

    try {
      const result = await tokensCreateNotification(
        {
          name: name.trim(),
          expiration: daysToSeconds(days),
          senderTag,
          tenantId: tenantId || null,
        },
        getAccessTokenSilently
      );
      setConnectionString(result.connectionString);
      onCreated();
    } catch (err) {
      const key = notificationIssuanceErrorKey(err);
      dispatchError(key ? t(`${PREFIX}.errors.${key}`) : describeError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    !!name.trim() &&
    !!service &&
    !!days &&
    (tenantId !== NO_TENANT || service.allowsNoTenant);

  return (
    <Modal open>
      <Modal.Header handleClose={onClose}>
        <Typography>{t(`${PREFIX}.title`)}</Typography>
      </Modal.Header>

      <Modal.Body>
        {connectionString ? (
          <IssuedNotificationString
            connectionString={connectionString}
            onDone={onClose}
          />
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
            <Typography as="p" decoration="smooth">
              {t(`${PREFIX}.description`)}
            </Typography>

            <FormField label={t(`${PREFIX}.form.name`)} id="notification-name">
              <TextInput
                id="notification-name"
                autoFocus
                required
                value={name}
                placeholder="service-01-mailer"
                onChange={(event) => setName(event.target.value)}
              />
            </FormField>

            <FormField
              label={t(`${PREFIX}.form.service`)}
              id="notification-service"
            >
              <Select
                id="notification-service"
                value={senderTag}
                onChange={(event) => handleServiceChange(event.target.value)}
              >
                {options.services.map((candidate) => (
                  <option key={candidate.senderTag} value={candidate.senderTag}>
                    {candidate.displayName} ({candidate.senderTag})
                  </option>
                ))}
              </Select>
            </FormField>

            {service && (
              <FormField
                label={t(`${PREFIX}.form.tenant`)}
                id="notification-tenant"
              >
                <Select
                  id="notification-tenant"
                  value={tenantId}
                  onChange={(event) => setTenantId(event.target.value)}
                >
                  {service.allowsNoTenant && (
                    <option value={NO_TENANT}>{t(`${PREFIX}.form.noTenant`)}</option>
                  )}
                  {service.tenantIds.map((id) => (
                    <TenantOption key={id} tenantId={id} />
                  ))}
                </Select>
                {!service.allowsNoTenant && (
                  <Typography as="small" decoration="smooth">
                    {t(`${PREFIX}.form.tenantRequired`)}
                  </Typography>
                )}
              </FormField>
            )}

            <FormField
              label={t(`${PREFIX}.form.expiration`)}
              id="notification-expiration"
            >
              <Select
                id="notification-expiration"
                value={days}
                onChange={(event) => setDays(Number(event.target.value))}
              >
                {expirationDays.map((value) => (
                  <option key={value} value={value}>
                    {t(`${PREFIX}.form.days`, { count: value })}
                  </option>
                ))}
              </Select>
              <Typography as="small" decoration="smooth">
                {t(`${PREFIX}.form.expirationCap`, {
                  count: options.maxConnectionStringTtlInDays,
                })}
              </Typography>
            </FormField>

            <Button type="submit" fullWidth disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? <Spinner /> : t(`${PREFIX}.form.create`)}
            </Button>
          </form>
        )}
      </Modal.Body>
    </Modal>
  );
}

function TenantOption({ tenantId }: { tenantId: string }) {
  const name = useTenantName(tenantId);

  return <option value={tenantId}>{name ?? tenantId}</option>;
}
