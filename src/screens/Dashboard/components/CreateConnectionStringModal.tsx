import { describeError } from "@/functions/describe-error";
import Button from "@/components/ui/Button";
import DetailsBox from "@/components/ui/DetailsBox";
import Divider from "@/components/ui/Divider";
import FormField from "@/components/ui/FomField";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import useSuspenseError from "@/hooks/use-suspense-error";
import { tenantsGetPublicInfo, tokensCreate } from "@/services/rpc/beginners";
import { MycPermission } from "@/types/MyceliumPermission";
import { Select, TextInput } from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import { ReactNode, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaCheck, FaCopy, FaTimes } from "react-icons/fa";
import useSWR from "swr";
import ConnectionStringScope, {
  PermissionedRole,
} from "./ConnectionStringScope";

// Mirrors the gateway's `ConnectionStringBean::to_string()` format
// (core/src/domain/dtos/token/connection_string/connection_string_beans.rs):
// standard-base64 of `key=value;key=value;...`. Keys we surface to the user;
// `sig`/`kvr` are internal HMAC integrity metadata, not scope, so they're
// omitted from the decoded view.
const SCOPE_LABEL_KEYS: Record<string, string> = {
  tid: "tenant",
  aid: "account",
  sid: "serviceAccount",
  rls: "roles",
  edt: "expiresAt",
};

function decodeConnectionString(
  value: string
): { key: string; label: string; value: string }[] | null {
  try {
    const decoded = atob(value);
    return decoded
      .split(";")
      .map((piece) => piece.trim())
      .filter((piece) => piece.length > 0)
      .map((piece) => {
        const eq = piece.indexOf("=");
        return {
          key: eq === -1 ? piece : piece.slice(0, eq),
          value: eq === -1 ? "" : piece.slice(eq + 1),
        };
      })
      .flatMap(({ key, value }) => {
        const label = SCOPE_LABEL_KEYS[key];
        return label ? [{ key, label, value }] : [];
      });
  } catch {
    return null;
  }
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenantId?: string | null;
  accountId?: string | null;
  /** How to show the account (e.g. `<AccountName />`); its id is shown too */
  accountName?: ReactNode;
  roles?: PermissionedRole[] | null;
}

type Inputs = {
  name: string;
  expiration: number;
};




enum Expiration {
  oneHour = 60 * 60,
  oneDay = 24 * 60 * 60,
  oneWeek = 7 * 24 * 60 * 60,
  oneMonth = 30 * 24 * 60 * 60,
  sixMonths = 180 * 24 * 60 * 60,
  oneYear = 365 * 24 * 60 * 60,
}

