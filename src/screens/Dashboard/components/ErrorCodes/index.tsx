import PageBody from "@/components/ui/PageBody";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import { components } from "@/services/openapi/mycelium-schema";
import {
  errorCodesList,
  ErrorCodesListParams,
} from "@/services/rpc/systemManager";
import { useMemo } from "react";
import useLoadMore from "@/hooks/use-load-more";
import DashBoardBody from "../DashBoardBody";
import PaginatedContent from "../PaginatedContent";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import ListItem from "@/components/ui/ListItem";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";
import { MdNearbyError } from "react-icons/md";
import { useTranslation } from "react-i18next";
import IntroSection from "@/components/ui/IntroSection";

type ErrorCode = components["schemas"]["ErrorCode"];

const PAGE_SIZE = 20;

export default function ErrorCodes() {
  const { t } = useTranslation();

  const {
    isLoadingUser,
    isAuthenticated,
    getAccessTokenSilently,
    hasEnoughPermissions,
  } = useProfile({
    roles: [MycRole.SystemManager],
    permissions: [MycPermission.Read, MycPermission.Write],
  });

  const { searchTerm, setSearchTerm } = useSearchBarParams({
    initialSkip: 0,
    initialPageSize: PAGE_SIZE,
  });

  const rpcParams = useMemo<ErrorCodesListParams | null>(() => {
    if (!isAuthenticated) return null;
    if (!hasEnoughPermissions) return null;

    const params: ErrorCodesListParams = {};

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
        params.prefix = prefix as string;
      }

      //
      // Handle internal=yes and internal=no
      //
      if (searchTerm.match(/internal/i)) {
        const internalYesMatch = searchTerm.match(/internal=yes/i);
        const internalNoMatch = searchTerm.match(/internal=no/i);

        if (internalYesMatch) {
          params.isInternal = true;
        } else if (internalNoMatch) {
          params.isInternal = false;
        }
      }

      //
      // Handle code=1234
      //
      if (searchTerm.match(/code/i)) {
        const codeMatch = searchTerm.match(/code=(\d+)/i);

        if (codeMatch) {
          params.code = parseInt(codeMatch[1] as string, 10);
        }
      }
    }

    return params;
  }, [searchTerm, isAuthenticated, hasEnoughPermissions]);

  const errorCodes = useLoadMore<ErrorCode>({
    baseKey: rpcParams
      ? [
          "rpc",
          "systemManager.errorCodes.list",
          rpcParams.prefix,
          rpcParams.code,
          rpcParams.isInternal,
        ]
      : null,
    pageSize: PAGE_SIZE,
    fetchPage: (skip, pageSize) =>
      errorCodesList(
        { ...rpcParams!, skip: skip || undefined, pageSize },
        getAccessTokenSilently
      ),
  });

  const onSubmit = (term?: string) => {
    if (term !== undefined) setSearchTerm(term);

    errorCodes.mutate();
  };

  /**
   * Builds the error code id from the error code prefix and error code number
   * @param errorCode - The error code to build the id from
   * @returns The error code id. Example: "MYC0001"
   */
  const buildErrorCodeId = (errorCode: ErrorCode) => {
    const number = errorCode?.errorNumber.toString().padStart(4, "0");

    return `${errorCode?.prefix}${number}`;
  };

  return (
    <DashBoardBody
      breadcrumb={
        <PageBody.Breadcrumb.Item icon={MdNearbyError}>
          {t("screens.Dashboard.ErrorCodes.title")}
        </PageBody.Breadcrumb.Item>
      }
      onSubmit={onSubmit}
      placeholder={t("screens.Dashboard.ErrorCodes.placeholder", {
        example: "MYC code=23 internal=yes",
      })}
      isLoading={isLoadingUser}
      authorized={hasEnoughPermissions}
    >
      <div
        id="ErrorCodesContent"
        className="flex flex-col justify-center gap-4 w-full mx-auto"
      >
        <PaginatedContent
          isLoading={errorCodes.isLoading}
          loaded={errorCodes.records.length}
          total={errorCodes.count}
          hasMore={errorCodes.hasMore}
          isLoadingMore={errorCodes.isLoadingMore}
          onLoadMore={errorCodes.loadMore}
        >
          {errorCodes.records.map((errorCode) => (
            <ListItem key={buildErrorCodeId(errorCode)}>
              <div className="flex justify-between gap-3">
                <Typography as="h3">
                  <div className="flex items-center gap-2 group group/clip">
                    <ErrorCodeParts part={errorCode.prefix} subpart="prefix" />
                    <ErrorCodeParts
                      part={errorCode.errorNumber.toString().padStart(4, "0")}
                      subpart="code"
                    />
                  </div>
                </Typography>
                <div className="flex gap-5">
                  <CopyToClipboard text={buildErrorCodeId(errorCode)} />
                </div>
              </div>

              <IntroSection.Item
                prefix={t("screens.Dashboard.ErrorCodes.message")}
              >
                {errorCode?.message}
              </IntroSection.Item>

              <IntroSection.Item
                prefix={t("screens.Dashboard.ErrorCodes.details")}
              >
                {errorCode?.details}
              </IntroSection.Item>

              <IntroSection.Item
                prefix={t("screens.Dashboard.ErrorCodes.internal")}
              >
                {errorCode?.isInternal
                  ? t("screens.Dashboard.ErrorCodes.yes")
                  : t("screens.Dashboard.ErrorCodes.no")}
              </IntroSection.Item>

              <IntroSection.Item
                prefix={t("screens.Dashboard.ErrorCodes.native")}
              >
                {errorCode?.isNative
                  ? t("screens.Dashboard.ErrorCodes.yes")
                  : t("screens.Dashboard.ErrorCodes.no")}
              </IntroSection.Item>
            </ListItem>
          ))}
        </PaginatedContent>
      </div>
    </DashBoardBody>
  );
}

function ErrorCodeParts({ part, subpart }: { part: string; subpart: string }) {
  return (
    <div className="flex flex-col align-top gap-0 text-left">
      <span className="">{part}</span>
      <span className="text-xs text-zinc-400 dark:text-zinc-500 -mt-1">
        {subpart}
      </span>
    </div>
  );
}
