import AuthorizedOr from "@/components/ui/AuthorizedOr";
import { FaRegTrashAlt } from "react-icons/fa";
import { GoGear } from "react-icons/go";
import PageBody from "@/components/ui/PageBody";
import useProfile from "@/hooks/use-profile";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import ControlPanelBreadcrumbItem from "../ControlPanelBreadcrumbItem";
import { SlOrganization } from "react-icons/sl";
import useTenantDetails from "@/hooks/use-tenant-details";
import { buildPath } from "@/services/openapi/mycelium-api";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import CardsSection from "@/components/ui/CardsSection";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import IntroSection from "@/components/ui/IntroSection";
import MiniBox from "@/components/ui/MiniBox";
import { components } from "@/services/openapi/mycelium-schema";
import AccountInvitations from "../Accounts/AccountInvitations";
import GuestOwner from "./GuestOwnerModal";
import UnguestOwner from "./UnguestOwnerModal";
import UnInviteGuestModal from "../Accounts/UnInviteGuestModal";
import GuestToAccountModal from "../Accounts/GuestToAccountModal";
import { useDispatch } from "react-redux";
import { setTenantInfo } from "@/states/tenant.state";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import CreateManagementAccount from "./CreateManagementAccount";
import SeeMoreText from "@/components/ui/SeeMoreText";

type Parent_Account_String = components["schemas"]["Parent_Account_String"];
type TenantOwner = components["schemas"]["Owner"];
type GuestUser = components["schemas"]["GuestUser"];

