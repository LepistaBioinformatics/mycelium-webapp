import SideCurtain from "@/components/ui/SideCurtain";
import Typography from "@/components/ui/Typography";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import useProfile from "@/hooks/use-profile";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { useMemo, useState } from "react";
import useSWR from "swr";
import DeleteAccount from "./DeleteAccount";
import { RootState } from "@/states/store";
import { TENANT_ID_HEADER } from "@/constants/http-headers";
import { camelToHumanText } from "@/functions/camel-to-human-text";
import { useSelector } from "react-redux";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import GuestToAccountModal from "./GuestToAccountModal";
import DetailsBox from "@/components/ui/DetailsBox";
import EditAccountModal from "./EditAccountModal";
import useSuspenseError from "@/hooks/use-suspense-error";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import UpgradeOrDowngradeAccountModal from "./UpgradeOrDowngradeAccountModal";
import IntroSection from "@/components/ui/IntroSection";
import AccountInvitations from "./AccountInvitations";
import UnInviteGuestModal from "./UnInviteGuestModal";
import { useTranslation } from "react-i18next";

type Account = components["schemas"]["Account"];
type GuestUser = components["schemas"]["GuestUser"];

interface Props {
  accountId: string;
  isOpen: boolean;
  onClose: () => void;
}

enum OpenedSection {
  Details,
  Invitations,
  AdvancedActions,
}

