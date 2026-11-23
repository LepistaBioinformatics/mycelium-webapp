import SearchBar from "@/components/ui/SearchBar";
import Typography from "@/components/ui/Typography";
import {
  WEBHOOK_EXECUTION_STATUSES,
  WEBHOOK_TRIGGERS,
} from "@/constants/webhook-triggers";
import {
  parseWebhookExecutionFilters,
  withWebhookExecutionFilter,
} from "@/functions/parse-webhook-execution-filters";
import useProfile from "@/hooks/use-profile";
import PageBody from "@/components/ui/PageBody";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MdHistory } from "react-icons/md";
import DashBoardBody from "../DashBoardBody";
import ExecutionEvents from "./ExecutionEvents";

const PREFIX = "screens.Dashboard.Webhooks.ExecutionEvents";

/** Webhook delivery history: totals by trigger and status, and the events */
export default function WebhookExecutions() {
  const { t } = useTranslation();
  const [term, setTerm] = useState<string | undefined>(undefined);

  const { isLoadingUser, hasEnoughPermissions } = useProfile({
    roles: [MycRole.SystemManager],
    permissions: [MycPermission.Read],
  });

  const filters = parseWebhookExecutionFilters(term);

  return (
    <DashBoardBody
      breadcrumb={
        <PageBody.Breadcrumb.Item icon={MdHistory}>
          {t("screens.Dashboard.WebhookExecutions.title")}
        </PageBody.Breadcrumb.Item>
      }
      term={term}
      onSubmit={(value?: string) => setTerm(value || undefined)}
      placeholder={t("screens.Dashboard.WebhookExecutions.searchPlaceholder")}
      isLoading={isLoadingUser}
      authorized={hasEnoughPermissions}
      commandPalette={
        <SearchBar.Content>
          <div className="flex flex-col gap-1">
            <Typography as="h4" decoration="smooth">
              {t(`${PREFIX}.filters.status`)}
            </Typography>
            {WEBHOOK_EXECUTION_STATUSES.map((status) => (
              <SearchBar.Item
                key={status}
                brief={t(`${PREFIX}.statuses.${status}`)}
                command={`status:${status}`}
                onClick={() =>
                  setTerm(withWebhookExecutionFilter(term, "status", status))
                }
              />
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <Typography as="h4" decoration="smooth">
              {t(`${PREFIX}.filters.trigger`)}
            </Typography>
            {WEBHOOK_TRIGGERS.map((trigger) => (
              <SearchBar.Item
                key={trigger}
                brief={t(
                  `screens.Dashboard.Webhooks.WebhookModal.formFields.trigger.options.${trigger}`
                )}
                command={`trigger:${trigger}`}
                onClick={() =>
                  setTerm(withWebhookExecutionFilter(term, "trigger", trigger))
                }
              />
            ))}
          </div>
        </SearchBar.Content>
      }
    >
      <div className="flex flex-col gap-6 mx-auto w-full xl:max-w-4xl mt-2 mb-24">
        <ExecutionEvents
          key={`${filters.trigger ?? ""}|${filters.status ?? ""}`}
          trigger={filters.trigger}
          status={filters.status}
        />
      </div>
    </DashBoardBody>
  );
}
