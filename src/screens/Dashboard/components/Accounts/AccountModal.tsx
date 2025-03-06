"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import { TENANT_ID_HEADER } from "@/constants/http-headers";
import useProfile from "@/hooks/use-profile";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { RootState } from "@/states/store";
import { TextInput } from "flowbite-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useSelector } from "react-redux";

type Account = components["schemas"]["Account"];

type Inputs = {
  name: string;
}

export interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  account: Account | null;
}

export default function AccountModal({ isOpen, onClose, onSuccess, account }: AccountModalProps) {
  const { getAccessTokenSilently } = useProfile();
  const [isLoading, setIsLoading] = useState(false);

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      name: account?.name ?? "",
    }
  })

  const nameWatch = watch("name");

  const handleLocalSuccess = () => {
    onSuccess();
    reset();
  }

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);

    const token = await getAccessTokenSilently();

    const baseUrl = account ? buildPath("/adm/rs/subscriptions-manager/accounts/{account_id}", {
      path: { account_id: account.id ?? "" }
    }) : buildPath("/adm/rs/subscriptions-manager/accounts");

    const response = await fetch(baseUrl, {
      method: account ? "PATCH" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        [TENANT_ID_HEADER]: tenantInfo?.id ?? ""
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
        <Typography>Create account</Typography>
      </Modal.Header>

      <Modal.Body>
        <form
          className="flex flex-col gap-2 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <TextInput
            className="my-2"
            placeholder="My best account"
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

          <Button
            rounded
            type="submit"
            disabled={!nameWatch || isLoading}
          >
            {account
              ? isLoading ? "Updating..." : "Update"
              : isLoading ? "Creating..." : "Create"}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
}
