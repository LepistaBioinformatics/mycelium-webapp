import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import useSuspenseError from "@/hooks/use-suspense-error";
import { useState } from "react";
import { buildPath } from "@/services/openapi/mycelium-api";
import { TENANT_ID_HEADER } from "@/constants/http-headers";
import Button from "@/components/ui/Button";
import IntroSection from "@/components/ui/IntroSection";
import Divider from "@/components/ui/Divider";

type Tenant = components["schemas"]["Tenant"];
type TenantOwner = components["schemas"]["Owner"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenant: Tenant | null;
  owner: TenantOwner;
}

export default function UnguestOwner({ isOpen, onClose, tenant, owner, onSuccess }: Props) {
  const { hasEnoughPermissions, getAccessTokenSilently } = useProfile({
    restrictSystemAccount: true,
    tenantOwnerNeeded: [tenant?.id ?? ""],
  });

  const { parseHttpError } = useSuspenseError();

  const [isLoading, setIsLoading] = useState(false);

  const handleUnguest = async () => {
    setIsLoading(true);

    if (!tenant?.id) {
      setIsLoading(false);
      return;
    }

    const token = await getAccessTokenSilently();

    await fetch(
      buildPath("/adm/rs/tenant-owner/owners"),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          [TENANT_ID_HEADER]: tenant.id,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: owner?.email,
        }),
      })
      .then(parseHttpError)
      .catch(console.error)
      .finally(() => {
        setIsLoading(false);
        onSuccess();
      });
  }

  if (!hasEnoughPermissions) {
    return null;
  }

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography as="h2">Unguest Owner</Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-2 w-full pt-5 px-1">
          <IntroSection
            content="Are you sure you want to unguest owner?"
            title="Unguest Owner"
            as="h3"
          >
            <Divider style="invisible" />

            <IntroSection.Item
              prefix="email"
              title="Email"
            >
              {owner.email}
            </IntroSection.Item>

            <IntroSection.Item
              prefix="tenant"
              title="Tenant"
            >
              {tenant?.name}
            </IntroSection.Item>
          </IntroSection>

          <div className="mt-12">
            <Button
              intent="danger"
              onClick={handleUnguest}
              disabled={isLoading}
              rounded
              fullWidth
            >
              {isLoading ? "Unguesting..." : "Yes, I want to unguest"}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}
