import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FomField";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import { TENANT_ID_HEADER } from "@/constants/http-headers";
import snakeToHumanText from "@/functions/snake-to-human-text";
import useProfile from "@/hooks/use-profile";
import useSuspenseError from "@/hooks/use-suspense-error";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { TextInput } from "flowbite-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type TenantMetaKey = components["schemas"]["TenantMetaKey"];

type Inputs = {
  value: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenantId: string;
  editMetadataKey: TenantMetaKey | null;
  editMetadataValue?: string | null;
}

export default function EditMetadataModal({
  isOpen,
  onClose,
  onSuccess,
  tenantId,
  editMetadataKey,
  editMetadataValue,
}: Props) {
  const { hasEnoughPermissions, getAccessTokenSilently } = useProfile({
    shouldBeManager: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  const { parseHttpError, dispatchWarning } = useSuspenseError();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      value: editMetadataValue ?? "",
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);

    console.log(data);

    if (!editMetadataKey) {
      setIsLoading(false);
      dispatchWarning("Please fill in all fields");
      return;
    }

    if (!data.value) {
      setIsLoading(false);
      dispatchWarning("Please fill in all fields");
      return;
    }

    const token = await getAccessTokenSilently();

    const response = await fetch(buildPath("/adm/rs/tenant-owner/meta"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        [TENANT_ID_HEADER]: tenantId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: editMetadataKey?.toString(),
        value: data.value,
      }),
    });

    if (!response.ok) {
      parseHttpError(response);
    }

    onSuccess();
    setIsLoading(false);
  };

  if (!hasEnoughPermissions) {
    return null;
  }

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography>Edit metadata</Typography>
      </Modal.Header>

      <Modal.Body>
        <form
          className="flex flex-col gap-2 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormField label="Key" title="Key of your metadata">
            <Typography as="h3">
              {snakeToHumanText(editMetadataKey?.toString() ?? "")}
            </Typography>
          </FormField>

          <FormField label="Value" title="Value of your metadata">
            <TextInput
              className="my-2"
              placeholder="Value of your metadata"
              sizing="lg"
              autoFocus
              color="custom"
              theme={{
                field: {
                  input: {
                    colors: {
                      custom:
                        "border-zinc-400 bg-blue-50 text-zinc-900 focus:border-cyan-500 focus:ring-zinc-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-zinc-500  dark:placeholder-zinc-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
                    },
                  },
                },
              }}
              {...register("value")}
            />
            {errors.value && <span>This field is required</span>}
          </FormField>

          <Button rounded type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
}
