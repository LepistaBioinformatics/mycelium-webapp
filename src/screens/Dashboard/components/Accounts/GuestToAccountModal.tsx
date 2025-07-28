import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FomField";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import { TENANT_ID_HEADER } from "@/constants/http-headers";
import validateEmail from "@/functions/validate-email";
import useProfile from "@/hooks/use-profile";
import useSuspenseError from "@/hooks/use-suspense-error";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { RootState } from "@/states/store";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { TextInput } from "flowbite-react";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import GuestRoleSelector, {
  GuestRoleSelectorProps,
} from "../GuestRoleSelector";
import { useTranslation } from "react-i18next";

type Account = components["schemas"]["Account"];
type GuestRole = components["schemas"]["GuestRole"];

type Inputs = {
  email: string;
};

interface Props extends Pick<GuestRoleSelectorProps, "restrictRoleToSlug"> {
  account: Account;
  isOpen: boolean;
  onClose: () => void;
  tenantId?: string | null;
}

export default function GuestToAccountModal({
  account,
  isOpen,
  onClose,
  tenantId: tenantIdProp,
  ...guestRoleSelectorProps
}: Props) {
  const { t } = useTranslation();

  const [selectedRole, setSelectedRole] = useState<GuestRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { parseHttpError } = useSuspenseError();

  const { getAccessTokenSilently } = useProfile({
    roles: [MycRole.SubscriptionsManager],
    permissions: [MycPermission.Write],
    restrictSystemAccount: true,
  });

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const tenantId = useMemo(() => {
    if (tenantIdProp) return tenantIdProp;
    if (tenantInfo?.id) return tenantInfo.id;

    return null;
  }, [tenantIdProp, tenantInfo?.id]);

  const {
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async (data, event) => {
    event?.preventDefault();

    setIsSubmitting(true);

    if (!selectedRole) {
      setIsSubmitting(false);
      return;
    }

    if (!account.id || !selectedRole.id) {
      setIsSubmitting(false);
      return;
    }

    const token = await getAccessTokenSilently();

    const response = await fetch(
      buildPath(
        "/_adm/subscriptions-manager/guests/accounts/{account_id}/roles/{role_id}",
        {
          path: { account_id: account.id, role_id: selectedRole?.id },
        }
      ),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(tenantId ? { [TENANT_ID_HEADER]: tenantId } : {}),
        },
        body: JSON.stringify({
          email: data.email,
        }),
      }
    );

    if (!response.ok) {
      parseHttpError(response);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onClose();
    reset();
  };

  const emailIsValid = useMemo(() => {
    return validateEmail(watch("email"));
  }, [watch("email")]);

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography as="h4">
          {t("screens.Dashboard.Accounts.GuestToAccountModal.title")}
        </Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-8 p-3 xl:min-w-[500px] w-full">
          <FormField
            id="email"
            label={t(
              "screens.Dashboard.Accounts.GuestToAccountModal.form.email.label"
            )}
            title={t(
              "screens.Dashboard.Accounts.GuestToAccountModal.form.email.title"
            )}
          >
            <TextInput
              id="email"
              type="email"
              placeholder={t(
                "screens.Dashboard.Accounts.GuestToAccountModal.form.email.placeholder"
              )}
              color="custom"
              sizing="sm"
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
              {...register("email", { required: true })}
            />

            {watch("email") && !emailIsValid && (
              <Typography as="small" decoration="smooth">
                Waiting for a valid email address...
              </Typography>
            )}

            {errors.email && <span>This field is required</span>}
          </FormField>

          <FormField
            label={t(
              "screens.Dashboard.Accounts.GuestToAccountModal.form.account.label"
            )}
            title={t(
              "screens.Dashboard.Accounts.GuestToAccountModal.form.account.title"
            )}
          >
            <Typography as="h3">{account.name}</Typography>
          </FormField>

          <GuestRoleSelector
            label={t(
              "screens.Dashboard.Accounts.GuestToAccountModal.form.role.label"
            )}
            title={t(
              "screens.Dashboard.Accounts.GuestToAccountModal.form.role.title"
            )}
            selectedRole={selectedRole}
            setSelectedRole={(role) => setSelectedRole(role)}
            shouldBeSystemRole={account.isDefault}
            {...guestRoleSelectorProps}
          />

          {selectedRole && emailIsValid && account?.id && (
            <Button
              rounded
              fullWidth
              onClick={() => onSubmit({ email: watch("email") })}
              disabled={isSubmitting}
            >
              {t("screens.Dashboard.Accounts.GuestToAccountModal.form.invite")}
            </Button>
          )}

          <div className="flex flex-col gap-2 w-full max-w-md">
            {errors.email && (
              <Banner title="User error" intent="error">
                <Typography as="p">{errors.email?.message}</Typography>
              </Banner>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
