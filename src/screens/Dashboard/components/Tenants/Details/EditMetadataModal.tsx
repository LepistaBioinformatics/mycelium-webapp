import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FomField";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import snakeToHumanText from "@/functions/snake-to-human-text";
import useProfile from "@/hooks/use-profile";
import useSuspenseError from "@/hooks/use-suspense-error";
import { components } from "@/services/openapi/mycelium-schema";
import { metaCreate } from "@/services/rpc/tenantOwner";
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

    try {
      await metaCreate(
        { tenantId, key: editMetadataKey, value: data.value },
        getAccessTokenSilently
      );
      onSuccess();
    } catch (err) {
      parseHttpError(err as Response);
    } finally {
      setIsLoading(false);
    }
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
                        "border-zinc-400 bg-brand-violet-50 text-zinc-900 focus:border-cyan-500 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white placeholder-zinc-500  dark:placeholder-zinc-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
                    },
                  },
                },
              }}
              {...register("value")}
            />
            {errors.value && <span>This field is required</span>}
          </FormField>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
}
