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
import { guestRolesInsertRoleChild } from "@/services/rpc/guestManager";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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

      try {
        await guestRolesInsertRoleChild(
          { guestRoleId: parentRole.id, childId: childRole.id },
          getAccessTokenSilently
        );
        onSuccess();
      } catch (err) {
        parseHttpError(err as Response);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isAuthenticated,
      hasEnoughPermissions,
      parentRole.id,
      getAccessTokenSilently,
      onSuccess,
      parseHttpError,
    ]
  );

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography>
          {t("screens.Dashboard.GuestRoles.RegisterGuestRoleChild.title")}
        </Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-4 w-full my-5">
          <GuestRoleSelector
            label={t(
              "screens.Dashboard.GuestRoles.RegisterGuestRoleChild.label"
            )}
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
                {t(
                  "screens.Dashboard.GuestRoles.RegisterGuestRoleChild.button"
                )}
              </Button>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}
