import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FomField";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import useSuspenseError from "@/hooks/use-suspense-error";
import { buildPath } from "@/services/openapi/mycelium-api";
import { Select, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaCopy } from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenantId?: string | null;
}

type Inputs = {
  expiration: number;
};

enum Expiration {
  oneHour = 60 * 60,
  oneDay = 24 * 60 * 60,
  oneWeek = 7 * 24 * 60 * 60,
  oneMonth = 30 * 24 * 60 * 60,
  sixMonths = 180 * 24 * 60 * 60,
  oneYear = 365 * 24 * 60 * 60,
}

export default function CreateConnectionStringModal({
  isOpen,
  onClose,
  tenantId,
}: Props) {
  const { t } = useTranslation();

  const { parseHttpError, dispatchWarning } = useSuspenseError();

  const { getAccessTokenSilently } = useProfile();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [connectionString, setConnectionString] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      expiration: Expiration.sixMonths,
    },
  });

  const expirationWatcher = watch("expiration");

  const handleClose = () => {
    setConnectionString(null);
    reset();
    onClose();
  };

  const onSubmit: SubmitHandler<Inputs> = async ({ expiration }) => {
    setIsSubmitting(true);

    if (!expiration) {
      dispatchWarning("Expiration is required");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = await getAccessTokenSilently();

      if (!token) {
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(buildPath("/adm/rs/beginners/tokens"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expiration: Expiration[expiration],
          tenantId,
        }),
      });

      if (!response.ok) {
        parseHttpError(response);
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();

      setConnectionString(data.connectionString);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ExpirationOptions: (keyof typeof Expiration)[] = [
    "oneHour",
    "oneDay",
    "oneWeek",
    "oneMonth",
    "sixMonths",
    "oneYear",
  ];

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={handleClose}>
        <Typography>
          {t("screens.Dashboard.CreateConnectionStringModal.title")}
        </Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-4 w-full">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 w-full"
          >
            <div>
              <FormField
                label={t(
                  "screens.Dashboard.CreateConnectionStringModal.form.expiration.label"
                )}
                title={t(
                  "screens.Dashboard.CreateConnectionStringModal.form.expiration.title"
                )}
                width="full"
              >
                <Select
                  id="expiration"
                  sizing="lg"
                  {...register("expiration")}
                  value={Expiration[expirationWatcher]}
                >
                  {ExpirationOptions.map((expiration) => {
                    return (
                      <option key={expiration} value={expiration}>
                        {t(
                          `screens.Dashboard.CreateConnectionStringModal.form.expiration.options.${expiration}`
                        )}
                      </option>
                    );
                  })}
                </Select>

                {errors.expiration && <span>This field is required</span>}
              </FormField>
            </div>

            <Button
              type="submit"
              rounded
              fullWidth
              disabled={
                isSubmitting ||
                connectionString !== null ||
                expirationWatcher === null ||
                errors.expiration !== undefined
              }
            >
              {isSubmitting ? (
                <Spinner />
              ) : (
                t(
                  "screens.Dashboard.CreateConnectionStringModal.form.create.label"
                )
              )}
            </Button>
          </form>

          {connectionString && (
            <div className="flex flex-col gap-2">
              <TextInput value={connectionString} disabled />

              <Button
                intent="warning"
                rounded
                fullWidth
                onClick={() => {
                  navigator.clipboard.writeText(connectionString);
                }}
              >
                {t(
                  "screens.Dashboard.CreateConnectionStringModal.form.copy.label"
                )}
                <FaCopy className="inline-block ml-2" />
              </Button>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}
