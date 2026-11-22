import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FomField";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";
import {
  peersRoles,
  translationsCreate,
} from "@/services/rpc/federation";
import { setNotification } from "@/states/notification.state";
import { Select, TextInput } from "flowbite-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import useSWR from "swr";
import GuestRoleSelector from "../GuestRoleSelector";
import {
  errorMessage,
  PREFIX,
  useFederationOperator,
  usePeers,
} from "./shared";

type GuestRole = components["schemas"]["GuestRole"];
type Permission = components["schemas"]["Permission"];

const FORM = `${PREFIX}.Translations.CreateRule`;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const inputColors =
  "border-brand-600 bg-brand-violet-50 text-zinc-900 focus:border-infra-400 focus:ring-zinc-500 dark:bg-surface-950 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 dark:focus:border-brand-violet-500 dark:focus:ring-brand-violet-500";

const textInputTheme = { field: { input: { colors: { custom: inputColors } } } };
const selectTheme = { field: { select: { colors: { custom: inputColors } } } };

type Inputs = {
  peerInstanceId: string;
  issuerRole: string;
  issuerTenantId: string;
  issuerMinPerm: Permission;
  localAccountId: string;
  localPerm: Permission;
};

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTranslationRuleModal({
  onClose,
  onSuccess,
}: Props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { canFetch, getToken } = useFederationOperator();
  const peers = usePeers();

  const [localRole, setLocalRole] = useState<GuestRole | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      peerInstanceId: "",
      issuerRole: "",
      issuerTenantId: "",
      issuerMinPerm: "read",
      localAccountId: "",
      localPerm: "read",
    },
  });

  const peerInstanceId = watch("peerInstanceId");

  const vocabulary = useSWR(
    canFetch && peerInstanceId
      ? ["rpc", "federation.peers.roles", peerInstanceId]
      : null,
    () => peersRoles({ instanceId: peerInstanceId }, getToken),
    // Each read is a signed request to the remote peer: fetch once per peer
    // pick, never poll (a refresh could also swap the input mid-typing).
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
    }
  );

  const verifiedRoles =
    vocabulary.data?.outcome === "verified" ? vocabulary.data.roles : [];

  const onSubmit: SubmitHandler<Inputs> = async (inputs) => {
    if (!localRole?.id) {
      setSubmitError(t(`${FORM}.localRoleRequired`));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await translationsCreate(
        {
          ...inputs,
          issuerRole: inputs.issuerRole.trim(),
          issuerTenantId: inputs.issuerTenantId.trim(),
          localAccountId: inputs.localAccountId.trim(),
          localGuestRoleId: localRole.id,
        },
        getToken
      );
      dispatch(
        setNotification({ type: "success", notification: t(`${FORM}.created`) })
      );
      onSuccess();
    } catch (err) {
      const message = errorMessage(err);
      setSubmitError(message);
      dispatch(setNotification({ type: "error", notification: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const uuidRule = {
    required: t(`${FORM}.required`),
    validate: (value: string) =>
      UUID_PATTERN.test(value.trim()) || t(`${FORM}.invalidUuid`),
  };

  const permissionOptions = (["read", "write"] as const).map((perm) => (
    <option key={perm} value={perm}>
      {t(`${PREFIX}.permissions.${perm}`)}
    </option>
  ));

  return (
    <Modal open handleClose={onClose}>
      <Modal.Header handleClose={onClose}>
        <Typography as="h2">{t(`${FORM}.title`)}</Typography>
      </Modal.Header>

      <Modal.Body>
        {/* No <form> wrapper: GuestRoleSelector renders its own search form,
            and forms cannot nest. */}
        <div className="flex flex-col gap-1 w-full">
          <Typography as="small" decoration="smooth">
            {t(`${FORM}.description`)}
          </Typography>

          <FormField label={t(`${FORM}.peer`)} id="rule-peer">
            <Select
              id="rule-peer"
              color="custom"
              sizing="sm"
              theme={selectTheme}
              {...register("peerInstanceId", {
                required: t(`${FORM}.required`),
                onChange: () => setValue("issuerRole", ""),
              })}
            >
              <option value="">{t(`${FORM}.choosePeer`)}</option>
              {peers.data?.map((peer) => (
                <option key={peer.instanceId} value={peer.instanceId}>
                  {peer.displayName || peer.baseUrl}
                </option>
              ))}
            </Select>
            <FieldError message={errors.peerInstanceId?.message} />
          </FormField>

          {peerInstanceId && (
            <FormField
              label={t(`${FORM}.issuerRole`)}
              title={t(`${FORM}.issuerRoleHint`)}
              id="rule-issuer-role"
            >
              {vocabulary.isLoading && (
                <Typography as="small" decoration="smooth">
                  {t(`${FORM}.loadingRoles`)}
                </Typography>
              )}

              {vocabulary.error && (
                <Typography as="small" isError>
                  {t(`${FORM}.rolesError`, {
                    reason: errorMessage(vocabulary.error),
                  })}
                </Typography>
              )}

              {vocabulary.data?.outcome === "unknown" && (
                <Typography as="small" decoration="smooth">
                  {t(`${FORM}.rolesUnknown`)}
                </Typography>
              )}

              {vocabulary.data?.outcome === "rejected" && (
                <Typography as="small" isError>
                  {t(`${FORM}.rolesRejected`, {
                    reason: vocabulary.data.reason,
                  })}
                </Typography>
              )}

              {verifiedRoles.length > 0 ? (
                <Select
                  id="rule-issuer-role"
                  color="custom"
                  sizing="sm"
                  theme={selectTheme}
                  {...register("issuerRole", {
                    required: t(`${FORM}.required`),
                  })}
                >
                  <option value="">{t(`${FORM}.chooseRole`)}</option>
                  {verifiedRoles.map((role) => (
                    <option
                      key={`${role.slug}-${role.permission}`}
                      value={role.slug}
                    >
                      {`${role.name} (${role.slug}, ${t(
                        `${PREFIX}.permissions.${role.permission}`
                      )})`}
                    </option>
                  ))}
                </Select>
              ) : (
                !vocabulary.isLoading && (
                  <TextInput
                    id="rule-issuer-role"
                    color="custom"
                    sizing="sm"
                    theme={textInputTheme}
                    placeholder={t(`${FORM}.issuerRolePlaceholder`)}
                    autoComplete="off"
                    {...register("issuerRole", {
                      required: t(`${FORM}.required`),
                      validate: (value) =>
                        value.trim() !== "" || t(`${FORM}.required`),
                    })}
                  />
                )
              )}
              <FieldError message={errors.issuerRole?.message} />
            </FormField>
          )}

          <FormField label={t(`${FORM}.issuerTenant`)} id="rule-issuer-tenant">
            <TextInput
              id="rule-issuer-tenant"
              color="custom"
              sizing="sm"
              theme={textInputTheme}
              placeholder="00000000-0000-0000-0000-000000000000"
              autoComplete="off"
              {...register("issuerTenantId", uuidRule)}
            />
            <FieldError message={errors.issuerTenantId?.message} />
          </FormField>

          <FormField label={t(`${FORM}.issuerMinPerm`)} id="rule-issuer-perm">
            <Select
              id="rule-issuer-perm"
              color="custom"
              sizing="sm"
              theme={selectTheme}
              {...register("issuerMinPerm")}
            >
              {permissionOptions}
            </Select>
          </FormField>

          <FormField
            label={t(`${FORM}.localAccount`)}
            title={t(`${FORM}.localAccountHint`)}
            id="rule-local-account"
          >
            <TextInput
              id="rule-local-account"
              color="custom"
              sizing="sm"
              theme={textInputTheme}
              placeholder="00000000-0000-0000-0000-000000000000"
              autoComplete="off"
              {...register("localAccountId", uuidRule)}
            />
            <FieldError message={errors.localAccountId?.message} />
          </FormField>

          <GuestRoleSelector
            label={t(`${FORM}.localRole`)}
            selectedRole={localRole}
            setSelectedRole={setLocalRole}
            shouldBeSystemRole={false}
            tenantId={null}
          />

          <FormField label={t(`${FORM}.localPerm`)} id="rule-local-perm">
            <Select
              id="rule-local-perm"
              color="custom"
              sizing="sm"
              theme={selectTheme}
              {...register("localPerm")}
            >
              {permissionOptions}
            </Select>
          </FormField>

          {submitError && (
            <Typography as="small" isError data-testid="rule-submit-error">
              {submitError}
            </Typography>
          )}

          <div className="flex gap-2 mt-2">
            <Button
              intent="secondary"
              onClick={onClose}
              disabled={isSubmitting}
              fullWidth
            >
              {t(`${PREFIX}.cancel`)}
            </Button>
            <Button
              intent="primary"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              fullWidth
            >
              {isSubmitting ? t(`${PREFIX}.working`) : t(`${FORM}.submit`)}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <Typography as="small" isError>
      {message}
    </Typography>
  );
}
