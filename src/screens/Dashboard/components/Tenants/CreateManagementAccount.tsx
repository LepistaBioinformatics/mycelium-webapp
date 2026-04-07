import Typography from "@/components/ui/Typography";
import { useCallback, useState } from "react";
import Modal from "@/components/ui/Modal";
import { useAuth0 } from "@auth0/auth0-react";
import Button from "@/components/ui/Button";
import useSuspenseError from "@/hooks/use-suspense-error";
import { accountsCreateManagementAccount } from "@/services/rpc/tenantOwner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string | null | undefined;
}

/**
 * Renders the create management account modal
 *
 * @param isOpen - Whether the modal is open
 * @param onClose - The function to call when the modal is closed
 * @returns The create management account modal
 */
export default function CreateManagementAccount({
  isOpen,
  onClose,
  tenantId,
}: Props) {
  const { getAccessTokenSilently } = useAuth0();

  const { parseHttpError } = useSuspenseError();

  const [isCreating, setIsCreating] = useState(false);

  const handleCreateManagementAccount = useCallback(async () => {
    if (!tenantId) return;

    setIsCreating(true);

    try {
      await accountsCreateManagementAccount(
        { tenantId },
        getAccessTokenSilently
      );
    } catch (err) {
      parseHttpError(err as Response);
    } finally {
      setIsCreating(false);
      onClose();
    }
  }, [tenantId, getAccessTokenSilently, onClose, parseHttpError]);

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography as="h2">Create management account</Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-12 p-5">
          <Typography as="span" decoration="smooth" width="sm">
            After creating a management account, you will be able to guest users
            to manage the tenant. This users should have special access to the
            tenant's resources.
          </Typography>

          <div className="flex justify-end">
            <Button
              rounded
              fullWidth
              intent="info"
              onClick={handleCreateManagementAccount}
              disabled={isCreating}
            >
              {isCreating
                ? "Setting up..."
                : "Click to set up management account"}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
