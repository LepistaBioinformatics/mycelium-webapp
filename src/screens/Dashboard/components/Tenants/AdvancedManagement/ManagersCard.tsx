import { GoGear } from "react-icons/go";
import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";
import AccountInvitations from "../../Accounts/AccountInvitations";
import UnInviteGuestModal from "../../Accounts/UnInviteGuestModal";
import GuestToAccountModal from "../../Accounts/GuestToAccountModal";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import CreateManagementAccount from "../CreateManagementAccount";
import useProfile from "@/hooks/use-profile";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";
import { useTranslation } from "react-i18next";
import { IoReload } from "react-icons/io5";

type Tenant = components["schemas"]["Tenant"];
type Parent_Account_String = components["schemas"]["Parent_Account_String"];
type GuestUser = components["schemas"]["GuestUser"];

interface Props {
  tenant: Tenant;
  mutateTenantStatus: () => void;
}

export default function ManagersCard({ tenant, mutateTenantStatus }: Props) {
  const { t } = useTranslation();

  const [isGuestToAccountModalOpen, setIsGuestToAccountModalOpen] =
    useState(false);
  const [isUnInviteModalOpen, setIsUnInviteModalOpen] = useState(false);
  const [currentGuestUser, setCurrentGuestUser] = useState<GuestUser | null>(
    null
  );
  const [
    isCreateManagementAccountModalOpen,
    setIsCreateManagementAccountModalOpen,
  ] = useState(false);

  const [isReloading, setIsReloading] = useState(false);

  const { hasEnoughPermissions } = useProfile({
    roles: [MycRole.TenantManager],
    permissions: [MycPermission.Read],
    tenantOwnerNeeded: [tenant.id ?? ""],
    restrictSystemAccount: true,
  });

  const handleOpenUnInviteModal = (guestUser: GuestUser) => {
    setIsUnInviteModalOpen(true);
    setCurrentGuestUser(guestUser);
  };

  const handleCloseGuestToAccountModal = () => {
    mutateTenantStatus();
    setIsGuestToAccountModalOpen(false);
  };

  const handleCloseUnInviteModal = () => {
    mutateTenantStatus();
    setIsUnInviteModalOpen(false);
    setCurrentGuestUser(null);
  };

  const handleCreateManagementAccountModalClose = () => {
    mutateTenantStatus();
    setIsCreateManagementAccountModalOpen(false);
  };

  const handleReload = () => {
    setIsReloading(true);

    setTimeout(() => {
      mutateTenantStatus();
      setIsReloading(false);
    }, 5000);
  };

  const manager = useMemo(() => {
    if (!tenant) return null;

    if ("manager" in tenant) {
      const manager = tenant.manager as Parent_Account_String;

      if ("record" in manager) {
        return manager.record;
      }
    }

    return null;
  }, [tenant?.manager]);

  if (!hasEnoughPermissions) {
    return null;
  }

  return (
    <>
      <Card padding="sm" width="full" group>
        <Card.Header>
          <div className="flex flex-col gap-2">
            <Typography as="h6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span>
                    {t(
                      "screens.Dashboard.Tenants.AdvancedManagement.customization.managers.title"
                    )}
                  </span>
                  <GoGear
                    title="Register tenant owner"
                    className="cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 text-indigo-500 dark:text-lime-400"
                    onClick={() => setIsGuestToAccountModalOpen(true)}
                  />
                </div>

                <IoReload
                  className="hidden group-hover:block text-indigo-500 dark:text-lime-400 cursor-pointer"
                  style={{
                    animation: isReloading ? "spin 1s linear infinite" : "none",
                  }}
                  onClick={handleReload}
                />
              </div>
            </Typography>

            <Typography as="small" decoration="smooth" width="xs">
              {t(
                "screens.Dashboard.Tenants.AdvancedManagement.customization.managers.description"
              )}
            </Typography>
          </div>
        </Card.Header>

        <Card.Body>
          {tenant?.id && manager ? (
            <div className="flex flex-col gap-1">
              <AccountInvitations
                account={manager}
                tenantId={tenant?.id}
                setCurrentGuestUser={handleOpenUnInviteModal}
              />
            </div>
          ) : (
            <Banner intent="info">
              <div className="flex justify-between gap-2 my-5">
                <div className="flex flex-col gap-2">
                  <Typography as="span">
                    {t(
                      "screens.Dashboard.Tenants.AdvancedManagement.customization.managers.createManagementAccount"
                    )}
                  </Typography>

                  <Typography as="small" decoration="smooth">
                    {t(
                      "screens.Dashboard.Tenants.AdvancedManagement.customization.managers.createManagementAccountDescription"
                    )}
                  </Typography>
                </div>

                <div>
                  <Button
                    rounded
                    intent="info"
                    onClick={() => setIsCreateManagementAccountModalOpen(true)}
                  >
                    {t(
                      "screens.Dashboard.Tenants.AdvancedManagement.customization.managers.createManagementAccountButton"
                    )}
                  </Button>
                </div>
              </div>
            </Banner>
          )}
        </Card.Body>
      </Card>

      {manager && (
        <GuestToAccountModal
          account={manager}
          isOpen={isGuestToAccountModalOpen}
          onClose={handleCloseGuestToAccountModal}
          restrictRoleToSlug={"tenantManager"}
          tenantId={tenant?.id}
        />
      )}

      {currentGuestUser && manager?.id && (
        <UnInviteGuestModal
          guestUser={currentGuestUser}
          accountId={manager.id}
          isOpen={isUnInviteModalOpen}
          onClose={handleCloseUnInviteModal}
        />
      )}

      <CreateManagementAccount
        isOpen={isCreateManagementAccountModalOpen}
        tenantId={tenant?.id}
        onClose={handleCreateManagementAccountModalClose}
      />
    </>
  );
}