export default function AdvancedManagement() {
  const params = useParams();

  const [isGuestOwnerModalOpen, setIsGuestOwnerModalOpen] = useState(false);
  const [isUnguestOwnerModalOpen, setIsUnguestOwnerModalOpen] = useState(false);
  const [isUnInviteModalOpen, setIsUnInviteModalOpen] = useState(false);
  const [isGuestToAccountModalOpen, setIsGuestToAccountModalOpen] = useState(false);
  const [currentGuestUser, setCurrentGuestUser] = useState<GuestUser | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<TenantOwner | null>(null);
  const [isCreateManagementAccountModalOpen, setIsCreateManagementAccountModalOpen] = useState(false);

  const dispatch = useDispatch();

  const handleGuestOwnerModalClose = () => {
    setIsGuestOwnerModalOpen(false);
  }

  const handleGuestOwnerModalSuccess = () => {
    setIsGuestOwnerModalOpen(false);
    mutateTenantStatus();
  }

  const handleUnguestOwnerModalSuccess = () => {
    setIsUnguestOwnerModalOpen(false);
    mutateTenantStatus();
  }

  const handleUnguestOwnerModalOpen = (owner: TenantOwner) => {
    setIsUnguestOwnerModalOpen(true);
    setSelectedOwner(owner);
  }

  const handleUnguestOwnerModalClose = () => {
    setIsUnguestOwnerModalOpen(false);
    setSelectedOwner(null);
  }

  const handleOpenUnInviteModal = (guestUser: GuestUser) => {
    setIsUnInviteModalOpen(true);
    setCurrentGuestUser(guestUser);
  }

  const handleCloseGuestToAccountModal = () => {
    setIsGuestToAccountModalOpen(false);
  }

  const handleCloseUnInviteModal = () => {
    setIsUnInviteModalOpen(false);
    setCurrentGuestUser(null);
  }

  const handleCreateManagementAccountModalClose = () => {
    setIsCreateManagementAccountModalOpen(false);
    mutateTenantStatus(tenantStatus, { rollbackOnError: true });
  }

  const tenantId = useMemo(() => {
    if (!params.tenantId) return null;

    return params.tenantId as string;
  }, [params.tenantId]);

  const {
    hasEnoughPermissions,
    isLoadingUser,
    isLoadingProfile,
  } = useProfile({
    roles: [MycRole.TenantManager],
    permissions: [MycPermission.Read, MycPermission.Write],
    restrictSystemAccount: true,
    tenantOwnerNeeded: [tenantId ?? ""],
  });

  const customUrl = useMemo(() => {
    if (!tenantId) return null;

    return buildPath(
      "/adm/rs/tenant-manager/tenants/{tenant_id}",
      { path: { tenant_id: tenantId } }
    );
  }, [tenantId]);

  const {
    tenantStatus,
    isLoading: isLoadingTenantStatus,
    error: tenantStatusError,
    mutate: mutateTenantStatus,
  } = useTenantDetails({ customUrl });

  useEffect(() => {
    if (tenantStatus && typeof tenantStatus === "object" && "active" in tenantStatus) {
      dispatch(setTenantInfo(tenantStatus.active));
    }
  }, [tenantStatus]);

  const activeTenant = useMemo(() => {
    if (!tenantStatus) return null;

    if (typeof tenantStatus === "object" && "active" in tenantStatus) {
      return tenantStatus.active;
    }

    return null;
  }, [tenantStatus]);

  const owners = useMemo(() => {
    if (!activeTenant) return null;

    if ("owners" in activeTenant) {
      if ("records" in activeTenant.owners) {
        return activeTenant.owners.records;
      }
    }

    return null;
  }, [activeTenant]);

  const manager = useMemo(() => {
    if (!activeTenant) return null;

    if ("manager" in activeTenant) {
      const manager = activeTenant.manager as Parent_Account_String;

      if ("record" in manager) {
        return manager.record;
      }
    }

    return null;
  }, [activeTenant]);

  /**
   * Base page component that contains the breadcrumb and the content
   * 
   * @param param0
   * @returns 
   */
  const BasePage = ({ children }: BaseProps) => (
    <PageBody padding="md" height="fit">
      <PageBody.Breadcrumb>
        <ControlPanelBreadcrumbItem />
        <PageBody.Breadcrumb.Item href="/dashboard/tenants" icon={SlOrganization}>
          Tenants
        </PageBody.Breadcrumb.Item>
        <PageBody.Breadcrumb.Item>
          Advanced Management
        </PageBody.Breadcrumb.Item>
      </PageBody.Breadcrumb>

      <PageBody.Content padding="md" container flex="col" gap={12}>
        <AuthorizedOr
          authorized={hasEnoughPermissions}
          isLoading={isLoadingUser || isLoadingProfile}
        >
          {children}
        </AuthorizedOr>
      </PageBody.Content>

      <GuestOwner
        isOpen={isGuestOwnerModalOpen}
        onClose={handleGuestOwnerModalClose}
        onSuccess={handleGuestOwnerModalSuccess}
        tenant={activeTenant}
      />

      {selectedOwner && (
        <UnguestOwner
          isOpen={isUnguestOwnerModalOpen}
          owner={selectedOwner}
          onClose={handleUnguestOwnerModalClose}
          onSuccess={handleUnguestOwnerModalSuccess}
          tenant={activeTenant}
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
    </PageBody>
  );

  if (isLoadingTenantStatus) {
    return <BasePage>Loading...</BasePage>;
  }

  if (tenantStatusError) {
    return <BasePage>Error: {tenantStatusError.message}</BasePage>;
  }

  if (tenantStatus === "deleted" || tenantStatus === "unknown") {
    return (
      <BasePage>
        <div className="flex flex-col items-center gap-12 h-[70vh] justify-center">
          <Typography as="h1" decoration="smooth" center margin="auto">
            Sorry! This tenant was deleted or not exists
          </Typography>

          <img
            src="/undraw.co/undraw_towing_e407.svg"
            alt="403"
            className="mx-auto"
            width={300}
            height={300}
          />
        </div>
      </BasePage>
    );
  }

  if (tenantStatus === "unauthorized") {
    return (
      <BasePage>
        <div className="flex flex-col items-center gap-12 h-[70vh] justify-center">
          <Typography as="h1" decoration="smooth" center margin="auto">
            You are not authorized to access this tenant
          </Typography>

          <img
            src="/undraw.co/undraw_secure-login_m11a.svg"
            alt="403"
            className="mx-auto"
            width={300}
            height={300}
          />
        </div>
      </BasePage>
    );
  }

  return (
    <BasePage>
      <CardsSection>
        <CardsSection.Header>
          <IntroSection
            prefix="Seeing"
            content={activeTenant?.name}
            title="Tenant name"
            as="h1"
          >
            <IntroSection.Item
              prefix="described as"
              title="Tenant description"
            >
              {activeTenant?.description}
            </IntroSection.Item>

            {activeTenant?.created && (
              <IntroSection.Item
                prefix="created at"
                title="Tenant created at"
              >
                {formatDDMMYY(new Date(activeTenant?.created))}
              </IntroSection.Item>
            )}

            {activeTenant?.updated && (
              <IntroSection.Item
                prefix="updated at"
                title="Tenant updated at"
              >
                {formatDDMMYY(new Date(activeTenant?.updated))}
              </IntroSection.Item>
            )}

            {manager && (
              <GuestToAccountModal
                account={manager}
                isOpen={isGuestToAccountModalOpen}
                onClose={handleCloseGuestToAccountModal}
                restrictRoleToSlug={"tenantManager"}
                tenantId={tenantId}
              />
            )}
          </IntroSection>
        </CardsSection.Header>

        <CardsSection.Body>
          <SeeMoreText
            text="You can manage the people and settings for your tenant here. 
            Start by adding owners and management accounts to configure the 
            tenant, then invite additional users as needed. Any other 
            configuration options are available in the Tenant Settings section."
            maxLength={100}
          />
        </CardsSection.Body>
      </CardsSection>

      <CardsSection>
        <CardsSection.Header>
          <Typography as="h6" decoration="smooth">
            Peoples on Tenant
          </Typography>
        </CardsSection.Header>

        <CardsSection.Body>
          <Card
            minHeight="50vh"
            maxHeight="50vh"
            padding="sm"
            width="6xl"
            flex1
            group
          >
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
                  const ownerName = owner.firstName && owner.lastName
                    ? `${owner.firstName} ${owner.lastName}`
                    : owner.username;

                  return (
                    <MiniBox key={owner.id}>
                      <div className="flex items-center justify-between group/item group/clip">
                        <IntroSection
                          content={ownerName}
                          title="Owner name"
                          as="h3"
                        >
                          <IntroSection.Item
                            prefix="email"
                            title="Email"
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

                        <button
                          className="text-red-500 cursor-pointer hidden group-hover/item:block transition-opacity duration-300"
                          onClick={() => handleUnguestOwnerModalOpen(owner)}
                        >
                          <FaRegTrashAlt />
                        </button>
                      </div>
                    </MiniBox>
                  )
                })}
              </div>
            </Card.Body>
          </Card>

          <Card
            minHeight="50vh"
            maxHeight="50vh"
            padding="sm"
            width="6xl"
            flex1
            group
          >
            <Card.Header>
              <Typography
                as="h6"
                decoration="smooth"
                title="Peples listed here contains would perform management actions on the tenant"
              >
                <div className="flex items-center gap-2">
                  <span>Management account invitations</span>
                  <GoGear
                    title="Guest to management account"
                    className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-500 dark:text-lime-500"
                    onClick={() => setIsGuestToAccountModalOpen(true)}
                  />
                </div>
              </Typography>
            </Card.Header>

            <Card.Body>
              {activeTenant?.id && manager
                ? (
                  <div className="flex flex-col gap-1">
                    <AccountInvitations
                      account={manager}
                      tenantId={activeTenant?.id}
                      setCurrentGuestUser={handleOpenUnInviteModal}
                    />
                  </div>
                )
                : (
                  <Banner intent="info">
                    <div className="flex justify-between gap-2 my-5">
                      <div className="flex flex-col gap-2">
                        <Typography as="span">
                          Create management account
                        </Typography>

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
        </CardsSection.Body>
      </CardsSection>

      <CardsSection>
        <CardsSection.Header>
          <Typography as="h6" decoration="smooth">
            <span>Tenant settings</span>
          </Typography>
        </CardsSection.Header>

        <CardsSection.Body>
          <Card
            minHeight="50vh"
            maxHeight="50vh"
            padding="sm"
            width="6xl"
            flex1
            group
          >
            <Card.Header>
              <Typography as="h6" decoration="smooth">
                <div className="flex items-center gap-2">
                  <span>Tags</span>
                  <GoGear
                    title="Register tenant owner"
                    className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-500 dark:text-lime-500"
                    onClick={() => alert("Not implemented yet")}
                  />
                </div>
              </Typography>
            </Card.Header>

            <Card.Body>
              <div className="flex flex-col gap-2">
                Tags
              </div>
            </Card.Body>
          </Card>
        </CardsSection.Body>
      </CardsSection>

      <CreateManagementAccount
        isOpen={isCreateManagementAccountModalOpen}
        tenantId={tenantId}
        onClose={handleCreateManagementAccountModalClose}
      />
    </BasePage>
  )
}
