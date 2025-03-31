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

type GuestRole = components["schemas"]["GuestRole"];

type Inputs = {
  name: string;
  description: string;
  permission?: MycPermission | undefined;
  system: boolean;
}

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
  guestRole
}: GuestRolesModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { parseHttpError } = useSuspenseError();

  const {
    isAuthenticated,
    hasEnoughPermissions,
    getAccessTokenSilently
  } = useProfile({
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
      permission: guestRole?.permission as MycPermission | undefined || MycPermission.Read,
      system: false
    }
  })

  const nameWatch = watch("name");
  const descriptionWatch = watch("description");

  const handleLocalSuccess = () => {
    onSuccess();
    reset();
  }

  const buildBaseUrl = useCallback(() => {
    if (!isAuthenticated || !hasEnoughPermissions) return {
      baseUrl: null,
      method: null
    };

    if (guestRole && guestRole?.id) {
      return {
        baseUrl: buildPath("/adm/rs/guests-manager/guest-roles/{guest_role_id}", {
          path: { guest_role_id: guestRole.id }
        }),
        method: "PATCH"
      };
    }

    return {
      baseUrl: buildPath("/adm/rs/guests-manager/guest-roles"),
      method: "POST"
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
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      handleLocalSuccess();
      setIsLoading(false);
      return;
    }

    parseHttpError(response);
    setIsLoading(false);
  }

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography>Create guest role</Typography>
      </Modal.Header>

      <Modal.Body>
        <form
          className="flex flex-col gap-2 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormField label="Name" title="Name of your guest role">
            <TextInput
              id="name"
              placeholder="Name of your guest role"
              sizing="lg"
              color="custom"
              autoFocus
              theme={{
                field: {
                  input: {
                    colors: {
                      custom: "border-slate-400 bg-blue-50 text-slate-900 focus:border-cyan-500 focus:ring-slate-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-slate-500  dark:placeholder-slate-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
                    },
                  }
                }
              }}
              {...register("name")}
            />
            {errors.name && <span>This field is required</span>}
          </FormField>

          <FormField label="Description" title="Describe your guest role">
            <Textarea
              id="description"
              className="h-24 p-4"
              placeholder="Describe your guest role"
              rows={4}
              color="custom"
              theme={{
                colors: {
                  custom: "border-slate-400 bg-blue-50 text-slate-900 focus:border-cyan-500 focus:ring-slate-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-slate-500  dark:placeholder-slate-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
                },
              }}
              {...register("description")}
            />
            {errors.description && <span>This field is required</span>}
          </FormField>

          <FormField
            label="Permission"
            title={guestRole ? "This field is read-only" : "Permission of your guest role"}
          >
            <Select
              id="permission"
              sizing="lg"
              disabled={!!guestRole}
              title={guestRole ? "This field is read-only" : "Permission of your guest role"}
              defaultValue={guestRole?.permission as MycPermission | undefined || MycPermission.Read}
              {...register("permission")}
            >
              <option value={MycPermission.Read}>Read</option>
              <option value={MycPermission.Write}>Write</option>
            </Select>
          </FormField>

          <Button
            rounded
            type="submit"
            disabled={!nameWatch || !descriptionWatch || isLoading}
          >
            {guestRole
              ? isLoading ? "Updating..." : "Update"
              : isLoading ? "Creating..." : "Create"}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
}
