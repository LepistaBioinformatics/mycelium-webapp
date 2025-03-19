"use client";

import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";
import FormField from "@/components/ui/FomField";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import { TENANT_ID_HEADER } from "@/constants/http-headers";
import useProfile from "@/hooks/use-profile";
import useSuspenseError from "@/hooks/use-suspense-error";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { RootState } from "@/states/store";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { TextInput } from "flowbite-react";
import { useCallback, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useSelector } from "react-redux";

type Account = components["schemas"]["Account"];

enum SystemAccountTypes {
  GATEWAY_MANAGER = "gatewayManager",
  GUEST_MANAGER = "guestsManager",
  SYSTEM_MANAGER = "systemManager",
}

type Inputs = {
  name: string;
  accountType?: SystemAccountTypes;
}

export interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  account: Account | null;
  accountId: string | null;
}

export default function AccountModal({
  isOpen,
  onClose,
  onSuccess,
  account,
  accountId,
}: AccountModalProps) {
  const { parseHttpError } = useSuspenseError();

  const { hasAdminPrivileges, getAccessTokenSilently } = useProfile({
    roles: [MycRole.SubscriptionsManager],
    permissions: [MycPermission.Write],
    restrictSystemAccount: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [systemAccountType, setSystemAccountType] = useState<SystemAccountTypes | null>(null);

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

  const buildBaseUrl = useCallback(() => {
    if (systemAccountType) {
      return {
        baseUrl: buildPath("/adm/su/managers/accounts"),
        method: "POST"
      };
    }

    if (account) {
      return {
        baseUrl: buildPath("/adm/rs/subscriptions-manager/accounts/{account_id}", {
          path: { account_id: accountId ?? "" }
        }),
        method: "PATCH"
      };
    }

    return {
      baseUrl: buildPath("/adm/rs/subscriptions-manager/accounts"),
      method: "POST"
    };
  }, [systemAccountType, account]);

  const onSubmit: SubmitHandler<Inputs> = async ({ name }) => {
    setIsLoading(true);

    const token = await getAccessTokenSilently();

    if (!token) {
      setIsLoading(false);
      return;
    }

    const { baseUrl, method } = buildBaseUrl();

    const response = await fetch(baseUrl, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        [TENANT_ID_HEADER]: tenantInfo?.id ?? ""
      },
      body: JSON.stringify({ name, actor: systemAccountType })
    });

    if (!response.ok) {
      parseHttpError(response);
      setIsLoading(false);
      return;
    }

    handleLocalSuccess();
    setIsLoading(false);
  }

  const handleCreateSystemAccount = (accountType: SystemAccountTypes) => {
    setSystemAccountType(accountType);
  }

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography>Create account</Typography>
      </Modal.Header>

      <Modal.Body>
        <form
          className="flex flex-col gap-5 w-full mb-24"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormField label="Name" title="Name of your account">
            <TextInput
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
          </FormField>

          <Button
            rounded
            type="submit"
            disabled={!nameWatch || isLoading || !tenantInfo?.id}
          >
            {account
              ? isLoading ? "Updating..." : "Update Subscription Account"
              : isLoading ? "Creating..." : "Create Subscription Account"}
          </Button>

          {hasAdminPrivileges && !account && (
            <>
              <Divider style="or" />

              <div className="flex flex-col gap-5">
                <Typography width="md">
                  Create System account. System accounts are not connected to a
                  specific Tenant and have global scope.
                </Typography>

                <Banner intent="success">
                  <div className="flex justify-between gap-2 my-5">
                    <div className="flex flex-col gap-2">
                      <Typography as="h5" uppercase>
                        Guests Manager
                      </Typography>

                      <Typography as="span" decoration="smooth" width="xs">
                        Guests Manager account is a system account designed to
                        manage guests roles and guest related tokens.
                      </Typography>
                    </div>

                    <div>
                      <Button
                        rounded
                        type="submit"
                        disabled={!nameWatch || isLoading}
                        onClick={() => handleCreateSystemAccount(SystemAccountTypes.GUEST_MANAGER)}
                      >
                        Create
                      </Button>
                    </div>
                  </div>
                </Banner>

                <Banner intent="success">
                  <div className="flex justify-between gap-2 my-5">
                    <div className="flex flex-col gap-2">
                      <Typography as="h5" uppercase>
                        Gateway Manager
                      </Typography>

                      <Typography as="span" decoration="smooth" width="xs">
                        Gateway Manager account is a system account designed to
                        manage gateway downstream routes and applications.
                      </Typography>
                    </div>

                    <div>
                      <Button
                        rounded
                        type="submit"
                        disabled={!nameWatch || isLoading}
                        onClick={() => handleCreateSystemAccount(SystemAccountTypes.GATEWAY_MANAGER)}
                      >
                        Create
                      </Button>
                    </div>
                  </div>
                </Banner>

                <Banner intent="success">
                  <div className="flex justify-between gap-2 my-5">
                    <div className="flex flex-col gap-2">
                      <Typography as="h5" uppercase>
                        System Manager
                      </Typography>

                      <Typography as="span" decoration="smooth" width="xs">
                        System Manager account is a standard account type
                        designed to manage webhooks and standard error codes.
                      </Typography>
                    </div>

                    <div>
                      <Button
                        rounded
                        type="submit"
                        disabled={!nameWatch || isLoading}
                        onClick={() => handleCreateSystemAccount(SystemAccountTypes.SYSTEM_MANAGER)}
                      >
                        Create
                      </Button>
                    </div>
                  </div>
                </Banner>
              </div>
            </>
          )}

        </form>
      </Modal.Body>
    </Modal>
  );
}
