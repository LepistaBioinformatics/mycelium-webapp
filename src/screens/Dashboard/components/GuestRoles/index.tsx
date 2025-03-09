import PageBody from "@/components/ui/PageBody";
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
import Banner from "@/components/ui/Banner";

type GuestRole = components["schemas"]["GuestRole"];
type HttpResponse = components["schemas"]["HttpJsonResponse"];

export default function GuestRoles() {
  const [error, setError] = useState<HttpResponse | null>(null);

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
        .then(async (res) => {
          if (res.status === 403) {
            setError(await res.json());
          }

          if (!res.ok) {
            throw new Error("Failed to fetch tenants");
          }

          return res.json();
        })
        .catch((err) => {
          console.error(err);
        });
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
        <PageBody.Breadcrumb.Item>
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
        {error && (
          <div className="flex justify-start mx-auto w-full xl:max-w-4xl">
            <Banner intent="error" title={error.code} >
              {error.msg}
            </Banner>
          </div>
        )}

        <div className="flex justify-start mx-auto w-full xl:max-w-4xl">
          <Button
            onClick={() => console.log("clicked")}
            size="sm"
            rounded="full"
            intent="info"
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
                <Typography as="h3">
                  <button
                    className="hover:underline text-blue-500 dark:text-lime-400 flex items-center gap-2"
                    onClick={() => console.log(guestRole)}
                  >
                    {guestRole?.name}
                    <PermissionIcon permission={guestRole?.permission} ignoreTooltip />
                  </button>
                </Typography>
                <div className="flex gap-5">
                  <CopyToClipboard text={guestRole?.id ?? ""} />
                </div>
              </div>
              <Typography as="span">{guestRole?.description}</Typography>
            </ListItem>
          ))}
        </PaginatedContent>

        <div className="flex flex-col gap-8 mb-24">
          <div className="flex gap-2 justify-center text-sm mx-auto w-full xl:max-w-4xl items-start">
            <PermissionText permission="read" />
            <PermissionText permission="write" />
            <PermissionText permission="readWrite" />
          </div>

          <GuestRolesInitializer onSuccess={mutateGuestRoles} />
        </div>
      </div>
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
      <PermissionIcon permission={permission} ignoreTooltip />
    </div>
  )
}
