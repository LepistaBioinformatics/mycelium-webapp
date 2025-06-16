"use client";

import { components } from "@/services/openapi/mycelium-schema";
import GuestRolesModal, { GuestRolesModalProps } from "./GuestRolesModal";

type GuestRole = components["schemas"]["GuestRole"];

interface Props extends GuestRolesModalProps {
  guestRole: GuestRole;
}

export default function EditGuestRoleModal({
  isOpen,
  onClose,
  onSuccess,
  guestRole
}: Props) {
  return (
    <GuestRolesModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      guestRole={guestRole}
    />
  )
}
