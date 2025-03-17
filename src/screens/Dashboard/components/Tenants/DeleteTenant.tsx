"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import useSuspenseError from "@/hooks/use-suspense-error";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";

type Tenant = components["schemas"]["Tenant"];

interface Props {
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteTenant({ tenant, isOpen, onClose }: Props) {
  const { getAccessTokenSilently } = useAuth0();

  const { parseHttpError } = useSuspenseError();

  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    const token = await getAccessTokenSilently();

    if (!tenant.id) return;

    await fetch(
      buildPath(
        "/adm/su/managers/tenants/{id}",
        { path: { id: tenant.id } }
      ),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(parseHttpError)
      .catch(console.error)
      .finally(() => {
        setIsLoading(false);
        onClose();
      });
  }

  return (
    <Modal open={isOpen} >
      <Modal.Header handleClose={onClose}>
        <Typography as="h2">Delete Tenant</Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-2 w-full">
          <Typography as="p">
            Are you sure you want to delete this tenant?
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
