import { VscEye } from "react-icons/vsc";
import { CiEdit } from "react-icons/ci";
import PageBody from "@/components/ui/PageBody";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import PaginatedRecords from "@/types/PaginatedRecords";
import { useMemo } from "react";
import useSWR from "swr";
import GuestRolesInitializer from "./GuestRolesInitializer";
import Button from "@/components/ui/Button";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import DashBoardBody from "../DashBoardBody";
import PaginatedContent from "../PaginatedContent";
import { camelToHumanText } from "@/functions/camel-to-human-text";
import ListItem from "@/components/ui/ListItem";

type GuestRole = components["schemas"]["GuestRole"];

export default function GuestRoles() {
  const {
    profile,
    isLoadingUser,
    isAuthenticated,
    getAccessTokenSilently,
  } = useProfile();

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

    let searchParams: Record<string, string> = {};

    if (skip) searchParams.skip = skip.toString();
    if (searchTerm && searchTerm !== "") searchParams.name = searchTerm;
    if (pageSize) searchParams.pageSize = pageSize.toString();

    return buildPath("/adm/rs/guests-manager/guest-roles", {
      query: searchParams
    });
  }, [searchTerm, skip, pageSize, isAuthenticated]);

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
        .then((res) => {
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
      revalidateIfStale: false,
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
      authorized={(profile?.isStaff || profile?.isManager)}
    >
      <div id="GuestRolesContent" className="flex flex-col justify-center gap-4 w-full mx-auto">
        <div className="flex justify-start mx-auto w-full xl:max-w-4xl">
          <Button
            onClick={() => console.log("clicked")}
            size="sm"
            rounded="full"
            intent="info"
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
                    <Permission permission={guestRole?.permission} />
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
          <GuestRolesInitializer onSuccess={mutateGuestRoles} />

          <div className="flex gap-2 justify-center text-sm mx-auto w-full xl:max-w-4xl items-start">
            <PermissionText permission="read" />
            <PermissionText permission="write" />
            <PermissionText permission="readWrite" />
          </div>
        </div>
      </div>
    </DashBoardBody>
  );
}

function Permission({
  permission,
  size = "md"
}: {
  permission: components["schemas"]["Permission"],
  size?: "sm" | "md" | "lg"
}) {
  switch (permission) {
    case "read":
      return <VscEye className={`text-green-500 ${size === "sm" ? "text-xl" : size === "md" ? "text-2xl" : "text-3xl"}`} />;
    case "write":
      return <CiEdit className={`text-blue-500 ${size === "sm" ? "text-xl" : size === "md" ? "text-2xl" : "text-3xl"}`} />;
    case "readWrite":
      return <CiEdit className="text-yellow-500 text-3xl" />;
  }
}

function PermissionText({ permission }: { permission: components["schemas"]["Permission"] }) {
  const text = camelToHumanText(permission);

  return (
    <div className="flex items-center gap-0 pl-2 border-l-2">
      <Typography>
        {text}
      </Typography>
      <Permission permission={permission} />
    </div>
  )
}
