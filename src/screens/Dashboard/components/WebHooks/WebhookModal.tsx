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
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type WebHook = components["schemas"]["WebHook"];
type WebHookTrigger = components["schemas"]["WebHookTrigger"];

enum Secret {
  Nothing = "nothing",
  AuthorizationHeader = "authorizationHeader",
  QueryParam = "queryParam",
}

const triggers: WebHookTrigger[] = [
  "subscriptionAccount.created",
  "subscriptionAccount.updated",
  "subscriptionAccount.deleted",
  "userAccount.created",
  "userAccount.updated",
  "userAccount.deleted",
];

type Inputs = {
  name: string;
  description: string;
  url: string;
  trigger: WebHookTrigger;
  secret?: WebHook["secret"];
};

const textInputTheme = {
  field: {
    input: {
      colors: {
        custom:
          "border-zinc-400 bg-indigo-50 text-zinc-900 focus:border-cyan-500 focus:ring-zinc-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-zinc-500  dark:placeholder-zinc-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
      },
    },
  },
};

export interface WebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  webhook: WebHook | null;
}

export default function WebhookModal({
  isOpen,
  onClose,
  onSuccess,
  webhook,
}: WebhookModalProps) {
  const { t } = useTranslation();

  const { hasEnoughPermissions, getAccessTokenSilently } = useProfile({
    shouldBeManager: true,
    roles: [MycRole.SystemManager],
    permissions: [MycPermission.Read, MycPermission.Write],
  });

  const [secretType, setSecretType] = useState<Secret>(
    webhook?.secret ? Secret.AuthorizationHeader : Secret.Nothing
  );

  const [togglePassword, setTogglePassword] = useState(
    webhook?.secret ? true : false
  );

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
      name: webhook?.name ?? "",
      description: webhook?.description ?? "",
      url: webhook?.url ?? "",
      trigger: webhook?.trigger ?? "subscriptionAccount.created",
      secret: webhook?.secret ?? null,
    },
  });

  const nameWatch = watch("name");
  const descriptionWatch = watch("description");
  const urlWatch = watch("url");
  const triggerWatch = watch("trigger");

  const handleClose = () => {
    reset();
    onClose();
    setSecretType(Secret.Nothing);
  };

  const handleLocalSuccess = () => {
    reset();
    onSuccess();
  };

  const cleanSecret = (secret: WebHook["secret"] | undefined) => {
    if (!secret) {
      return null;
    }

    if (secretType === Secret.Nothing) {
      return null;
    }

    if (
      secretType === Secret.AuthorizationHeader &&
      secret &&
      "authorizationHeader" in secret
    ) {
      const authorizationHeader = secret?.authorizationHeader;

      if (!authorizationHeader) {
        return null;
      }

      const { headerName, prefix, token } = authorizationHeader;
      const initialAuthorizationHeader: any = {};

      if (headerName && headerName !== "") {
        initialAuthorizationHeader.headerName = headerName;
      }

      if (prefix && prefix !== "") {
        initialAuthorizationHeader.prefix = prefix;
      }

      if (token && token !== "" && token !== "REDACTED") {
        initialAuthorizationHeader.token = token;
      }

      return {
        authorizationHeader: initialAuthorizationHeader,
      };
    }

    if (
      secretType === Secret.QueryParam &&
      secret &&
      "queryParameter" in secret
    ) {
      const queryParameter = secret?.queryParameter;

      if (!queryParameter) {
        return null;
      }

      const { name, token } = queryParameter;
      const initialQueryParameter: any = {};

      if (name && name !== "") {
        initialQueryParameter.name = name;
      }

      if (token && token !== "" && token !== "REDACTED") {
        initialQueryParameter.token = token;
      }

      return {
        queryParameter: initialQueryParameter,
      };
    }

    return null;
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const cleanData = {
      name: data.name,
      description: data.description,
      url: webhook ? webhook.url : data.url,
      trigger: webhook ? webhook.trigger : data.trigger,
      secret: cleanSecret(data.secret),
    };

    setIsLoading(true);

    const token = await getAccessTokenSilently();

    const response = await fetch(
      buildPath(
        webhook
          ? "/_adm/system-manager/webhooks/{webhook_id}"
          : "/_adm/system-manager/webhooks",
        {
          path: {
            webhook_id: webhook?.id ?? "",
          },
        }
      ),
      {
        method: webhook ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanData),
      }
    );

    if (!response.ok) {
      parseHttpError(response);
    }

    handleLocalSuccess();
    setIsLoading(false);
  };

  if (!hasEnoughPermissions) {
    return null;
  }

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={handleClose}>
        <Typography>
          {webhook
            ? t("screens.Dashboard.Webhooks.WebhookModal.titleExistingWebhook")
            : t("screens.Dashboard.Webhooks.WebhookModal.title")}
        </Typography>
      </Modal.Header>

      <Modal.Body>
        <form
          className="flex flex-col gap-2 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormField
            label={t(
              "screens.Dashboard.Webhooks.WebhookModal.formFields.name.label"
            )}
            title={t(
              "screens.Dashboard.Webhooks.WebhookModal.formFields.name.title"
            )}
          >
            <TextInput
              className="my-2"
              placeholder={t(
                "screens.Dashboard.Webhooks.WebhookModal.formFields.name.placeholder"
              )}
              sizing="lg"
              color="custom"
              autoFocus
              required
              theme={textInputTheme}
              {...register("name")}
            />
            {errors.name && <span>This field is required</span>}
          </FormField>

          <FormField
            label={t(
              "screens.Dashboard.Webhooks.WebhookModal.formFields.description.label"
            )}
            title={t(
              "screens.Dashboard.Webhooks.WebhookModal.formFields.description.title"
            )}
          >
            <Textarea
              className="my-2 h-24 p-4"
              placeholder={t(
                "screens.Dashboard.Webhooks.WebhookModal.formFields.description.placeholder"
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
              "screens.Dashboard.Webhooks.WebhookModal.formFields.url.label"
            )}
            title={t(
              "screens.Dashboard.Webhooks.WebhookModal.formFields.url.title"
            )}
          >
            <TextInput
              id="url"
              className="my-2"
              placeholder={t(
                "screens.Dashboard.Webhooks.WebhookModal.formFields.url.placeholder"
              )}
              sizing="lg"
              color="custom"
              autoFocus
              required
              disabled={!!webhook}
              theme={textInputTheme}
              {...register("url")}
            />
            {errors.url && <span>This field is required</span>}
          </FormField>

          <FormField
            label={t(
              "screens.Dashboard.Webhooks.WebhookModal.formFields.trigger.label"
            )}
            title={t(
              "screens.Dashboard.Webhooks.WebhookModal.formFields.trigger.title"
            )}
          >
            <Select
              id="trigger"
              sizing="lg"
              disabled={!!webhook}
              required
              defaultValue={undefined}
              title={
                webhook
                  ? t(
                      "screens.Dashboard.GuestRoles.GuestRolesModal.form.permission.titleReadOnly"
                    )
                  : t(
                      "screens.Dashboard.GuestRoles.GuestRolesModal.form.permission.titleWrite"
                    )
              }
              {...register("trigger")}
            >
              {triggers?.map((trigger, index) => (
                <option
                  key={index}
                  value={trigger}
                  selected={trigger === triggerWatch}
                >
                  {t(
                    `screens.Dashboard.Webhooks.WebhookModal.formFields.trigger.options.${trigger}`
                  )}
                </option>
              ))}
            </Select>
            {errors.trigger && <span>This field is required</span>}
          </FormField>

          <FormField
            label={t(
              "screens.Dashboard.Webhooks.WebhookModal.formFields.secret.label"
            )}
            title={t(
              "screens.Dashboard.Webhooks.WebhookModal.formFields.secret.title"
            )}
          >
            <Select
              sizing="lg"
              defaultValue={undefined}
              onChange={(e) => setSecretType(e.target.value as Secret)}
            >
              {Object.values(Secret).map((secret, index) => (
                <option
                  key={index}
                  value={secret}
                  selected={secret === secretType}
                >
                  {t(
                    `screens.Dashboard.Webhooks.WebhookModal.formFields.secret.options.${secret}.title`
                  )}
                </option>
              ))}
            </Select>
          </FormField>

          <section>
            {secretType === Secret.AuthorizationHeader && (
              <>
                <FormField
                  label={t(
                    "screens.Dashboard.Webhooks.WebhookModal.formFields.secret.options.authorizationHeader.headerName.label"
                  )}
                >
                  <TextInput
                    id="authorizationHeaderHeaderName"
                    className="my-2"
                    placeholder={t(
                      "screens.Dashboard.Webhooks.WebhookModal.formFields.secret.options.authorizationHeader.headerName.placeholder"
                    )}
                    sizing="lg"
                    color="custom"
                    autoFocus
                    theme={textInputTheme}
                    {...register("secret.authorizationHeader.headerName")}
                  />
                </FormField>

                <FormField
                  label={t(
                    "screens.Dashboard.Webhooks.WebhookModal.formFields.secret.options.authorizationHeader.prefix.label"
                  )}
                >
                  <TextInput
                    id="authorizationHeaderPrefix"
                    className="my-2"
                    placeholder={t(
                      "screens.Dashboard.Webhooks.WebhookModal.formFields.secret.options.authorizationHeader.prefix.placeholder"
                    )}
                    sizing="lg"
                    color="custom"
                    theme={textInputTheme}
                    {...register("secret.authorizationHeader.prefix")}
                  />
                </FormField>

                <FormField
                  label={t(
                    "screens.Dashboard.Webhooks.WebhookModal.formFields.secret.options.authorizationHeader.token.label"
                  )}
                >
                  <TextInput
                    id="authorizationHeaderToken"
                    className="my-2"
                    placeholder={t(
                      "screens.Dashboard.Webhooks.WebhookModal.formFields.secret.options.authorizationHeader.token.placeholder"
                    )}
                    required={secretType === Secret.AuthorizationHeader}
                    type={togglePassword ? "text" : "password"}
                    rightIcon={() => (
                      <Button
                        intent="link"
                        rounded
                        onClick={() => setTogglePassword(!togglePassword)}
                      >
                        {togglePassword ? <FaEye /> : <FaEyeSlash />}
                      </Button>
                    )}
                    sizing="lg"
                    color="custom"
                    theme={textInputTheme}
                    {...register("secret.authorizationHeader.token")}
                  />
                </FormField>
              </>
            )}

            {secretType === Secret.QueryParam && (
              <>
                <FormField
                  label={t(
                    "screens.Dashboard.Webhooks.WebhookModal.formFields.secret.options.queryParam.name.label"
                  )}
                >
                  <TextInput
                    id="queryParamName"
                    className="my-2"
                    placeholder={t(
                      "screens.Dashboard.Webhooks.WebhookModal.formFields.secret.options.queryParam.name.placeholder"
                    )}
                    required={secretType === Secret.QueryParam}
                    sizing="lg"
                    color="custom"
                    theme={textInputTheme}
                    {...register("secret.queryParameter.name")}
                  />
                </FormField>

                <FormField
                  label={t(
                    "screens.Dashboard.Webhooks.WebhookModal.formFields.secret.options.queryParam.token.label"
                  )}
                >
                  <TextInput
                    id="queryParamToken"
                    className="my-2"
                    placeholder={t(
                      "screens.Dashboard.Webhooks.WebhookModal.formFields.secret.options.queryParam.token.placeholder"
                    )}
                    required={secretType === Secret.QueryParam}
                    type={togglePassword ? "text" : "password"}
                    rightIcon={() => (
                      <Button
                        intent="link"
                        rounded
                        onClick={() => setTogglePassword(!togglePassword)}
                      >
                        {togglePassword ? <FaEye /> : <FaEyeSlash />}
                      </Button>
                    )}
                    sizing="lg"
                    color="custom"
                    theme={textInputTheme}
                    {...register("secret.queryParameter.token")}
                  />
                </FormField>
              </>
            )}
          </section>

          <Button
            rounded
            type="submit"
            disabled={
              !nameWatch ||
              !descriptionWatch ||
              !urlWatch ||
              !triggerWatch ||
              isLoading
            }
          >
            {webhook
              ? isLoading
                ? t(
                    "screens.Dashboard.Webhooks.WebhookModal.formFields.updating"
                  )
                : t("screens.Dashboard.Webhooks.WebhookModal.formFields.update")
              : isLoading
              ? t("screens.Dashboard.Webhooks.WebhookModal.formFields.creating")
              : t("screens.Dashboard.Webhooks.WebhookModal.formFields.create")}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
}
