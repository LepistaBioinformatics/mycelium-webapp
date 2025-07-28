"use client";

import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FomField";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import useSuspenseError from "@/hooks/use-suspense-error";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { Select, Textarea, TextInput } from "flowbite-react";
import { useCallback, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

type GuestRole = components["schemas"]["GuestRole"];

type Inputs = {
  name: string;
  description: string;
  permission?: MycPermission | undefined;
  system: boolean;
};

export interface GuestRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  guestRole: GuestRole | null;
}

export default function GuestRolesModal({
  isOpen,
  onClose,
  onSuccess,
  guestRole,
}: GuestRolesModalProps) {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);

  const { parseHttpError } = useSuspenseError();

  const { isAuthenticated, hasEnoughPermissions, getAccessTokenSilently } =
    useProfile({
      roles: [MycRole.GuestsManager],
      permissions: [MycPermission.Write],
    });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      name: guestRole?.name ?? "",
      description: guestRole?.description ?? "",
      permission:
        (guestRole?.permission as MycPermission | undefined) ||
        MycPermission.Read,
      system: false,
    },
  });

  const nameWatch = watch("name");
  const descriptionWatch = watch("description");

  const handleLocalSuccess = () => {
    onSuccess();
    reset();
  };

  const buildBaseUrl = useCallback(() => {
    if (!isAuthenticated || !hasEnoughPermissions)
      return {
        baseUrl: null,
        method: null,
      };

    if (guestRole && guestRole?.id) {
      return {
        baseUrl: buildPath("/_adm/guests-manager/guest-roles/{guest_role_id}", {
          path: { guest_role_id: guestRole.id },
        }),
        method: "PATCH",
      };
    }

    return {
      baseUrl: buildPath("/_adm/guests-manager/guest-roles"),
      method: "POST",
    };
  }, [guestRole, isAuthenticated, hasEnoughPermissions]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);

    const token = await getAccessTokenSilently();

    if (!token) {
      setIsLoading(false);
      return;
    }

    const { baseUrl, method } = buildBaseUrl();

    if (!baseUrl || !method) {
      setIsLoading(false);
      return;
    }

    const response = await fetch(baseUrl, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      handleLocalSuccess();
      setIsLoading(false);
      return;
    }

    parseHttpError(response);
    setIsLoading(false);
  };

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography>
          {guestRole
            ? t("screens.Dashboard.GuestRoles.GuestRolesModal.editGuestRole")
            : t("screens.Dashboard.GuestRoles.GuestRolesModal.createGuestRole")}
        </Typography>
      </Modal.Header>

      <Modal.Body>
        <form
          className="flex flex-col gap-2 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormField
            label={t(
              "screens.Dashboard.GuestRoles.GuestRolesModal.form.name.label"
            )}
            title={t(
              "screens.Dashboard.GuestRoles.GuestRolesModal.form.name.title"
            )}
          >
            <TextInput
              id="name"
              placeholder={t(
                "screens.Dashboard.GuestRoles.GuestRolesModal.form.name.placeholder"
              )}
              sizing="lg"
              color="custom"
              autoFocus
              theme={{
                field: {
                  input: {
                    colors: {
                      custom:
                        "border-zinc-400 bg-indigo-50 text-zinc-900 focus:border-cyan-500 focus:ring-zinc-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-zinc-500  dark:placeholder-zinc-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
                    },
                  },
                },
              }}
              {...register("name")}
            />
            {errors.name && <span>This field is required</span>}
          </FormField>

          <FormField
            label={t(
              "screens.Dashboard.GuestRoles.GuestRolesModal.form.description.label"
            )}
            title={t(
              "screens.Dashboard.GuestRoles.GuestRolesModal.form.description.title"
            )}
          >
            <Textarea
              id="description"
              className="h-24 p-4"
              placeholder={t(
                "screens.Dashboard.GuestRoles.GuestRolesModal.form.description.placeholder"
              )}
              rows={4}
              color="custom"
              theme={{
                colors: {
                  custom:
                    "border-zinc-400 bg-indigo-50 text-zinc-900 focus:border-cyan-500 focus:ring-zinc-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-zinc-500  dark:placeholder-zinc-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
                },
              }}
              {...register("description")}
            />
            {errors.description && <span>This field is required</span>}
          </FormField>

          <FormField
            label={t(
              "screens.Dashboard.GuestRoles.GuestRolesModal.form.permission.label"
            )}
            title={
              guestRole
                ? t(
                    "screens.Dashboard.GuestRoles.GuestRolesModal.form.permission.titleReadOnly"
                  )
                : t(
                    "screens.Dashboard.GuestRoles.GuestRolesModal.form.permission.titleWrite"
                  )
            }
          >
            <Select
              id="permission"
              sizing="lg"
              disabled={!!guestRole}
              title={
                guestRole
                  ? t(
                      "screens.Dashboard.GuestRoles.GuestRolesModal.form.permission.titleReadOnly"
                    )
                  : t(
                      "screens.Dashboard.GuestRoles.GuestRolesModal.form.permission.titleWrite"
                    )
              }
              defaultValue={
                (guestRole?.permission as MycPermission | undefined) ||
                MycPermission.Read
              }
              {...register("permission")}
            >
              <option value={MycPermission.Read}>
                {t(
                  "screens.Dashboard.GuestRoles.GuestRolesModal.form.permission.read"
                )}
              </option>
              <option value={MycPermission.Write}>
                {t(
                  "screens.Dashboard.GuestRoles.GuestRolesModal.form.permission.write"
                )}
              </option>
            </Select>
          </FormField>

          <Button
            rounded
            type="submit"
            disabled={!nameWatch || !descriptionWatch || isLoading}
          >
            {guestRole
              ? isLoading
                ? t(
                    "screens.Dashboard.GuestRoles.GuestRolesModal.form.updating"
                  )
                : t("screens.Dashboard.GuestRoles.GuestRolesModal.form.update")
              : isLoading
              ? t("screens.Dashboard.GuestRoles.GuestRolesModal.form.creating")
              : t("screens.Dashboard.GuestRoles.GuestRolesModal.form.create")}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
}
