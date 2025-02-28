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
import Pager from "@/components/ui/Pager";

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
      authorized={!isLoadingUser && (profile?.isStaff || profile?.isManager)}
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

        {isLoadingGuestRoles ? (
          <div className="flex gap-4 justify-center mx-auto w-full xl:max-w-4xl items-start">
            <Typography>Loading...</Typography>
          </div>
        ) : (
          <div className="flex flex-col justify-between gap-4 w-full mb-24 md:min-h-[80vh]">
            <div className="flex flex-col gap-5">
              <Pager
                records={guestRoles}
                mutation={mutateGuestRoles}
                skip={skip}
                setSkip={setSkip}
                pageSize={pageSize}
              />

              {guestRoles?.records?.map((guestRole) => (
                <div
                  key={guestRole?.id}
                  className="flex flex-col text-left gap-2 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-md mx-auto w-full xl:max-w-4xl bg-slate-100 dark:bg-slate-800"
                >
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
                </div>
              ))}

              <Pager
                records={guestRoles}
                mutation={mutateGuestRoles}
                skip={skip}
                setSkip={setSkip}
                pageSize={pageSize}
              />
            </div>

            <div className="flex flex-col gap-8">
              <GuestRolesInitializer onSuccess={mutateGuestRoles} />

              <div className="flex gap-3 justify-center text-sm mx-auto w-full xl:max-w-4xl items-start">
                <div className="flex items-center gap-2 after:content-[''] after:w-[0.5px] after:h-5 after:bg-gray-300 after:dark:bg-gray-700 after:rounded-full after:inline-block">
                  <span>Read</span>
                  <Permission permission="read" />
                </div>

                <div className="flex items-center gap-2 after:content-[''] after:w-[0.5px] after:h-5 after:bg-gray-300 after:dark:bg-gray-700 after:rounded-full after:inline-block">
                  <span>Write</span>
                  <Permission permission="write" />
                </div>

                <div className="flex items-center gap-2">
                  <span>Read Write</span>
                  <Permission permission="readWrite" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashBoardBody>
  );
}

function Permission({ permission }: { permission: components["schemas"]["Permission"] }) {
  switch (permission) {
    case "read":
      return <VscEye className="text-green-500" />;
    case "write":
      return <CiEdit className="text-blue-500" />;
    case "readWrite":
      return <CiEdit className="text-yellow-500" />;
  }
}
