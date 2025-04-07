import PageBody from "@/components/ui/PageBody";
import { RiRobot2Line } from "react-icons/ri";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import PaginatedRecords from "@/types/PaginatedRecords";
import { useMemo, useState } from "react";
import useSWR from "swr";
import GuestRolesInitializer from "./GuestRolesInitializer";
import Button from "@/components/ui/Button";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import DashBoardBody from "../DashBoardBody";
import PaginatedContent from "../PaginatedContent";
import { camelToHumanText } from "@/functions/camel-to-human-text";
import ListItem from "@/components/ui/ListItem";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";
import PermissionIcon from "@/components/ui/PermissionIcon";
import GuestRolesModal from "./GuestRolesModal";
import GuestRoleDetails from "./GuestRoleDetails";
import useSuspenseError from "@/hooks/use-suspense-error";
import { FaUserCheck } from "react-icons/fa6";

type GuestRole = components["schemas"]["GuestRole"];

export default function GuestRoles() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentGuestRole, setCurrentGuestRole] = useState<GuestRole | null>(null);

  const { parseHttpError } = useSuspenseError();

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

  const {
    skip,
    pageSize,
    setSkip,
    setPageSize,
    searchTerm,
    setSearchTerm,
  } = useSearchBarParams({
    initialSkip: 0,
    initialPageSize: 10,
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentGuestRole(null);
    mutateGuestRoles(guestRoles, { rollbackOnError: true });
  }

  const handleSuccess = () => {
    handleCloseModal();
    mutateGuestRoles(guestRoles, { rollbackOnError: true });
  }

  const handleViewGuestRoleClick = (guestRole: GuestRole) => {
    Promise.resolve()
      .then(() => setCurrentGuestRole(guestRole))
      .then(() => setIsViewModalOpen(true));
  }

  const memoizedUrl = useMemo(() => {
    if (!isAuthenticated) return null;
    if (!hasEnoughPermissions) return null;

    let searchParams: Record<string, string> = {};

    if (skip) searchParams.skip = skip.toString();
    if (searchTerm && searchTerm !== "") searchParams.name = searchTerm;
    if (pageSize) searchParams.pageSize = pageSize.toString();

    return buildPath("/adm/rs/guests-manager/guest-roles", {
      query: searchParams
    });
  }, [searchTerm, skip, pageSize, isAuthenticated, hasEnoughPermissions]);

  const {
    data: guestRoles,
    isLoading: isLoadingGuestRoles,
    mutate: mutateGuestRoles,
  } = useSWR<PaginatedRecords<GuestRole>>(
    memoizedUrl,
    async (url: string) => {
      const token = await getAccessTokenSilently();

      return await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      })
        .then(parseHttpError)
        .catch(console.error);
    },
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      refreshInterval: 1000 * 60,
    }
  );

  const onSubmit = (term?: string, _?: string) => {
    setSkip(0);

    if (term !== undefined) setSearchTerm(term);

    mutateGuestRoles(guestRoles, { rollbackOnError: true });
  }

  return (
    <DashBoardBody
      breadcrumb={
        <PageBody.Breadcrumb.Item icon={FaUserCheck}>
          Guest roles
        </PageBody.Breadcrumb.Item>
      }
      onSubmit={onSubmit}
      setSkip={setSkip}
      setPageSize={setPageSize}
      isLoading={isLoadingUser}
      authorized={hasEnoughPermissions}
    >
      <div id="GuestRolesContent" className="flex flex-col justify-center gap-4 w-full mx-auto">
        <div className="flex justify-start mx-auto w-full xl:max-w-4xl">
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            rounded="full"
            intent="link"
            disabled={!hasEnoughPermissions}
          >
            <span className="mx-2">Create guest role</span>
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
            <ListItem key={guestRole?.id} >
              <div className="flex justify-between gap-3">
                <Typography as="h3" title={`${guestRole.system ? "System" : "Guest"} Role name (${guestRole?.name}) with permission (${guestRole?.permission})`}>
                  <div className="flex items-center gap-2">
                    {guestRole.system && <RiRobot2Line className="text-blue-500 dark:text-lime-500" />}
                    <Typography as="h3" highlight>
                      <button
                        className="hover:underline text-blue-500 dark:text-lime-400"
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

              <div className="flex items-center gap-1">
                <Typography
                  as="small"
                  decoration="smooth"
                  title="Use this key to setup guest roles in downstream systems and services"
                >
                  Slug:
                </Typography>
                <Typography as="small">
                  <span className="flex items-center justify-center gap-1 group group/clip">
                    {guestRole.slug} <CopyToClipboard text={guestRole.slug} inline groupHidden size="sm" />
                  </span>
                </Typography>
              </div>
              <Typography as="span">{guestRole?.description}</Typography>
            </ListItem>
          ))}
        </PaginatedContent>

        <div className="flex flex-col gap-8 mb-24">
          <div className="flex gap-2 justify-center text-sm mx-auto w-full xl:max-w-4xl items-start">
            <PermissionText permission="read" />
            <PermissionText permission="write" />
          </div>

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

function PermissionText({ permission }: { permission: components["schemas"]["Permission"] }) {
  const text = camelToHumanText(permission);

  return (
    <div className="flex items-center gap-1 pl-2 border-l-2">
      <Typography>
        {text}
      </Typography>
      <PermissionIcon permission={permission} />
    </div>
  )
}
