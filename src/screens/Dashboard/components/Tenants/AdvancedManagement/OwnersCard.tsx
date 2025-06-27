import { FaRegTrashAlt } from "react-icons/fa";
import { GoGear } from "react-icons/go";
import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import IntroSection from "@/components/ui/IntroSection";
import MiniBox from "@/components/ui/MiniBox";
import { components } from "@/services/openapi/mycelium-schema";
import GuestOwnerModal from "./GuestOwnerModal";
import UnguestOwner from "./UnguestOwnerModal";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import useProfile from "@/hooks/use-profile";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";
import { useTranslation } from "react-i18next";

type TenantOwner = components["schemas"]["Owner"];
type Tenant = components["schemas"]["Tenant"];

interface Props {
  tenant: Tenant;
  mutateTenantStatus: () => void;
}

export default function OwnersCard({ tenant, mutateTenantStatus }: Props) {
  const { t } = useTranslation();

  const [isGuestOwnerModalOpen, setIsGuestOwnerModalOpen] = useState(false);
  const [isUnguestOwnerModalOpen, setIsUnguestOwnerModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<TenantOwner | null>(null);

  const { hasEnoughPermissions } = useProfile({
    tenantOwnerNeeded: [tenant.id ?? ""],
    roles: [MycRole.TenantManager],
    permissions: [MycPermission.Read],
    restrictSystemAccount: true,
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
    setSelectedOwner(owner);
    setIsUnguestOwnerModalOpen(true);
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
      <Card padding="sm" width="full" group>
        <Card.Header>
          <div className="flex flex-col gap-2">
            <Typography as="h6">
              <div className="flex items-center gap-2">
                <span>
                  {t(
                    "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.owners.title"
                  )}
                </span>
                <GoGear
                  title="Register tenant owner"
                  className="cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 text-indigo-500 dark:text-lime-400"
                  onClick={() => setIsGuestOwnerModalOpen(true)}
                />
              </div>
            </Typography>

            <Typography as="small" decoration="smooth" width="sm">
              {t(
                "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.owners.description"
              )}
            </Typography>
          </div>
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
                      title={t(
                        "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.owners.name.title"
                      )}
                      as="h3"
                    >
                      <IntroSection.Item
                        title={t(
                          "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.owners.email.title"
                        )}
                      >
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

                    <div className="cursor-pointer opacity-100 sm:opacity-0 sm:group-hover/item:opacity-100 transition-opacity duration-300">
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

      <GuestOwnerModal
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
