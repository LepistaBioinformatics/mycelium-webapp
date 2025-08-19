import Button from "@/components/ui/Button";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import Divider from "@/components/ui/Divider";
import FormField from "@/components/ui/FomField";
import Modal from "@/components/ui/Modal";
import PermissionIcon from "@/components/ui/PermissionIcon";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import useSuspenseError from "@/hooks/use-suspense-error";
import { buildPath } from "@/services/openapi/mycelium-api";
import { MycPermission } from "@/types/MyceliumPermission";
import { Select, Spinner, TextInput } from "flowbite-react";
import { ComponentProps, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaCheck, FaCopy, FaTimes } from "react-icons/fa";
import { RiCheckboxBlankLine, RiCheckboxLine } from "react-icons/ri";

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

  const { parseHttpError, dispatchWarning } = useSuspenseError();

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
      const token = await getAccessTokenSilently();

      if (!token) {
        setIsSubmitting(false);
        return;
      }

      const consolidatedRoles = roles
        ?.filter(
          (role) =>
            !removedRoles.some(
              (r) => r.role === role.role && r.permission === role.permission
            )
        )
        ?.map((role) => [role.role, role.permission]);

      const response = await fetch(buildPath("/_adm/beginners/tokens"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expiration: Number(Expiration[expiration]),
          name,
          tenantId,
          accountId,
          roles: consolidatedRoles,
        }),
      });

      if (!response.ok) {
        parseHttpError(response);
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();

      setConnectionString(data.connectionString);
    } catch (error) {
      console.error(error);
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
          {t("screens.Dashboard.CreateConnectionStringModal.title")}
        </Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-4 w-full">
          <Typography as="p" decoration="smooth">
            {t("screens.Dashboard.CreateConnectionStringModal.explain")}
          </Typography>

          {accountId && (
            <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2 flex flex-col justify-between group/clip">
              <div className="flex sm:flex-col gap-1">
                <Typography as="h5">
                  {t("screens.Dashboard.CreateConnectionStringModal.accountId")}
                  <CopyToClipboard text={accountId} inline groupHidden />
                </Typography>
                <Typography as="p" decoration="smooth">
                  {t(
                    "screens.Dashboard.CreateConnectionStringModal.accountIdDescription"
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
            <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2 flex flex-col justify-between group/clip">
              <div className="flex sm:flex-col gap-3">
                <Typography as="h5">
                  {t("screens.Dashboard.CreateConnectionStringModal.tenantId")}
                  <CopyToClipboard text={tenantId} inline groupHidden />
                </Typography>
                <Typography as="p" decoration="smooth">
                  {t(
                    "screens.Dashboard.CreateConnectionStringModal.tenantIdDescription"
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

          {roles && roles.length > 0 && (
            <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2 flex flex-col gap-5 justify-between group/clip py-2">
              <div className="flex sm:flex-col gap-3">
                <Typography as="h5">
                  {t(
                    "screens.Dashboard.CreateConnectionStringModal.permissionedRoles"
                  )}
                </Typography>
                <Typography as="p" decoration="smooth">
                  {t(
                    "screens.Dashboard.CreateConnectionStringModal.permissionedRolesDescription"
                  )}
                </Typography>
              </div>

              <div className="flex flex-col gap-3 py-2">
                {roles.map(({ role, permission }, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-8 border-t border-indigo-300 dark:border-lime-900 px-3 py-2"
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
                        "screens.Dashboard.CreateConnectionStringModal.removeRole"
                      )}
                      className="text-lg text-orange-300 dark:text-orange-300 cursor-pointer"
                      onClick={() => handleRemoveRole({ role, permission })}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 w-full"
          >
            <div>
              <FormField
                label={t(
                  "screens.Dashboard.CreateConnectionStringModal.form.name.label"
                )}
                title={t(
                  "screens.Dashboard.CreateConnectionStringModal.form.name.title"
                )}
                width="full"
              >
                <TextInput
                  id="name"
                  autoFocus
                  type="text"
                  required
                  sizing="lg"
                  disabled={isSubmitting || connectionString !== null || copied}
                  placeholder={t(
                    "screens.Dashboard.CreateConnectionStringModal.form.name.placeholder"
                  )}
                  {...register("name", { required: true })}
                />

                {errors.expiration && <span>This field is required</span>}
              </FormField>
            </div>

            <div>
              <FormField
                label={t(
                  "screens.Dashboard.CreateConnectionStringModal.form.expiration.label"
                )}
                title={t(
                  "screens.Dashboard.CreateConnectionStringModal.form.expiration.title"
                )}
                width="full"
              >
                <Select
                  id="expiration"
                  sizing="lg"
                  disabled={isSubmitting || connectionString !== null || copied}
                  {...register("expiration")}
                >
                  {ExpirationOptions.map((expiration) => {
                    return (
                      <option key={expiration} value={expiration}>
                        {t(
                          `screens.Dashboard.CreateConnectionStringModal.form.expiration.options.${expiration}`
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
              rounded
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
                  "screens.Dashboard.CreateConnectionStringModal.form.create.label"
                )
              )}
            </Button>
          </form>

          {connectionString && (
            <div className="flex flex-col gap-5 mt-12">
              <Divider />

              <TextInput value={connectionString} disabled />

              <div className="flex flex-col-reverse sm:flex-row gap-5 justify-rev sm:justify-between">
                <Button
                  intent="warning"
                  rounded
                  fullWidth
                  disabled={connectionString === null}
                  onClick={() => handleReset()}
                >
                  {t(
                    "screens.Dashboard.CreateConnectionStringModal.form.reset"
                  )}
                  <FaTimes className="inline-block ml-2" />
                </Button>

                <Button
                  rounded
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
                        "screens.Dashboard.CreateConnectionStringModal.form.copied"
                      )}
                      <FaCheck className="inline-block ml-2" />
                    </>
                  ) : (
                    <>
                      {t(
                        "screens.Dashboard.CreateConnectionStringModal.form.copy.label"
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
