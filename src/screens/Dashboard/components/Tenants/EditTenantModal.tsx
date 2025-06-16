"use client";

import TenantModal, { TenantModalProps } from "./TenantModal";
import { components } from "@/services/openapi/mycelium-schema";

type Tenant = components["schemas"]["Tenant"];

interface Props extends TenantModalProps {
  tenant: Tenant;
}

export default function EditTenantModal({
  isOpen,
  onClose,
  onSuccess,
  tenant
}: Props) {
  return (
    <TenantModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      tenant={tenant}
    />
  )
}
