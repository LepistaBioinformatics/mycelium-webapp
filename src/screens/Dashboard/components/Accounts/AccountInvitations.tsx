import { GoUnverified } from "react-icons/go";
import Typography from "@/components/ui/Typography";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import useProfile from "@/hooks/use-profile";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { Fragment, useMemo, useState } from "react";
import useSWR from "swr";
import { RootState } from "@/states/store";
import { TENANT_ID_HEADER } from "@/constants/http-headers";
import { useSelector } from "react-redux";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import formatEmail from "@/functions/format-email";
import PermissionIcon from "@/components/ui/PermissionIcon";
import DetailsBox from "@/components/ui/DetailsBox";
import useSuspenseError from "@/hooks/use-suspense-error";
import PaginatedRecords from "@/types/PaginatedRecords";
import IntroSection from "@/components/ui/IntroSection";
import { useTranslation } from "react-i18next";
import ListItem from "@/components/ui/ListItem";

type Account = components["schemas"]["Account"];
type GuestUser = components["schemas"]["GuestUser"];
type GuestRole = components["schemas"]["GuestRole"];

interface Props {
  account: Account;
  tenantId: string;
  setCurrentGuestUser: (guestUser: GuestUser) => void;
}

/**
 * Invitations
 *
 * @param account - The account object
 * @param tenantId - The tenant id
 * @returns The invitations component
 */
