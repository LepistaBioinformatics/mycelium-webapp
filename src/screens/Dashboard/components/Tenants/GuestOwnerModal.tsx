import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FomField";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import { TENANT_ID_HEADER } from "@/constants/http-headers";
import useProfile from "@/hooks/use-profile";
import useSuspenseError from "@/hooks/use-suspense-error";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { MycPermission } from "@/types/MyceliumPermission";
import { TextInput } from "flowbite-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type Tenant = components["schemas"]["Tenant"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenant: Tenant | null;
}

type Inputs = {
  email: string;
}

export default function GuestOwner({ isOpen, onClose, onSuccess, tenant }: Props) {
  const { profile, hasEnoughPermissions, getAccessTokenSilently } = useProfile({
    tenantOwnerNeeded: [tenant?.id ?? ""],
    permissions: [MycPermission.Write],
    restrictSystemAccount: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  const { parseHttpError } = useSuspenseError();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      email: ""
    }
  });

  const emailWatch = watch("email");

  const handleLocalSuccess = () => {
    onSuccess();
    reset();
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);

    const ownershipId = profile?.owners.find((owner) => owner.isPrincipal)?.id;

    if (!ownershipId) {
      setIsLoading(false);
      return;
    } else {
      data = { email: emailWatch }
    }

    if (!tenant?.id) {
      setIsLoading(false);
      return;
    }

    const token = await getAccessTokenSilently();

    const response = await fetch(buildPath("/adm/rs/tenant-owner/owners"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        [TENANT_ID_HEADER]: tenant.id,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      handleLocalSuccess();
    } else {
      parseHttpError(response);
    }

    setIsLoading(false);
  }

  if (!hasEnoughPermissions) {
    return null;
  }

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography>Register tenant owner</Typography>
      </Modal.Header>

      <Modal.Body>
        <form
          className="flex flex-col gap-2 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormField label="Name" title="Name of your tenant">
            <TextInput
              className="my-2"
              type="email"
              placeholder="Email of the tenant owner"
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
              {...register("email")}
            />
            {errors.email && <span>This field is required</span>}
          </FormField>

          <Button
            rounded
            type="submit"
            disabled={!emailWatch || isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  )
}
