import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import { setNotification } from "@/states/notification.state";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { errorMessage, PREFIX } from "./shared";

interface Props {
  title: string;
  description: string;
  confirmLabel: string;
  intent?: "danger" | "warning" | "primary";
  onConfirm: () => Promise<unknown>;
  onClose: () => void;
  onDone: () => void;
}

/**
 * Confirms a federation operation. A gateway refusal stays visible in the
 * modal (and as a notification) instead of closing it.
 */
export default function ConfirmModal({
  title,
  description,
  confirmLabel,
  intent = "danger",
  onConfirm,
  onClose,
  onDone,
}: Props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onConfirm();
      dispatch(
        setNotification({ type: "success", notification: t(`${PREFIX}.done`) })
      );
      onDone();
    } catch (err) {
      const message = errorMessage(err);
      setError(message);
      dispatch(setNotification({ type: "error", notification: message }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open handleClose={onClose}>
      <Modal.Header handleClose={onClose}>
        <Typography as="h2">{title}</Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-3 w-full">
          <Typography as="p">{description}</Typography>

          {error && (
            <Typography as="small" isError>
              {error}
            </Typography>
          )}

          <div className="flex gap-2">
            <Button
              intent="secondary"
              onClick={onClose}
              disabled={isLoading}
              fullWidth
            >
              {t(`${PREFIX}.cancel`)}
            </Button>
            <Button
              intent={intent}
              onClick={handleConfirm}
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? t(`${PREFIX}.working`) : confirmLabel}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
