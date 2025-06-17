import { FaRegTrashAlt } from "react-icons/fa";
import { GoGear } from "react-icons/go";
import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import IntroSection from "@/components/ui/IntroSection";
import MiniBox from "@/components/ui/MiniBox";
import { components } from "@/services/openapi/mycelium-schema";
import GuestOwner from "../GuestOwnerModal";
import UnguestOwner from "../UnguestOwnerModal";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import useProfile from "@/hooks/use-profile";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";

type TenantOwner = components["schemas"]["Owner"];
type Tenant = components["schemas"]["Tenant"];

interface Props {
  tenant: Tenant;
  mutateTenantStatus: () => void;
}

export default function OwnersCard({ tenant, mutateTenantStatus }: Props) {
  const [isGuestOwnerModalOpen, setIsGuestOwnerModalOpen] = useState(false);
  const [isUnguestOwnerModalOpen, setIsUnguestOwnerModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<TenantOwner | null>(null);

  const { hasEnoughPermissions } = useProfile({
    roles: [MycRole.TenantManager],
    permissions: [MycPermission.Write],
  });

  const handleGuestOwnerModalClose = () => {
    setIsGuestOwnerModalOpen(false);
  };

  const handleGuestOwnerModalSuccess = () => {
    setIsGuestOwnerModalOpen(false);
    mutateTenantStatus();
  };

  const handleUnguestOwnerModalSuccess = () => {
    setIsUnguestOwnerModalOpen(false);
    mutateTenantStatus();
  };

  const handleUnguestOwnerModalOpen = (owner: TenantOwner) => {
    setIsUnguestOwnerModalOpen(true);
    setSelectedOwner(owner);
  };

  const handleUnguestOwnerModalClose = () => {
    setIsUnguestOwnerModalOpen(false);
    setSelectedOwner(null);
  };

  const owners = useMemo(() => {
    if (!tenant) return null;

    if ("owners" in tenant) {
      if ("records" in tenant.owners) {
        return tenant.owners.records;
      }
    }

    return null;
  }, [tenant]);

  if (!hasEnoughPermissions) {
    return null;
  }

  return (
    <>
      <Card padding="sm" width="2xl" flex1 group>
        <Card.Header>
          <Typography as="h6" decoration="smooth">
            <div className="flex items-center gap-2 group">
              <span>Owners</span>
              <GoGear
                title="Register tenant owner"
                className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-500 dark:text-lime-500"
                onClick={() => setIsGuestOwnerModalOpen(true)}
              />
            </div>
          </Typography>
        </Card.Header>

        <Card.Body>
          <div className="flex flex-col gap-2">
            {owners?.map((owner) => {
              const ownerName =
                owner.firstName && owner.lastName
                  ? `${owner.firstName} ${owner.lastName}`
                  : owner.username;

              return (
                <MiniBox key={owner.id}>
                  <div className="flex items-center gap-2 justify-between group/item group/clip min-w-fit">
                    <IntroSection
                      content={ownerName}
                      title="Owner name"
                      as="h3"
                    >
                      <IntroSection.Item prefix="email" title="Email">
                        <div className="flex items-center gap-2">
                          <span>{owner.email}</span>
                          <CopyToClipboard
                            text={owner.email}
                            size="sm"
                            inline
                            groupHidden
                          />
                        </div>
                      </IntroSection.Item>
                    </IntroSection>

                    <div className="cursor-pointer opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                      <button
                        className="text-red-500"
                        onClick={() => handleUnguestOwnerModalOpen(owner)}
                      >
                        <FaRegTrashAlt />
                      </button>
                    </div>
                  </div>
                </MiniBox>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      <GuestOwner
        isOpen={isGuestOwnerModalOpen}
        onClose={handleGuestOwnerModalClose}
        onSuccess={handleGuestOwnerModalSuccess}
        tenant={tenant}
      />

      {selectedOwner && (
        <UnguestOwner
          isOpen={isUnguestOwnerModalOpen}
          owner={selectedOwner}
          onClose={handleUnguestOwnerModalClose}
          onSuccess={handleUnguestOwnerModalSuccess}
          tenant={tenant}
        />
      )}
    </>
  );
}
