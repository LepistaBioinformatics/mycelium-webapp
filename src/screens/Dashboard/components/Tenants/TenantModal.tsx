"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { Textarea, TextInput } from "flowbite-react";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type Tenant = components["schemas"]["Tenant"];

type Inputs = {
  name: string;
  description: string;
  ownerId?: string;
}

export interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenant: Tenant | null;
}

export default function TenantModal({ isOpen, onClose, onSuccess, tenant }: TenantModalProps) {
  const { profile, getAccessTokenSilently } = useProfile();
  const [isLoading, setIsLoading] = useState(false);

  const principalOwner = useMemo(() => {
    if (!tenant) return null;

    if ("records" in tenant.owners) {
      return tenant.owners.records.find((owner) => owner.isPrincipal);
    }

    return null;
  }, [tenant]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      name: tenant?.name ?? "",
      description: tenant?.description ?? "",
      ownerId: principalOwner?.id ?? ""
    }
  })

  const nameWatch = watch("name");
  const descriptionWatch = watch("description");

  const handleLocalSuccess = () => {
    onSuccess();
    reset();
  }

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);

    const ownershipId = profile?.owners.find((owner) => owner.isPrincipal)?.id;

    if (!ownershipId) {
      setIsLoading(false);
      return;
    } else {
      data = {
        ...data,
        ownerId: ownershipId
      }
    }

    const token = await getAccessTokenSilently();

    const response = await fetch(buildPath("/adm/su/managers/tenants"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      handleLocalSuccess();
    }

    setIsLoading(false);
  }

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography>Create tenant</Typography>
      </Modal.Header>

      <Modal.Body>
        <form
          className="flex flex-col gap-2 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <TextInput
            className="my-2"
            placeholder="Name of your tenant"
            sizing="lg"
            autoFocus
            {...register("name")}
          />
          {errors.name && <span>This field is required</span>}

          <Textarea
            className="my-2 h-24 p-4"
            placeholder="Describe your tenant"
            rows={4}
            {...register("description")}
          />
          {errors.description && <span>This field is required</span>}

          <Button
            rounded
            type="submit"
            disabled={!nameWatch || !descriptionWatch || isLoading}
          >
            {tenant
              ? isLoading ? "Updating..." : "Update"
              : isLoading ? "Creating..." : "Create"}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
}
