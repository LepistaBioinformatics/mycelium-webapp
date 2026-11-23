import PageBody from "@/components/ui/PageBody";
import { RiRobot2Line } from "react-icons/ri";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import { guestRolesList } from "@/services/rpc/guestManager";
import { useState } from "react";
import useLoadMore from "@/hooks/use-load-more";
import GuestRolesInitializer from "./GuestRolesInitializer";
import Button from "@/components/ui/Button";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import DashBoardBody from "../DashBoardBody";
import PaginatedContent from "../PaginatedContent";
import ListItem from "@/components/ui/ListItem";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";
import PermissionIcon from "@/components/ui/PermissionIcon";
import GuestRolesModal from "./GuestRolesModal";
import GuestRoleDetails from "./GuestRoleDetails";
import { FaUserCheck } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa";
import IntroSection from "@/components/ui/IntroSection";

type GuestRole = components["schemas"]["GuestRole"];

const PAGE_SIZE = 20;

export default function GuestRoles() {
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentGuestRole, setCurrentGuestRole] = useState<GuestRole | null>(
    null
  );

  const {
    isLoadingUser,
    isAuthenticated,
    getAccessTokenSilently,
    hasEnoughPermissions,
  } = useProfile({
    roles: [MycRole.GuestsManager],
    permissions: [MycPermission.Read, MycPermission.Write],
    restrictSystemAccount: true,
  });

  const { searchTerm, setSearchTerm } = useSearchBarParams({
    initialSkip: 0,
    initialPageSize: PAGE_SIZE,
  });

  const guestRoles = useLoadMore<GuestRole>({
    baseKey:
      isAuthenticated && hasEnoughPermissions
        ? ["rpc", "guestManager.guestRoles.list", searchTerm ?? ""]
        : null,
    pageSize: PAGE_SIZE,
    fetchPage: (skip, pageSize) =>
      guestRolesList(
        {
          skip: skip || undefined,
          pageSize,
          name: searchTerm || undefined,
        },
        getAccessTokenSilently
      ),
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentGuestRole(null);
    guestRoles.mutate();
  };

  const handleSuccess = () => {
    handleCloseModal();
    guestRoles.mutate();
  };

  const handleViewGuestRoleClick = (guestRole: GuestRole) => {
    Promise.resolve()
      .then(() => setCurrentGuestRole(guestRole))
      .then(() => setIsViewModalOpen(true));
  };

  const onSubmit = (term?: string) => {
    if (term !== undefined) setSearchTerm(term);

    guestRoles.mutate();
  };

  return (
    <DashBoardBody
      breadcrumb={
        <PageBody.Breadcrumb.Item icon={FaUserCheck}>
          {t("screens.Dashboard.GuestRoles.title")}
        </PageBody.Breadcrumb.Item>
      }
      onSubmit={onSubmit}
      isLoading={isLoadingUser}
      authorized={hasEnoughPermissions}
    >
      <div
        id="GuestRolesContent"
        className="flex flex-col justify-center gap-4 w-full mx-auto"
      >
        <div className="flex items-center justify-end gap-3 mx-auto w-full sm:max-w-4xl">
          <GuestRolesInitializer onSuccess={guestRoles.mutate} />
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            intent="link"
            disabled={!hasEnoughPermissions}
          >
            <FaPlus
              title={t("screens.Dashboard.GuestRoles.createGuestRole")}
              className="text-2xl"
            />
          </Button>
        </div>

        <PaginatedContent
          isLoading={guestRoles.isLoading}
          loaded={guestRoles.records.length}
          total={guestRoles.count}
          hasMore={guestRoles.hasMore}
          isLoadingMore={guestRoles.isLoadingMore}
          onLoadMore={guestRoles.loadMore}
        >
          {guestRoles.records.map((guestRole) => (
            <ListItem key={guestRole?.id}>
              <div className="flex justify-between gap-3">
                <Typography as="h3" title={guestRole?.name}>
                  <div className="flex items-center gap-2">
                    {guestRole.system && (
                      <RiRobot2Line className="text-brand-violet-500 dark:text-brand-violet-500" />
                    )}
                    <Typography as="h3" highlight nowrap>
                      <button
                        className="hover:underline text-brand-violet-500 dark:text-brand-violet-400"
                        onClick={() => handleViewGuestRoleClick(guestRole)}
                      >
                        {guestRole?.name}
                      </button>
                    </Typography>
                    <PermissionIcon permission={guestRole?.permission} />
                  </div>
                </Typography>
                <div className="flex gap-5">
                  <CopyToClipboard text={guestRole?.id ?? ""} />
                </div>
              </div>

              <div className="flex flex-col gap-1 group/clip">
                <IntroSection.Item
                  prefix={t(
                    "screens.Dashboard.GuestRoles.listItem.slug.prefix"
                  )}
                >
                  <Typography decoration="light">
                    <span>{guestRole.slug}</span>
                    <CopyToClipboard
                      text={guestRole.slug}
                      inline
                      groupHidden
                      size="sm"
                    />
                  </Typography>
                </IntroSection.Item>

                <IntroSection.Item
                  prefix={t(
                    "screens.Dashboard.GuestRoles.listItem.description.prefix"
                  )}
                >
                  <Typography as="span" decoration="light">
                    {guestRole?.description}
                  </Typography>
                </IntroSection.Item>
              </div>
            </ListItem>
          ))}
        </PaginatedContent>
      </div>

      <GuestRolesModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        guestRole={currentGuestRole}
      />

      {currentGuestRole && (
        <GuestRoleDetails
          isOpen={isViewModalOpen}
          onClose={handleCloseModal}
          guestRole={currentGuestRole}
          mutateGuestRoles={guestRoles.mutate}
        />
      )}
    </DashBoardBody>
  );
}
