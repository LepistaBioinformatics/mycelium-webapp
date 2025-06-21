import PageBody from "@/components/ui/PageBody";
import { VscGistSecret } from "react-icons/vsc";
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
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import ListItem from "@/components/ui/ListItem";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";
import DetailsBox from "@/components/ui/DetailsBox";
import useSuspenseError from "@/hooks/use-suspense-error";
import { MdWebhook } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa";
import IntroSection from "@/components/ui/IntroSection";

type WebHook = components["schemas"]["WebHook"];

export default function Webhooks() {
  const { t } = useTranslation();

  const { parseHttpError } = useSuspenseError();

  const {
    isLoadingUser,
    isAuthenticated,
    getAccessTokenSilently,
    hasEnoughPermissions,
  } = useProfile({
    roles: [MycRole.SystemManager],
    permissions: [MycPermission.Read, MycPermission.Write],
  });

  const { skip, pageSize, setSkip, setPageSize, searchTerm, setSearchTerm } =
    useSearchBarParams({
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

    return buildPath("/adm/rs/system-manager/webhooks", {
      query: searchParams,
    });
  }, [searchTerm, skip, pageSize, isAuthenticated, hasEnoughPermissions]);

  const {
    data: webhooks,
    isLoading: isLoadingWebhooks,
    mutate: mutateWebhooks,
  } = useSWR<PaginatedRecords<WebHook>>(
    memoizedUrl,
    async (url: string) => {
      const token = await getAccessTokenSilently();

      return await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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

    mutateWebhooks(webhooks, { rollbackOnError: true });
  };

  return (
    <DashBoardBody
      breadcrumb={
        <PageBody.Breadcrumb.Item icon={MdWebhook}>
          {t("screens.Dashboard.Webhooks.title")}
        </PageBody.Breadcrumb.Item>
      }
      onSubmit={onSubmit}
      setSkip={setSkip}
      setPageSize={setPageSize}
      isLoading={isLoadingUser}
      authorized={hasEnoughPermissions}
    >
      <div
        id="TenantsContent"
        className="flex flex-col justify-center gap-4 w-full mx-auto"
      >
        <div className="flex justify-end mx-auto w-full sm:max-w-4xl">
          <Button
            onClick={() => console.log("clicked")}
            size="sm"
            rounded="full"
            intent="link"
            disabled={!hasEnoughPermissions}
          >
            <FaPlus
              title={t("screens.Dashboard.Webhooks.createWebhook")}
              className="text-2xl"
            />
          </Button>
        </div>

        <PaginatedContent
          isLoading={isLoadingWebhooks}
          records={webhooks}
          mutation={mutateWebhooks}
          skip={skip}
          setSkip={setSkip}
          pageSize={pageSize}
        >
          {webhooks?.records?.map((webhook) => (
            <ListItem key={webhook?.id}>
              <div className="flex justify-between gap-3">
                <Typography as="h3">
                  <button
                    className="hover:underline text-indigo-500 dark:text-lime-400"
                    onClick={() => console.log(webhook)}
                  >
                    {webhook?.name}
                  </button>
                </Typography>
              </div>

              <IntroSection.Item
                prefix={t("screens.Dashboard.Webhooks.description")}
              >
                {webhook?.description}
              </IntroSection.Item>

              <IntroSection.Item
                prefix={t("screens.Dashboard.Webhooks.trigger")}
              >
                {webhook?.trigger}
              </IntroSection.Item>

              <IntroSection.Item
                prefix={t("screens.Dashboard.Webhooks.created")}
              >
                {formatDDMMYY(new Date(webhook?.created), true)}
              </IntroSection.Item>

              <IntroSection.Item
                prefix={t("screens.Dashboard.Webhooks.updated")}
              >
                {formatDDMMYY(new Date(webhook?.updated || ""), true)}
              </IntroSection.Item>

              <IntroSection.Item
                prefix={t("screens.Dashboard.Webhooks.active")}
              >
                {webhook?.isActive
                  ? t("screens.Dashboard.Webhooks.yes")
                  : t("screens.Dashboard.Webhooks.no")}
              </IntroSection.Item>

              <IntroSection.Item prefix={t("screens.Dashboard.Webhooks.url")}>
                <span className="flex items-center gap-2 group group/clip">
                  {webhook?.url}
                  <CopyToClipboard text={webhook?.url ?? ""} groupHidden />
                </span>
              </IntroSection.Item>

              {webhook?.secret && (
                <DetailsBox>
                  <DetailsBox.Summary>
                    <VscGistSecret className="w-4 h-4 inline-block text-green-500 mr-2" />
                    <Typography as="span" decoration="smooth">
                      {t("screens.Dashboard.Webhooks.security")}
                    </Typography>
                  </DetailsBox.Summary>

                  <DetailsBox.Content>
                    <div className="bg-zinc-200 dark:bg-zinc-800 rounded-lg p-2 -mt-4">
                      <Secret secret={webhook?.secret} />
                    </div>
                  </DetailsBox.Content>
                </DetailsBox>
              )}
            </ListItem>
          ))}
        </PaginatedContent>
      </div>
    </DashBoardBody>
  );
}

const Secret = ({
  secret,
}: {
  secret: components["schemas"]["HttpSecret"];
}) => {
  const { t } = useTranslation();

  if ("authorizationHeader" in secret) {
    const { authorizationHeader } = secret;
    const { headerName, prefix, token } = authorizationHeader;

    return (
      <div className="flex flex-col gap-2">
        <Typography as="small">
          {t("screens.Dashboard.Webhooks.secretType")}:{" "}
          <span className="font-bold">{Object.keys(secret).at(0)}</span>
        </Typography>
        <Typography as="small">
          {t("screens.Dashboard.Webhooks.headerName")}:{" "}
          <span className="font-bold">{headerName || "Authorization"}</span>
        </Typography>
        <Typography as="small">
          {t("screens.Dashboard.Webhooks.tokenPrefix")}:{" "}
          <span className="font-bold">{prefix || "Bearer (default)"}</span>
        </Typography>
        <Typography as="small">
          {t("screens.Dashboard.Webhooks.tokenValue")}:{" "}
          <span className="font-bold">{token}</span>
        </Typography>
      </div>
    );
  }

  if ("queryParameter" in secret) {
    const { queryParameter } = secret;
    const { name, token } = queryParameter;

    return (
      <div className="flex flex-col gap-2">
        <Typography as="small">
          {t("screens.Dashboard.Webhooks.secretType")}:{" "}
          <span className="font-bold">{Object.keys(secret).at(0)}</span>
        </Typography>
        <Typography as="small">
          {t("screens.Dashboard.Webhooks.queryParameterName")}:{" "}
          <span className="font-bold">{name}</span>
        </Typography>
        <Typography as="small">
          {t("screens.Dashboard.Webhooks.queryParameterValue")}:{" "}
          <span className="font-bold">{token}</span>
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Typography as="small">
        {t("screens.Dashboard.Webhooks.secretType")}:{" "}
        <span className="font-bold">{Object.keys(secret).at(0)}</span>
      </Typography>
    </div>
  );
};
