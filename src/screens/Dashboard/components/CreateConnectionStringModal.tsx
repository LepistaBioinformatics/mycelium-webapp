import Button from "@/components/ui/Button";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import DetailsBox from "@/components/ui/DetailsBox";
import Divider from "@/components/ui/Divider";
import FormField from "@/components/ui/FomField";
import Modal from "@/components/ui/Modal";
import PermissionIcon from "@/components/ui/PermissionIcon";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import useSuspenseError from "@/hooks/use-suspense-error";
import { tokensCreate } from "@/services/rpc/beginners";
import { MycPermission } from "@/types/MyceliumPermission";
import { Select, Spinner, TextInput } from "flowbite-react";
import { ComponentProps, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaCheck, FaCopy, FaTimes } from "react-icons/fa";
import { RiCheckboxBlankLine, RiCheckboxLine } from "react-icons/ri";

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

type PermissionedRole = {
  role: string;
  permission: MycPermission;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenantId?: string | null;
  accountId?: string | null;
  roles?: PermissionedRole[] | null;
}

type Inputs = {
  name: string;
  expiration: number;
};

const INPUT_COLORS =
  "border-brand-600 bg-brand-violet-50 text-zinc-900 focus:border-infra-400 focus:ring-zinc-500 dark:bg-brand-950 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 dark:focus:border-brand-violet-500 dark:focus:ring-brand-violet-500";

const INPUT_THEME = {
  field: { input: { colors: { custom: INPUT_COLORS } } },
};

const SELECT_THEME = {
  field: { select: { colors: { custom: INPUT_COLORS } } },
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
  roles,
}: Props) {
  const { t } = useTranslation();

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
      dispatchWarning(String(error));
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

  const CheckIcon = ({
    role,
    permission,
    ...props
  }: {
    role: string;
    permission: MycPermission;
  } & ComponentProps<typeof RiCheckboxLine>) => {
    const Icon = removedRoles.some(
      (r) => r.role === role && r.permission === permission
    )
      ? RiCheckboxBlankLine
      : RiCheckboxLine;

    return <Icon {...props} />;
  };

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
                  color="custom"
                  theme={INPUT_THEME}
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
                  color="custom"
                  theme={SELECT_THEME}
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
                copied
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
                color="custom"
                theme={INPUT_THEME}
                disabled
              />

              <DecodedConnectionString value={connectionString} />

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

          {roles && roles.length > 0 && (
            <div className="rounded-lg border border-brand-600 px-2 flex flex-col gap-5 justify-between group/clip py-2">
              <div className="flex sm:flex-col gap-3">
                <Typography as="h5">
                  {t(
                    "screens.Dashboard.AdvancedOptionsModal.permissionedRoles"
                  )}
                </Typography>
                <Typography as="p" decoration="smooth">
                  {t(
                    "screens.Dashboard.AdvancedOptionsModal.permissionedRolesDescription"
                  )}
                </Typography>
              </div>

              <div className="flex flex-col gap-3 py-2">
                {roles.map(({ role, permission }, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-8 border-t border-brand-violet-300 dark:border-brand-violet-700 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span>{role}</span>
                      <span className="sm:block sm:group-hover:hidden transition-all duration-500">
                        <PermissionIcon permission={permission} inline />
                      </span>
                    </div>
                    <CheckIcon
                      role={role}
                      permission={permission}
                      title={t(
                        "screens.Dashboard.AdvancedOptionsModal.removeRole"
                      )}
                      className="text-lg text-orange-300 dark:text-orange-300 cursor-pointer"
                      onClick={() => handleRemoveRole({ role, permission })}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {accountId && (
            <div className="rounded-lg border border-brand-600 px-2 flex flex-col justify-between group/clip">
              <div className="flex sm:flex-col gap-1">
                <Typography as="h5">
                  {t("screens.Dashboard.AdvancedOptionsModal.accountId")}
                  <CopyToClipboard text={accountId} inline groupHidden />
                </Typography>
                <Typography as="p" decoration="smooth">
                  {t(
                    "screens.Dashboard.AdvancedOptionsModal.accountIdDescription"
                  )}
                </Typography>
              </div>
              <div className="mt-1">
                <Typography as="span" decoration="faded">
                  {accountId}
                </Typography>
              </div>
            </div>
          )}

          {tenantId && (
            <div className="rounded-lg border border-brand-600 px-2 flex flex-col justify-between group/clip">
              <div className="flex sm:flex-col gap-3">
                <Typography as="h5">
                  {t("screens.Dashboard.AdvancedOptionsModal.tenantId")}
                  <CopyToClipboard text={tenantId} inline groupHidden />
                </Typography>
                <Typography as="p" decoration="smooth">
                  {t(
                    "screens.Dashboard.AdvancedOptionsModal.tenantIdDescription"
                  )}
                </Typography>
              </div>
              <div className="mt-1">
                <Typography as="span" decoration="faded">
                  {tenantId}
                </Typography>
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}

function DecodedConnectionString({ value }: { value: string }) {
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
          <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-brand-900 rounded-lg border border-brand-600 overflow-hidden">
            {parts.map(({ key, label, value }) => (
              <li
                key={key}
                className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 px-3 py-2 bg-zinc-50 dark:bg-brand-900/40"
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sm:w-40 sm:shrink-0">
                  {t(
                    `screens.Dashboard.AdvancedOptionsModal.decoded.fields.${label}`
                  )}
                </span>
                <span className="font-mono text-xs text-zinc-700 dark:text-zinc-200 break-all flex-1">
                  {value}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DetailsBox.Content>
    </DetailsBox>
  );
}