export default function CreateConnectionStringModal({
  isOpen,
  onClose,
  tenantId,
  accountId,
  accountName,
  roles,
}: Props) {
  const { t } = useTranslation();

  const tenantName = useTenantName(tenantId);

  const [copied, setCopied] = useState(false);

  const { dispatchWarning } = useSuspenseError();

  const { getAccessTokenSilently } = useProfile();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [connectionString, setConnectionString] = useState<string | null>(null);

  const [removedRoles, setRemovedRoles] = useState<PermissionedRole[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      name: "",
      expiration: Number(Expiration.sixMonths),
    },
  });

  const nameWatcher = watch("name");
  const expirationWatcher = watch("expiration");

  const handleReset = () => {
    setConnectionString(null);
    setRemovedRoles([]);
    reset();
  };

  const handleClicked = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  const handleClose = () => {
    setConnectionString(null);
    reset();
    onClose();
  };

  const onSubmit: SubmitHandler<Inputs> = async ({ name, expiration }) => {
    setIsSubmitting(true);

    if (!expiration) {
      dispatchWarning("Expiration is required");
      setIsSubmitting(false);
      return;
    }

    if (!name) {
      dispatchWarning("Name is required");
      setIsSubmitting(false);
      return;
    }

    try {
      const consolidatedRoles = roles
        ?.filter(
          (role) =>
            !removedRoles.some(
              (r) => r.role === role.role && r.permission === role.permission
            )
        )
        ?.map((role) => ({
          name: role.role,
          permission: role.permission === MycPermission.Read ? 0 : 1,
        }));

      const data = await tokensCreate(
        {
          expiration: Number(Expiration[expiration]),
          name,
          tenantId: tenantId ?? null,
          serviceAccountId: accountId ?? null,
          roles: consolidatedRoles ?? null,
        },
        getAccessTokenSilently
      );

      setConnectionString(data.connectionString);
    } catch (error) {
      dispatchWarning(describeError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveRole = (permissionedRole: PermissionedRole) => {
    if (
      removedRoles.some(
        (r) =>
          r.role === permissionedRole.role &&
          r.permission === permissionedRole.permission
      )
    ) {
      setRemovedRoles((prev) =>
        prev.filter(
          (r) =>
            r.role !== permissionedRole.role ||
            r.permission !== permissionedRole.permission
        )
      );
      return;
    }

    setRemovedRoles((prev) => [...prev, permissionedRole]);
  };

  const isRoleIncluded = (role: PermissionedRole) =>
    !removedRoles.some(
      (r) => r.role === role.role && r.permission === role.permission
    );

  const hasNoRoleLeft =
    !!roles && roles.length > 0 && !roles.some(isRoleIncluded);

  const ExpirationOptions: (keyof typeof Expiration)[] = [
    "oneHour",
    "oneDay",
    "oneWeek",
    "oneMonth",
    "sixMonths",
    "oneYear",
  ];

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={handleClose}>
        <Typography>
          {t("screens.Dashboard.AdvancedOptionsModal.title")}
        </Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-4 w-full">
          <Typography as="p" decoration="smooth">
            {t("screens.Dashboard.AdvancedOptionsModal.explain")}
          </Typography>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 w-full"
          >
            <div>
              <FormField
                label={t(
                  "screens.Dashboard.AdvancedOptionsModal.form.name.label"
                )}
                title={t(
                  "screens.Dashboard.AdvancedOptionsModal.form.name.title"
                )}
                width="full"
              >
                <TextInput
                  id="name"
                  autoFocus
                  type="text"
                  required
                 
                  disabled={isSubmitting || connectionString !== null || copied}
                  placeholder={t(
                    "screens.Dashboard.AdvancedOptionsModal.form.name.placeholder"
                  )}
                  {...register("name", { required: true })}
                />

                {errors.expiration && <span>This field is required</span>}
              </FormField>
            </div>

            <div>
              <FormField
                label={t(
                  "screens.Dashboard.AdvancedOptionsModal.form.expiration.label"
                )}
                title={t(
                  "screens.Dashboard.AdvancedOptionsModal.form.expiration.title"
                )}
                width="full"
              >
                <Select
                  id="expiration"
                 
                  disabled={isSubmitting || connectionString !== null || copied}
                  {...register("expiration")}
                >
                  {ExpirationOptions.map((expiration) => {
                    return (
                      <option key={expiration} value={expiration}>
                        {t(
                          `screens.Dashboard.AdvancedOptionsModal.form.expiration.options.${expiration}`
                        )}
                      </option>
                    );
                  })}
                </Select>

                {errors.expiration && <span>This field is required</span>}
              </FormField>
            </div>

            <ConnectionStringScope
              tenantId={tenantId}
              tenantName={tenantName}
              accountId={accountId}
              accountName={accountName}
              roles={roles}
              isRoleIncluded={isRoleIncluded}
              onToggleRole={handleRemoveRole}
              locked={isSubmitting || connectionString !== null}
            />

            <Button
              type="submit"
             
              fullWidth
              disabled={
                isSubmitting ||
                connectionString !== null ||
                nameWatcher === "" ||
                expirationWatcher === null ||
                errors.expiration !== undefined ||
                errors.name !== undefined ||
                copied ||
                hasNoRoleLeft
              }
            >
              {isSubmitting ? (
                <Spinner />
              ) : (
                t(
                  "screens.Dashboard.AdvancedOptionsModal.form.create.label"
                )
              )}
            </Button>
          </form>

          {connectionString && (
            <div className="flex flex-col gap-5">
              <Divider thickness="sm" />

              <TextInput
                value={connectionString}
               
                disabled
              />

              <DecodedConnectionString
                value={connectionString}
                names={{
                  ...(tenantId ? { [tenantId]: tenantName } : {}),
                  ...(accountId ? { [accountId]: accountName } : {}),
                }}
              />

              <div className="flex flex-col-reverse sm:flex-row gap-5 justify-rev sm:justify-between">
                <Button
                  intent="warning"
                 
                  fullWidth
                  disabled={connectionString === null}
                  onClick={() => handleReset()}
                >
                  {t(
                    "screens.Dashboard.AdvancedOptionsModal.form.reset"
                  )}
                  <FaTimes className="inline-block ml-2" />
                </Button>

                <Button
                 
                  fullWidth
                  disabled={copied}
                  onClick={() => {
                    navigator.clipboard.writeText(connectionString);
                    handleClicked();
                  }}
                >
                  {copied ? (
                    <>
                      {t(
                        "screens.Dashboard.AdvancedOptionsModal.form.copied"
                      )}
                      <FaCheck className="inline-block ml-2" />
                    </>
                  ) : (
                    <>
                      {t(
                        "screens.Dashboard.AdvancedOptionsModal.form.copy.label"
                      )}
                      <FaCopy className="inline-block ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

        </div>
      </Modal.Body>
    </Modal>
  );
}

/**
 * The namespace name, when the connection string is restricted to one.
 * Shares the cache key of `useTenantDetails`.
 */
function useTenantName(tenantId?: string | null): string | undefined {
  const { getAccessTokenSilently } = useProfile();

  const { data } = useSWR(
    tenantId ? ["rpc", "beginners.tenants.getPublicInfo", tenantId] : null,
    ([, , id]: [string, string, string]) =>
      tenantsGetPublicInfo({ tenantId: id }, getAccessTokenSilently).then(
        (tenant) => ({ active: tenant })
      ),
    { revalidateOnFocus: false, revalidateIfStale: false }
  );

  return data?.active?.name;
}

function DecodedConnectionString({
  value,
  names,
}: {
  value: string;
  names: Record<string, ReactNode>;
}) {
  const { t } = useTranslation();

  const parts = useMemo(() => decodeConnectionString(value), [value]);

  return (
    <DetailsBox>
      <DetailsBox.Summary>
        <Typography as="span">
          {t("screens.Dashboard.AdvancedOptionsModal.decoded.summary")}
        </Typography>
      </DetailsBox.Summary>

      <DetailsBox.Content>
        {!parts && (
          <Typography as="small" isError>
            {t("screens.Dashboard.AdvancedOptionsModal.decoded.decodeError")}
          </Typography>
        )}

        {parts && parts.length > 0 && (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card shadow-xs overflow-hidden">
            {parts.map(({ key, label, value }) => (
              <li
                key={key}
                className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 px-3 py-2 bg-zinc-50 dark:bg-surface-900/40"
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sm:w-40 sm:shrink-0">
                  {t(
                    `screens.Dashboard.AdvancedOptionsModal.decoded.fields.${label}`
                  )}
                </span>
                <span className="flex flex-1 flex-col gap-0.5">
                  {names[value] && (
                    <span className="text-sm text-foreground">
                      {names[value]}
                    </span>
                  )}
                  <span className="font-mono text-xs text-zinc-700 dark:text-zinc-200 break-all">
                    {value}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </DetailsBox.Content>
    </DetailsBox>
  );
}
