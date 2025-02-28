import PageBody from "@/components/ui/PageBody";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import PaginatedRecords from "@/types/PaginatedRecords";
import { useMemo } from "react";
import useSWR from "swr";
import DashBoardBody from "../DashBoardBody";
import Button from "@/components/ui/Button";
import PaginatedContent from "../PaginatedContent";
import CopyToClipboard from "@/components/ui/CopyToClipboard";

type ErrorCode = components["schemas"]["ErrorCode"];

export default function ErrorCodes() {
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

    if (searchTerm && searchTerm !== "") {
      //
      // Handle prefix
      //
      // Prefix is a single word starting with a #. It is optional and all text
      // after the # should be split by spaces and only the first word should be
      // used as the prefix.
      //
      if (searchTerm.match(/^#.*$/)) {
        const prefix = searchTerm.slice(1).split(" ")[0];
        searchParams.prefix = prefix as string;
      }

      //
      // Handle internal=yes and internal=no
      //
      if (searchTerm.match(/internal/i)) {
        const internalYesMatch = searchTerm.match(/internal=yes/i);
        const internalNoMatch = searchTerm.match(/internal=no/i);

        if (internalYesMatch) {
          searchParams.isInternal = "true";
        } else if (internalNoMatch) {
          searchParams.isInternal = "false";
        }

      }

      //
      // Handle code=1234
      //
      if (searchTerm.match(/code/i)) {
        const codeMatch = searchTerm.match(/code=(\d+)/i);

        if (codeMatch) {
          searchParams.code = codeMatch[1] as string;
        }
      }
    };

    if (skip) searchParams.skip = skip.toString();
    if (pageSize) searchParams.pageSize = pageSize.toString();

    return buildPath("/adm/rs/system-manager/error-codes", {
      query: searchParams
    });
  }, [searchTerm, skip, pageSize, isAuthenticated]);

  const {
    data: errorCodes,
    isLoading: isLoadingErrorCodes,
    mutate: mutateErrorCodes,
  } = useSWR<PaginatedRecords<ErrorCode>>(
    memoizedUrl,
    async (url: string) => {
      const token = await getAccessTokenSilently();

      return await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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

  const onSubmit = (term?: string) => {
    setSkip(0);

    if (term !== undefined) setSearchTerm(term);

    mutateErrorCodes(errorCodes, { rollbackOnError: true });
  }

  /**
   * Builds the error code id from the error code prefix and error code number
   * @param errorCode - The error code to build the id from
   * @returns The error code id. Example: "MYC0001"
   */
  const buildErrorCodeId = (errorCode: ErrorCode) => {
    const number = errorCode?.errorNumber.toString().padStart(4, "0");

    return `${errorCode?.prefix}${number}`;
  }

  return (
    <DashBoardBody
      breadcrumb={
        <PageBody.Breadcrumb.Item>
          Error codes
        </PageBody.Breadcrumb.Item>
      }
      onSubmit={onSubmit}
      placeholder="Search by prefix, code, or message. Example: #MYC code=23 internal=yes"
      setSkip={setSkip}
      setPageSize={setPageSize}
      authorized={!isLoadingUser && (profile?.isStaff || profile?.isManager)}
    >
      <div id="ErrorCodesContent" className="flex flex-col justify-center gap-4 w-full mx-auto">
        <div className="flex justify-start mx-auto w-full xl:max-w-4xl">
          <Button
            onClick={() => console.log("clicked")}
            size="sm"
            rounded="full"
            intent="info"
          >
            <span className="mx-2">Create error code</span>
          </Button>
        </div>

        <PaginatedContent
          isLoading={isLoadingErrorCodes}
          records={errorCodes}
          mutation={mutateErrorCodes}
          skip={skip}
          setSkip={setSkip}
          pageSize={pageSize}
        >
          {errorCodes?.records?.map((errorCode) => (
            <div
              key={buildErrorCodeId(errorCode)}
              className="flex flex-col text-left gap-2 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-md mx-auto w-full xl:max-w-4xl bg-slate-100 dark:bg-slate-800"
            >
              <div className="flex justify-between gap-3">
                <Typography as="h3">
                  <button
                    className="hover:underline text-blue-500 dark:text-lime-400"
                    onClick={() => console.log(errorCode)}
                  >
                    {buildErrorCodeId(errorCode)}
                  </button>
                </Typography>
                <div className="flex gap-5">
                  <CopyToClipboard text={buildErrorCodeId(errorCode)} />
                </div>
              </div>
              <Typography as="span">{errorCode?.message}</Typography>
              <Typography as="small" decoration="smooth">{errorCode?.details}</Typography>
              <div className="flex flex-col gap-2">
                <Typography as="small" decoration="smooth">
                  Internal: <span className="font-bold">{errorCode?.isInternal ? "Yes" : "No"}</span>
                </Typography>
                <Typography as="small" decoration="smooth">
                  Native: <span className="font-bold">{errorCode?.isNative ? "Yes" : "No"}</span>
                </Typography>
              </div>
            </div>
          ))}
        </PaginatedContent>
      </div>
    </DashBoardBody>
  );
}
