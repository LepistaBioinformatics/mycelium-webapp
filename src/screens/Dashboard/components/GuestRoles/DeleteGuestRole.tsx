"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import useSuspenseError from "@/hooks/use-suspense-error";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";

type GuestRole = components["schemas"]["GuestRole"];

interface Props {
  guestRole: GuestRole;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteGuestRole({ guestRole, isOpen, onClose }: Props) {
  const { getAccessTokenSilently } = useAuth0();

  const [isLoading, setIsLoading] = useState(false);

  const { parseHttpError } = useSuspenseError();

  const handleDelete = async () => {
    setIsLoading(true);

    const token = await getAccessTokenSilently();

    if (!guestRole.id) return;

    await fetch(
      buildPath(
        "/adm/rs/guests-manager/guest-roles/{guest_role_id}",
        { path: { guest_role_id: guestRole.id } }
      ),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(parseHttpError)
      .then(onClose)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }

  return (
    <Modal open={isOpen} >
      <Modal.Header handleClose={onClose}>
        <Typography as="h2">Delete Guest Role</Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-2 w-full">
          <Typography as="p">
            Are you sure you want to delete this guest role?
          </Typography>

          <div>
            <Button
              intent="danger"
              onClick={handleDelete}
              disabled={isLoading}
              rounded
              fullWidth
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}
