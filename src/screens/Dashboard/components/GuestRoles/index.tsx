import PageBody from "@/components/ui/PageBody";
import { RiRobot2Line } from "react-icons/ri";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import { guestRolesList } from "@/services/rpc/guestManager";
import PaginatedRecords from "@/types/PaginatedRecords";
import { useState } from "react";
import useSWR from "swr";
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

  const { skip, pageSize, setSkip, setPageSize, searchTerm, setSearchTerm } =
    useSearchBarParams({
      initialSkip: 0,
      initialPageSize: 10,
    });

  const swrKey =
    isAuthenticated && hasEnoughPermissions
      ? (["rpc", "guestManager.guestRoles.list", skip, pageSize, searchTerm] as const)
      : null;

  const {
    data: guestRoles,
    isLoading: isLoadingGuestRoles,
    mutate: mutateGuestRoles,
  } = useSWR<PaginatedRecords<GuestRole>>(
    swrKey,
    () =>
      guestRolesList(
        {
          skip: skip ?? undefined,
          pageSize: pageSize ?? undefined,
          name: searchTerm && searchTerm !== "" ? searchTerm : undefined,
        },
        getAccessTokenSilently
      ),
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      refreshInterval: 1000 * 60,
    }
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentGuestRole(null);
    mutateGuestRoles(guestRoles, { rollbackOnError: true });
  };

  const handleSuccess = () => {
    handleCloseModal();
    mutateGuestRoles(guestRoles, { rollbackOnError: true });
  };

  const handleViewGuestRoleClick = (guestRole: GuestRole) => {
    Promise.resolve()
      .then(() => setCurrentGuestRole(guestRole))
      .then(() => setIsViewModalOpen(true));
  };

  const onSubmit = (term?: string) => {
    setSkip(0);

    if (term !== undefined) setSearchTerm(term);

    mutateGuestRoles(guestRoles, { rollbackOnError: true });
  };

  return (
    <DashBoardBody
      breadcrumb={
        <PageBody.Breadcrumb.Item icon={FaUserCheck}>
          {t("screens.Dashboard.GuestRoles.title")}
        </PageBody.Breadcrumb.Item>
      }
      onSubmit={onSubmit}
      setSkip={setSkip}
      setPageSize={setPageSize}
      isLoading={isLoadingUser}
      authorized={hasEnoughPermissions}
    >
      <div
        id="GuestRolesContent"
        className="flex flex-col justify-center gap-4 w-full mx-auto"
      >
        <div className="flex justify-end mx-auto w-full sm:max-w-4xl">
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            rounded="full"
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
          isLoading={isLoadingGuestRoles}
          records={guestRoles}
          mutation={mutateGuestRoles}
          skip={skip}
          setSkip={setSkip}
          pageSize={pageSize}
        >
          {guestRoles?.records?.map((guestRole) => (
            <ListItem key={guestRole?.id}>
              <div className="flex justify-between gap-3">
                <Typography as="h3" title={guestRole?.name}>
                  <div className="flex items-center gap-2">
                    {guestRole.system && (
                      <RiRobot2Line className="text-indigo-500 dark:text-lime-500" />
                    )}
                    <Typography as="h3" highlight nowrap>
                      <button
                        className="hover:underline text-indigo-500 dark:text-lime-400"
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

        <div className="flex flex-col gap-8 mb-24">
          <GuestRolesInitializer onSuccess={mutateGuestRoles} />
        </div>
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
          mutateGuestRoles={mutateGuestRoles}
        />
      )}
    </DashBoardBody>
  );
}
