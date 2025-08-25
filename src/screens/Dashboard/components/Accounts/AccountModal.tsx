import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
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
import { useCallback, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

type Account = components["schemas"]["Account"];

enum SystemAccountTypes {
  SYSTEM__GATEWAY_MANAGER = "gatewayManager",
  SYSTEM__GUEST_MANAGER = "guestsManager",
  SYSTEM__SYSTEM_MANAGER = "systemManager",
}

type Inputs = {
  name: string;
  roleName?: string;
  roleDescription?: string;
  accountType?: SystemAccountTypes;
};

export interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  account?: Account | null;
  accountId?: string | null;
  scope?: "subscription" | "roleAssociated" | "systemScoped" | undefined;
}

const MIN_LENGTH = 2;

export default function AccountModal({
  isOpen,
  onClose,
  onSuccess,
  account,
  accountId,
  scope,
}: AccountModalProps) {
  const { t } = useTranslation();

  const { parseHttpError } = useSuspenseError();

  const { hasAdminPrivileges, getAccessTokenSilently } = useProfile({
    roles: [MycRole.SubscriptionsManager],
    permissions: [MycPermission.Write],
    restrictSystemAccount: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [systemAccountType, setSystemAccountType] =
    useState<SystemAccountTypes | null>(null);

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
    },
  });

  const nameWatch = watch("name");
  const roleNameWatch = watch("roleName");
  const roleDescriptionWatch = watch("roleDescription");

  const handleLocalSuccess = () => {
    onSuccess();
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const buildBaseUrl = useCallback(() => {
    if (systemAccountType && scope === "systemScoped") {
      return {
        baseUrl: buildPath("/_adm/managers/accounts"),
        method: "POST",
      };
    }

    if (account) {
      return {
        baseUrl: buildPath(
          "/_adm/subscriptions-manager/accounts/{account_id}",
          {
            path: { account_id: accountId ?? "" },
          }
        ),
        method: "PATCH",
      };
    }

    if (scope === "roleAssociated") {
      return {
        baseUrl: buildPath(
          "/_adm/subscriptions-manager/accounts/role-associated"
        ),
        method: "POST",
      };
    }

    return {
      baseUrl: buildPath("/_adm/subscriptions-manager/accounts"),
      method: "POST",
    };
  }, [systemAccountType, account, accountId, scope]);

  const onSubmit: SubmitHandler<Inputs> = async ({
    name,
    roleName,
    roleDescription,
  }) => {
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
        [TENANT_ID_HEADER]: tenantInfo?.id ?? "",
      },
      body: JSON.stringify({
        name,
        accountName: name,
        actor: systemAccountType,
        roleName,
        roleDescription,
      }),
    });

    if (!response.ok) {
      parseHttpError(response);
      setIsLoading(false);
      return;
    }

    handleLocalSuccess();
    setIsLoading(false);
  };

  const handleCreateSystemAccount = (accountType: SystemAccountTypes) => {
    setSystemAccountType(accountType);
  };

  const disableSubmit = useMemo(() => {
    if (scope === "subscription") {
      return !nameWatch || nameWatch.length < 3 || isLoading || !tenantInfo?.id;
    }

    if (scope === "roleAssociated") {
      return (
        !roleNameWatch ||
        roleNameWatch.length < MIN_LENGTH ||
        !roleDescriptionWatch ||
        roleDescriptionWatch.length < MIN_LENGTH ||
        isLoading ||
        !hasAdminPrivileges
      );
    }

    return (
      !nameWatch ||
      nameWatch.length < MIN_LENGTH ||
      isLoading ||
      !hasAdminPrivileges
    );
  }, [
    nameWatch,
    roleNameWatch,
    roleDescriptionWatch,
    isLoading,
    scope,
    tenantInfo?.id,
    hasAdminPrivileges,
  ]);

  if (!scope) {
    return null;
  }

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={handleClose}>
        <Typography>
          {account
            ? t("screens.Dashboard.Accounts.AccountModal.editAccount")
            : t("screens.Dashboard.Accounts.AccountModal.createAccount")}
        </Typography>
      </Modal.Header>

      <Modal.Body>
        <form
          className="flex flex-col gap-5 w-full mb-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          {scope === "roleAssociated" && (
            <>
              <FormField
                label={t("screens.Dashboard.Accounts.AccountModal.name.title")}
                title={t("screens.Dashboard.Accounts.AccountModal.name.title")}
              >
                <TextInput
                  placeholder={t(
                    "screens.Dashboard.Accounts.AccountModal.name.placeholder"
                  )}
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
                  "screens.Dashboard.Accounts.AccountModal.roleName.title"
                )}
                title={t(
                  "screens.Dashboard.Accounts.AccountModal.roleName.title"
                )}
              >
                <TextInput
                  placeholder={t(
                    "screens.Dashboard.Accounts.AccountModal.roleName.placeholder"
                  )}
                  color="custom"
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
                  {...register("roleName")}
                />
                {errors.roleName && <span>This field is required</span>}
              </FormField>

              <FormField
                label={t(
                  "screens.Dashboard.Accounts.AccountModal.roleDescription.title"
                )}
                title={t(
                  "screens.Dashboard.Accounts.AccountModal.roleDescription.title"
                )}
              >
                <TextInput
                  placeholder={t(
                    "screens.Dashboard.Accounts.AccountModal.roleDescription.placeholder"
                  )}
                  color="custom"
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
                  {...register("roleDescription")}
                />
                {errors.roleDescription && <span>This field is required</span>}
              </FormField>

              <Button rounded type="submit" disabled={disableSubmit}>
                {account
                  ? isLoading
                    ? t("screens.Dashboard.Accounts.AccountModal.updating")
                    : t("screens.Dashboard.Accounts.AccountModal.update")
                  : isLoading
                  ? t("screens.Dashboard.Accounts.AccountModal.creating")
                  : t("screens.Dashboard.Accounts.AccountModal.create")}
              </Button>
            </>
          )}

          {scope === "subscription" && (
            <>
              <FormField
                label={t("screens.Dashboard.Accounts.AccountModal.name.title")}
                title={t("screens.Dashboard.Accounts.AccountModal.name.title")}
              >
                <TextInput
                  placeholder={t(
                    "screens.Dashboard.Accounts.AccountModal.name.placeholder"
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

              <Button rounded type="submit" disabled={disableSubmit}>
                {account
                  ? isLoading
                    ? t("screens.Dashboard.Accounts.AccountModal.updating")
                    : t("screens.Dashboard.Accounts.AccountModal.update")
                  : isLoading
                  ? t("screens.Dashboard.Accounts.AccountModal.creating")
                  : t("screens.Dashboard.Accounts.AccountModal.create")}
              </Button>
            </>
          )}

          {hasAdminPrivileges && !account && scope === "systemScoped" && (
            <>
              <FormField
                label={t("screens.Dashboard.Accounts.AccountModal.name.title")}
                title={t("screens.Dashboard.Accounts.AccountModal.name.title")}
              >
                <TextInput
                  placeholder={t(
                    "screens.Dashboard.Accounts.AccountModal.name.placeholder"
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

              <div className="flex flex-col gap-5">
                <Banner intent="success">
                  <div className="flex justify-between gap-2 my-5">
                    <div className="flex flex-col gap-2">
                      <Typography as="h5" uppercase>
                        {t(
                          "screens.Dashboard.Accounts.AccountModal.createSystemAccount.guestManager.title"
                        )}
                      </Typography>

                      <Typography as="span" decoration="smooth" width="xs">
                        {t(
                          "screens.Dashboard.Accounts.AccountModal.createSystemAccount.guestManager.description"
                        )}
                      </Typography>
                    </div>

                    <div>
                      <Button
                        rounded
                        type="submit"
                        disabled={disableSubmit}
                        onClick={() =>
                          handleCreateSystemAccount(
                            SystemAccountTypes.SYSTEM__GUEST_MANAGER
                          )
                        }
                      >
                        {t(
                          "screens.Dashboard.Accounts.AccountModal.createSystemAccount.guestManager.button"
                        )}
                      </Button>
                    </div>
                  </div>
                </Banner>

                <Banner intent="success">
                  <div className="flex justify-between gap-2 my-5">
                    <div className="flex flex-col gap-2">
                      <Typography as="h5" uppercase>
                        {t(
                          "screens.Dashboard.Accounts.AccountModal.createSystemAccount.gatewayManager.title"
                        )}
                      </Typography>

                      <Typography as="span" decoration="smooth" width="xs">
                        {t(
                          "screens.Dashboard.Accounts.AccountModal.createSystemAccount.gatewayManager.description"
                        )}
                      </Typography>
                    </div>

                    <div>
                      <Button
                        rounded
                        type="submit"
                        disabled={disableSubmit}
                        onClick={() =>
                          handleCreateSystemAccount(
                            SystemAccountTypes.SYSTEM__GATEWAY_MANAGER
                          )
                        }
                      >
                        {t(
                          "screens.Dashboard.Accounts.AccountModal.createSystemAccount.gatewayManager.button"
                        )}
                      </Button>
                    </div>
                  </div>
                </Banner>

                <Banner intent="success">
                  <div className="flex justify-between gap-2 my-5">
                    <div className="flex flex-col gap-2">
                      <Typography as="h5" uppercase>
                        {t(
                          "screens.Dashboard.Accounts.AccountModal.createSystemAccount.systemManager.title"
                        )}
                      </Typography>

                      <Typography as="span" decoration="smooth" width="xs">
                        {t(
                          "screens.Dashboard.Accounts.AccountModal.createSystemAccount.systemManager.description"
                        )}
                      </Typography>
                    </div>

                    <div>
                      <Button
                        rounded
                        type="submit"
                        disabled={disableSubmit}
                        onClick={() =>
                          handleCreateSystemAccount(
                            SystemAccountTypes.SYSTEM__SYSTEM_MANAGER
                          )
                        }
                      >
                        {t(
                          "screens.Dashboard.Accounts.AccountModal.createSystemAccount.systemManager.button"
                        )}
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
