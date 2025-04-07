import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

type TenantMetaKey = components["schemas"]["TenantMetaKey"];

type Inputs = {
  key: TenantMetaKey;
  value: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenantId: string;
  editMetadataKey?: TenantMetaKey | null;
  editMetadataValue?: string | null;
}

export default function EditMetadataModal({ isOpen, onClose, editMetadataKey }: Props) {
  const { hasEnoughPermissions } = useProfile({
    shouldBeManager: true,
  });

  const { } = useForm<Inputs>();

  const key = useMemo(() => {
    if (!editMetadataKey) return null;

    return editMetadataKey;
  }, [editMetadataKey]);

  if (!hasEnoughPermissions) {
    return null;
  }

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography>Edit metadata</Typography>
      </Modal.Header>

      <Modal.Body>
        {key?.toString()}
      </Modal.Body>
    </Modal>
  );
}
