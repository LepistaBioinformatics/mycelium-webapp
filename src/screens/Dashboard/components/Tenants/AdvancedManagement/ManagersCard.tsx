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

type Tenant = components["schemas"]["Tenant"];
type Parent_Account_String = components["schemas"]["Parent_Account_String"];
type GuestUser = components["schemas"]["GuestUser"];

interface Props {
  tenant: Tenant;
  mutateTenantStatus: () => void;
}

export default function ManagersCard({ tenant, mutateTenantStatus }: Props) {
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

  const { hasEnoughPermissions } = useProfile({
    roles: [MycRole.TenantManager],
    permissions: [MycPermission.Write],
  });

  const handleOpenUnInviteModal = (guestUser: GuestUser) => {
    setIsUnInviteModalOpen(true);
    setCurrentGuestUser(guestUser);
  };

  const handleCloseGuestToAccountModal = () => {
    setIsGuestToAccountModalOpen(false);
  };

  const handleCloseUnInviteModal = () => {
    setIsUnInviteModalOpen(false);
    setCurrentGuestUser(null);
  };

  const handleCreateManagementAccountModalClose = () => {
    setIsCreateManagementAccountModalOpen(false);
    mutateTenantStatus();
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
  }, [tenant]);

  if (!hasEnoughPermissions) {
    return null;
  }

  return (
    <>
      <Card padding="sm" width="2xl" flex1 group>
        <Card.Header>
          <Typography
            as="h6"
            decoration="smooth"
            title="Peples listed here contains would perform management actions on the tenant"
          >
            <div className="flex items-center gap-2">
              <span>Managers</span>
              <GoGear
                title="Guest to management account"
                className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-500 dark:text-lime-500"
                onClick={() => setIsGuestToAccountModalOpen(true)}
              />
            </div>
          </Typography>
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
                  <Typography as="span">Create management account</Typography>

                  <Typography as="small" decoration="smooth">
                    Management accounts are used to manage the tenant.
                  </Typography>
                </div>

                <div>
                  <Button
                    rounded
                    intent="info"
                    onClick={() => setIsCreateManagementAccountModalOpen(true)}
                  >
                    Create
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
