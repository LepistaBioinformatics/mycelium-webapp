import { useCallback, useState } from "react";
import GuestRoleSelector from "../GuestRoleSelector";
import { components } from "@/services/openapi/mycelium-schema";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import useProfile from "@/hooks/use-profile";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";
import useSuspenseError from "@/hooks/use-suspense-error";
import { buildPath } from "@/services/openapi/mycelium-api";

type GuestRole = components["schemas"]["GuestRole"];

interface Props {
  parentRole: GuestRole;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegisterGuestRoleChild({
  parentRole,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [selectedRole, setSelectedRole] = useState<GuestRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isAuthenticated, hasEnoughPermissions, getAccessTokenSilently } =
    useProfile({
      roles: [MycRole.GuestsManager],
      permissions: [MycPermission.Write],
    });

  const { parseHttpError } = useSuspenseError();

  const registerChild = useCallback(
    async (childRole: GuestRole) => {
      setIsSubmitting(true);

      if (!isAuthenticated || !hasEnoughPermissions) {
        setIsSubmitting(false);
        return;
      }

      if (!parentRole.id || !childRole.id) {
        setIsSubmitting(false);
        return;
      }

      const accessToken = await getAccessTokenSilently();

      if (!accessToken) {
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(
        buildPath(
          "/adm/rs/guests-manager/guest-roles/{guest_role_id}/children/{child_id}",
          { path: { guest_role_id: parentRole.id, child_id: childRole.id } }
        ),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        parseHttpError(response);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onSuccess();
    },
    [
      getAccessTokenSilently,
      isAuthenticated,
      hasEnoughPermissions,
      onSuccess,
      parentRole.id,
      selectedRole?.id,
    ]
  );

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography>Register guest role child</Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-4 w-full my-5">
          <GuestRoleSelector
            label="Select a guest role to register as a child"
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            shouldBeSystemRole={parentRole.system}
            ignoreList={[parentRole.id] as string[]}
            parentRole={parentRole}
          />

          {selectedRole && (
            <div>
              <Button
                rounded
                fullWidth
                disabled={isSubmitting}
                onClick={() => registerChild(selectedRole)}
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}