export default function AccountDetails({ isOpen, onClose, accountId }: Props) {
  const { t } = useTranslation();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isGuestToAccountModalOpen, setIsGuestToAccountModalOpen] =
    useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpgradeOrDowngradeModalOpen, setIsUpgradeOrDowngradeModalOpen] =
    useState(false);
  const [currentGuestUser, setCurrentGuestUser] = useState<GuestUser | null>(
    null
  );
  const [isUnInviteModalOpen, setIsUnInviteModalOpen] = useState(false);

  const { profile, getAccessTokenSilently } = useProfile();

  const { parseHttpError } = useSuspenseError();

  const [openedSection, setOpenedSection] = useState<OpenedSection>(
    OpenedSection.Details
  );

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const handleToggleSection = (
    section: OpenedSection,
    state: "open" | "closed"
  ) => {
    if (state === "open") setOpenedSection(section);
  };

  const handleCloseGuestToAccountModal = () => {
    setIsGuestToAccountModalOpen(false);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleCloseUnInviteModal = () => {
    setIsUnInviteModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    mutateAccount(account, { rollbackOnError: true });
  };

  const handleSuccess = () => {
    handleCloseEditModal();
  };

  const handleCloseUpgradeOrDowngradeModal = () => {
    setIsUpgradeOrDowngradeModalOpen(false);
  };

  const handleOpenUnInviteModal = (guestUser: GuestUser) => {
    setIsUnInviteModalOpen(true);
    setCurrentGuestUser(guestUser);
  };

  const { data: account, mutate: mutateAccount } = useSWR<Account>(
    buildPath("/adm/rs/subscriptions-manager/accounts/{account_id}", {
      path: { account_id: accountId },
    }),
    async (url: string) => {
      const token = await getAccessTokenSilently();

      return fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          [TENANT_ID_HEADER]: tenantInfo?.id ?? "",
        },
      })
        .then(parseHttpError)
        .catch((err) => {
          console.error(err);

          return null;
        });
    },
    {
      refreshInterval: 1000 * 60,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );

  const showTenantInfo = useMemo(() => {
    if (!account) return false;

    const accountType = account.accountType;

    if (typeof accountType === "string") return false;

    if (
      "subscription" in accountType ||
      "tenantManager" in accountType ||
      "roleAssociated" in accountType
    ) {
      return true;
    }

    return false;
  }, [account]);

  const owners = useMemo(() => {
    if (!account) return null;
    if (typeof account.owners !== "object") return null;

    if ("ids" in account.owners) {
      const accountOwners = account.owners.ids;

      if (
        accountOwners.includes(
          profile?.owners.find((owner) => owner.isPrincipal)?.id ?? ""
        )
      ) {
        if (accountOwners.length === 1) {
          return "You";
        } else {
          return <>You and {accountOwners.length - 1} other</>;
        }
      }

      return null;
    }
  }, [account, profile?.owners]);

  const includeInvitationsFeature = useMemo(() => {
    if (!account) return false;
    if (typeof account.accountType === "string") return false;

    return true;
  }, [account]);

  return (
    <SideCurtain
      open={isOpen}
      title={t("screens.Dashboard.Accounts.AccountDetails.title")}
      handleClose={onClose}
    >
      {account && (
        <IntroSection
          prefix={t("screens.Dashboard.Accounts.AccountDetails.name.prefix")}
          content={account?.name}
          title={t("screens.Dashboard.Accounts.AccountDetails.name.title")}
        >
          {tenantInfo?.id && showTenantInfo && (
            <>
              <IntroSection.Item
                prefix={t(
                  "screens.Dashboard.Accounts.AccountDetails.onTenant.prefix"
                )}
                title={t(
                  "screens.Dashboard.Accounts.AccountDetails.onTenant.title"
                )}
              >
                {tenantInfo.name}
              </IntroSection.Item>
              <IntroSection.Item
                prefix={t(
                  "screens.Dashboard.Accounts.AccountDetails.description.prefix"
                )}
                title={t(
                  "screens.Dashboard.Accounts.AccountDetails.description.title"
                )}
              >
                {tenantInfo.description}
              </IntroSection.Item>
            </>
          )}
        </IntroSection>
      )}

      <DetailsBox
        open={openedSection === OpenedSection.Details}
        onToggle={(state) => handleToggleSection(OpenedSection.Details, state)}
      >
        <DetailsBox.Summary>
          <Typography as="span">
            {t("screens.Dashboard.Accounts.AccountDetails.details")}
          </Typography>
        </DetailsBox.Summary>

        <DetailsBox.Content minHeight="30">
          <div className="flex flex-col gap-5">
            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.Accounts.AccountDetails.slug.prefix"
              )}
              title={t("screens.Dashboard.Accounts.AccountDetails.slug.title")}
            >
              {account?.slug}
            </IntroSection.Item>

            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.Accounts.AccountDetails.created.prefix"
              )}
              title={t(
                "screens.Dashboard.Accounts.AccountDetails.created.title"
              )}
            >
              {formatDDMMYY(new Date(account?.created ?? ""), true)}
            </IntroSection.Item>

            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.Accounts.AccountDetails.updated.prefix"
              )}
              title={t(
                "screens.Dashboard.Accounts.AccountDetails.updated.title"
              )}
            >
              {formatDDMMYY(new Date(account?.updated ?? ""), true)}
            </IntroSection.Item>

            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.Accounts.AccountDetails.status.prefix"
              )}
              title={t(
                "screens.Dashboard.Accounts.AccountDetails.status.title"
              )}
            >
              {camelToHumanText(account?.verboseStatus ?? "")}
            </IntroSection.Item>

            {owners && (
              <IntroSection.Item
                prefix={t(
                  "screens.Dashboard.Accounts.AccountDetails.owners.prefix"
                )}
                title={t(
                  "screens.Dashboard.Accounts.AccountDetails.owners.title"
                )}
              >
                {owners}
              </IntroSection.Item>
            )}

            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.Accounts.AccountDetails.accountId.prefix"
              )}
              title={t(
                "screens.Dashboard.Accounts.AccountDetails.accountId.title"
              )}
            >
              <span className="flex items-center gap-2 group group/clip">
                <span className="flex items-center gap-2 group group/clip">
                  {account?.id}
                  <CopyToClipboard text={account?.id ?? ""} groupHidden />
                </span>
              </span>
            </IntroSection.Item>
          </div>
        </DetailsBox.Content>
      </DetailsBox>

      {includeInvitationsFeature && (
        <DetailsBox
          open={openedSection === OpenedSection.Invitations}
          onToggle={(state) =>
            handleToggleSection(OpenedSection.Invitations, state)
          }
        >
          <DetailsBox.Summary>
            <Typography as="span">
              {t("screens.Dashboard.Accounts.AccountDetails.invitations")}
            </Typography>
          </DetailsBox.Summary>

          {openedSection === OpenedSection.Invitations && (
            <DetailsBox.Content minHeight="50">
              {tenantInfo?.id && account && (
                <div className="flex flex-col gap-1">
                  <AccountInvitations
                    account={account}
                    tenantId={tenantInfo?.id}
                    setCurrentGuestUser={handleOpenUnInviteModal}
                  />
                </div>
              )}
            </DetailsBox.Content>
          )}
        </DetailsBox>
      )}

      <DetailsBox
        open={openedSection === OpenedSection.AdvancedActions}
        onToggle={(state) =>
          handleToggleSection(OpenedSection.AdvancedActions, state)
        }
      >
        <DetailsBox.Summary>
          <Typography as="span">
            {t("screens.Dashboard.Accounts.AccountDetails.advancedActions")}
          </Typography>
        </DetailsBox.Summary>

        <DetailsBox.Content minHeight="50">
          {includeInvitationsFeature && (
            <Banner intent="info">
              <div className="flex justify-between gap-2 my-5">
                <div className="flex flex-col gap-2">
                  <Typography as="span">
                    {t(
                      "screens.Dashboard.Accounts.AccountDetails.invite.title"
                    )}
                  </Typography>

                  <Typography as="small" decoration="smooth" width="sm">
                    {t(
                      "screens.Dashboard.Accounts.AccountDetails.invite.description"
                    )}
                  </Typography>
                </div>

                <div>
                  <Button
                    rounded
                    onClick={() => setIsGuestToAccountModalOpen(true)}
                  >
                    {t(
                      "screens.Dashboard.Accounts.AccountDetails.invite.button"
                    )}
                  </Button>
                </div>
              </div>
            </Banner>
          )}

          <Banner intent="info">
            <div className="flex justify-between gap-2 my-5">
              <div className="flex flex-col gap-2">
                <Typography as="span">
                  {t("screens.Dashboard.Accounts.AccountDetails.edit.title")}
                </Typography>

                <Typography as="small" decoration="smooth" width="sm">
                  {t(
                    "screens.Dashboard.Accounts.AccountDetails.edit.description"
                  )}
                </Typography>
              </div>

              <div>
                <Button rounded onClick={() => setIsEditModalOpen(true)}>
                  {t("screens.Dashboard.Accounts.AccountDetails.edit.button")}
                </Button>
              </div>
            </div>
          </Banner>

          {typeof account?.accountType === "string" && (
            <Banner intent="info">
              <div className="flex justify-between gap-2 my-5">
                <div className="flex flex-col gap-2">
                  <Typography as="span">
                    {t(
                      "screens.Dashboard.Accounts.AccountDetails.upgradeOrDowngrade.title"
                    )}
                  </Typography>

                  <Typography as="small" decoration="smooth" width="sm">
                    {t(
                      "screens.Dashboard.Accounts.AccountDetails.upgradeOrDowngrade.description"
                    )}
                    <ul className="list-disc list-inside mt-2">
                      {["user", "staff", "manager"]
                        .filter((status) => status !== account?.accountType)
                        .map((status) => (
                          <li key={status}>{camelToHumanText(status)}</li>
                        ))}
                    </ul>
                  </Typography>
                </div>

                <div>
                  <Button
                    rounded
                    onClick={() => setIsUpgradeOrDowngradeModalOpen(true)}
                  >
                    {t(
                      "screens.Dashboard.Accounts.AccountDetails.upgradeOrDowngrade.button"
                    )}
                  </Button>
                </div>
              </div>
            </Banner>
          )}

          {(
            (typeof account?.accountType !== "string") || 
            (!["user", "staff", "manager"].includes(account?.accountType ?? ""))
          ) && (
            <Banner intent="error">
            <div className="flex justify-between gap-2 my-5">
              <div className="flex flex-col gap-2">
                <Typography as="span">
                  {t("screens.Dashboard.Accounts.AccountDetails.delete.title")}
                </Typography>

                <Typography as="small" decoration="smooth" width="sm">
                  {t(
                    "screens.Dashboard.Accounts.AccountDetails.delete.description"
                  )}
                </Typography>
              </div>

              <div>
                <Button
                  rounded
                  intent="danger"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  {t("screens.Dashboard.Accounts.AccountDetails.delete.button")}
                </Button>
              </div>
            </div>
          </Banner>
          )}
        </DetailsBox.Content>
      </DetailsBox>

      {tenantInfo?.id && account && (
        <DeleteAccount
          account={account}
          tenantId={tenantInfo?.id}
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
        />
      )}

      {account && (
        <GuestToAccountModal
          isOpen={isGuestToAccountModalOpen}
          onClose={handleCloseGuestToAccountModal}
          account={account}
        />
      )}

      {isEditModalOpen && account?.id && (
        <EditAccountModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          account={account}
          accountId={account.id}
          onSuccess={handleSuccess}
        />
      )}

      {isUpgradeOrDowngradeModalOpen && account?.id && (
        <UpgradeOrDowngradeAccountModal
          isOpen={isUpgradeOrDowngradeModalOpen}
          onClose={handleCloseUpgradeOrDowngradeModal}
          account={account}
          accountId={account.id}
          onSuccess={handleSuccess}
        />
      )}

      {account?.id && currentGuestUser && (
        <UnInviteGuestModal
          guestUser={currentGuestUser}
          accountId={account.id}
          isOpen={isUnInviteModalOpen}
          onClose={handleCloseUnInviteModal}
        />
      )}
    </SideCurtain>
  );
}
