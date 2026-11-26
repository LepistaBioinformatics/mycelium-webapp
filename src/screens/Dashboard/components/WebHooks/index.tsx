import PageBody from "@/components/ui/PageBody";
import { VscGistSecret } from "react-icons/vsc";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import { components } from "@/services/openapi/mycelium-schema";
import { webhooksList } from "@/services/rpc/systemManager";
import { useState } from "react";
import useLoadMore from "@/hooks/use-load-more";
import DashBoardBody from "../DashBoardBody";
import Button from "@/components/ui/Button";
import PaginatedContent from "../PaginatedContent";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import ListItem from "@/components/ui/ListItem";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";
import DetailsBox from "@/components/ui/DetailsBox";
import { MdWebhook } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import IntroSection from "@/components/ui/IntroSection";
import WebhookModal from "./WebhookModal";
import EditWebhookModal from "./EditWebhookModal";
import DeleteWebHook from "./DeleteWebHook";
import { describeSecretToken } from "@/functions/read-secret-token";

type WebHook = components["schemas"]["WebHook"];

const PAGE_SIZE = 20;

export default function Webhooks() {
  const { t } = useTranslation();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentWebhook, setCurrentWebhook] = useState<WebHook | null>(null);

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

  const webhooks = useLoadMore<WebHook>({
    baseKey:
      isAuthenticated && hasEnoughPermissions
        ? ["rpc", "systemManager.webhooks.list", searchTerm ?? ""]
        : null,
    pageSize: PAGE_SIZE,
    fetchPage: (skip, pageSize) =>
      webhooksList(
        {
          skip: skip || undefined,
          pageSize,
          name: searchTerm || undefined,
        },
        getAccessTokenSilently
      ),
  });

  const handleCloseModal = () => {
    setIsNewModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentWebhook(null);
    webhooks.mutate();
  };

  const handleSuccess = () => {
    handleCloseModal();
    webhooks.mutate();
  };

  const onSubmit = (term?: string) => {
    if (term !== undefined) setSearchTerm(term);

    webhooks.mutate();
  };

  const handleEditWebhookClick = (webhook: WebHook) => {
    setCurrentWebhook(webhook);
    setIsEditModalOpen(true);
  };

  const handleDeleteWebhookClick = (webhook: WebHook) => {
    setCurrentWebhook(webhook);
    setIsDeleteModalOpen(true);
  };

  return (
    <DashBoardBody
      breadcrumb={
        <PageBody.Breadcrumb.Item icon={MdWebhook}>
          {t("screens.Dashboard.Webhooks.title")}
        </PageBody.Breadcrumb.Item>
      }
      onSubmit={onSubmit}
      isLoading={isLoadingUser}
      authorized={hasEnoughPermissions}
    >
      <div
        id="TenantsContent"
        className="flex flex-col justify-center gap-4 w-full mx-auto"
      >
        <div className="flex justify-end mx-auto w-full sm:max-w-4xl">
          <Button
            onClick={() => setIsNewModalOpen(true)}
            size="sm"
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
          isLoading={webhooks.isLoading}
          loaded={webhooks.records.length}
          total={webhooks.count}
          hasMore={webhooks.hasMore}
          isLoadingMore={webhooks.isLoadingMore}
          onLoadMore={webhooks.loadMore}
        >
          {webhooks.records.map((webhook) => (
            <ListItem key={webhook?.id}>
              <div className="flex justify-between gap-3">
                <Typography as="h3">{webhook?.name}</Typography>

                <div className="flex gap-5">
                  <FaEdit
                    className="cursor-pointer hover:text-brand-violet-500 dark:group-hover:text-brand-violet-400 text-zinc-500"
                    onClick={() => handleEditWebhookClick(webhook)}
                  />

                  <FaTrash
                    className="cursor-pointer hover:text-brand-violet-500 dark:group-hover:text-brand-violet-400 text-zinc-500"
                    onClick={() => handleDeleteWebhookClick(webhook)}
                  />
                </div>
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
                <span className="uppercase">{webhook?.method}</span>
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
                    <div className="bg-zinc-200 dark:bg-surface-900 p-2 -mt-4">
                      <Secret secret={webhook?.secret} />
                    </div>
                  </DetailsBox.Content>
                </DetailsBox>
              )}
            </ListItem>
          ))}
        </PaginatedContent>
      </div>

      <WebhookModal
        isOpen={isNewModalOpen}
        webhook={currentWebhook}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />

      {isEditModalOpen && currentWebhook && (
        <EditWebhookModal
          isOpen={isEditModalOpen}
          webhook={currentWebhook}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}

      {isDeleteModalOpen && currentWebhook && (
        <DeleteWebHook
          isOpen={isDeleteModalOpen}
          webhook={currentWebhook}
          onClose={handleCloseModal}
        />
      )}
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
          <span className="font-bold">{describeSecretToken(token)}</span>
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
          <span className="font-bold">{describeSecretToken(token)}</span>
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