export default function AccountInvitations({
  account,
  tenantId,
  setCurrentGuestUser,
}: Props) {
  const { t } = useTranslation();

  const pageSize = 2;
  const [showMaxInvitations, setShowMaxInvitations] = useState<boolean>(false);

  const { getAccessTokenSilently } = useProfile();

  const { parseHttpError } = useSuspenseError();

  const memoizedUrl = useMemo(() => {
    if (!account.id || !tenantId) return null;

    const { accountType } = account;

    if (typeof accountType !== "object") return null;

    if (
      "subscription" in accountType ||
      "tenantManager" in accountType ||
      "roleAssociated" in accountType ||
      "actorAssociated" in accountType
    ) {
      return buildPath(
        "/_adm/subscriptions-manager/guests/accounts/{account_id}",
        {
          path: { account_id: account.id },
        }
      );
    }

    return null;
  }, [account.id, account.accountType, tenantId]);

  const { data: invitations, isLoading } = useSWR<PaginatedRecords<GuestUser>>(
    memoizedUrl,
    async (url: string) => {
      if (!tenantId) return null;

      const token = await getAccessTokenSilently();

      return fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          [TENANT_ID_HEADER]: tenantId,
        },
      })
        .then(parseHttpError)
        .catch((err) => {
          console.error(err);

          return null;
        });
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      refreshInterval: 1000 * 60,
    }
  );

  if (isLoading) return <div>Loading...</div>;

  if (!invitations || invitations.count === 0) {
    return (
      <Typography as="span" decoration="smooth">
        {t("screens.Dashboard.Accounts.AccountInvitations.noInvitations")}
      </Typography>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0">
        {invitations?.records
          ?.slice(0, showMaxInvitations ? invitations.count : pageSize)
          ?.map((invitation) => (
            <Fragment key={invitation.id}>
              <ListItem>
                <IntroSection
                  content={
                    <div className="flex flex-nowrap justify-between items-center mb-1">
                      {!invitation.wasVerified && (
                        <GoUnverified
                          className="text-red-500 mr-2"
                          title="Invitation was not verified by the guest user"
                        />
                      )}
                      <span>{formatEmail(invitation.email)}</span>
                    </div>
                  }
                  title={t(
                    "screens.Dashboard.Accounts.AccountInvitations.email.title"
                  )}
                  as="h4"
                >
                  <Invitation guestRole={invitation.guestRole}>
                    <IntroSection.Item
                      prefix={t(
                        "screens.Dashboard.Accounts.AccountInvitations.invitedAt.prefix"
                      )}
                      title={t(
                        "screens.Dashboard.Accounts.AccountInvitations.invitedAt.title"
                      )}
                    >
                      {formatDDMMYY(new Date(invitation.created), true)}
                    </IntroSection.Item>
                  </Invitation>
                </IntroSection>

                <DetailsBox>
                  <DetailsBox.Summary>
                    <Typography as="small">
                      {t(
                        "screens.Dashboard.Accounts.AccountInvitations.actions.title"
                      )}
                    </Typography>
                  </DetailsBox.Summary>

                  <DetailsBox.Content>
                    <Banner intent="warning">
                      <div className="flex justify-between gap-2 my-5">
                        <div className="flex flex-col gap-2">
                          <Typography as="span">
                            {t(
                              "screens.Dashboard.Accounts.AccountInvitations.actions.uninvite.title"
                            )}
                          </Typography>

                          <Typography as="small" decoration="smooth">
                            {t(
                              "screens.Dashboard.Accounts.AccountInvitations.actions.uninvite.desctiption"
                            )}
                          </Typography>
                        </div>

                        <div>
                          <Button
                            rounded
                            intent="warning"
                            onClick={() => setCurrentGuestUser(invitation)}
                          >
                            {t(
                              "screens.Dashboard.Accounts.AccountInvitations.actions.uninvite.confirm"
                            )}
                          </Button>
                        </div>
                      </div>
                    </Banner>
                  </DetailsBox.Content>
                </DetailsBox>
              </ListItem>
            </Fragment>
          ))}
      </div>

      {invitations.count > pageSize && (
        <div className="flex justify-center">
          {showMaxInvitations ? (
            <Button
              rounded
              fullWidth
              intent="link"
              size="xs"
              onClick={() => setShowMaxInvitations(false)}
            >
              <Typography as="small" decoration="underline">
                {t("screens.Dashboard.Accounts.AccountInvitations.showLess")}
              </Typography>
            </Button>
          ) : (
            <Button
              rounded
              fullWidth
              intent="link"
              size="xs"
              onClick={() => setShowMaxInvitations(true)}
            >
              <Typography as="small" decoration="underline">
                {t("screens.Dashboard.Accounts.AccountInvitations.showAll")}
              </Typography>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Invitation
 *
 * @param guestRole - The guest role of the invitation
 * @returns The invitation component
 */
function Invitation({
  guestRole,
  children,
}: { guestRole: GuestUser["guestRole"] } & BaseProps) {
  const { t } = useTranslation();

  const { getAccessTokenSilently } = useProfile();

  const { parseHttpError } = useSuspenseError();

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const localInvitationRecord: GuestRole | string | null = useMemo(() => {
    if (!guestRole) return null;
    if (typeof guestRole !== "object") return null;

    if ("record" in guestRole) return guestRole.record;
    if ("id" in guestRole) return guestRole.id;

    return null;
  }, [guestRole]);

  const memoizedUrl = useMemo(() => {
    if (!localInvitationRecord) return null;
    if (typeof localInvitationRecord === "object") return null;
    if (!tenantInfo?.id) return null;

    if (typeof localInvitationRecord === "string") {
      return buildPath("/_adm/subscriptions-manager/guest-roles/{id}", {
        path: { id: localInvitationRecord },
      });
    }

    return null;
  }, [localInvitationRecord, tenantInfo?.id]);

  const { data: remoteInvitationRecord } = useSWR<GuestRole>(
    memoizedUrl,
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
    }
  );

  const invitationRecord: GuestRole | undefined = useMemo(() => {
    //
    // If the local invitation record is an object, return it
    //
    // The local invitation record is an object indicates that the invitation
    // has been self-contained in the invitation record as a guest role field.
    //
    if (
      typeof localInvitationRecord === "object" &&
      localInvitationRecord !== null
    ) {
      return localInvitationRecord;
    }

    //
    // Otherwise, if the remote invitation record is an object, return it
    //
    // The remote invitation record is an object indicates that the invitation
    // has been correctly fetched from the remote API.
    //
    if (typeof remoteInvitationRecord === "object")
      return remoteInvitationRecord;

    //
    // Otherwise, return undefined
    //
    // This indicates that the invitation record is not found.
    //
    return undefined;
  }, [localInvitationRecord, remoteInvitationRecord]);

  if (!invitationRecord) return null;

  return (
    <>
      <IntroSection.Item
        prefix={t("screens.Dashboard.Accounts.AccountInvitations.role.title", {
          roleDescription: invitationRecord.description,
        })}
        title={t("screens.Dashboard.Accounts.AccountInvitations.role.prefix", {
          roleDescription: invitationRecord.description,
        })}
      >
        {invitationRecord.name}
      </IntroSection.Item>

      {children}

      <IntroSection.Item
        prefix={t(
          "screens.Dashboard.Accounts.AccountInvitations.permission.prefix"
        )}
        title={t(
          "screens.Dashboard.Accounts.AccountInvitations.permission.title"
        )}
      >
        <PermissionIcon permission={invitationRecord.permission} />
      </IntroSection.Item>
    </>
  );
}
