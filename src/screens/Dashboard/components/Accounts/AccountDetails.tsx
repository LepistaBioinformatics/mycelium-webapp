"use client";

import SideCurtain from "@/components/ui/SideCurtain";
import Typography from "@/components/ui/Typography";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import useProfile from "@/hooks/use-profile";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { Fragment, useMemo, useState } from "react";
import useSWR from "swr";
import DeleteAccount from "./DeleteAccount";
import { RootState } from "@/states/store";
import { TENANT_ID_HEADER } from "@/constants/http-headers";
import { camelToHumanText } from "@/functions/camel-to-human-text";
import { useSelector } from "react-redux";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import GuestToAccountModal from "./GuestToAccountModal";
import formatEmail from "@/functions/format-email";
import PermissionIcon from "@/components/ui/PermissionIcon";
import DetailsBox from "@/components/ui/DetailsBox";
import EditAccountModal from "./EditAccountModal";
import UnInviteGuestModal from "./UnInviteGuestModal";

type Account = components["schemas"]["Account"];
type GuestUser = components["schemas"]["GuestUser"];
type GuestRole = components["schemas"]["GuestRole"];

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isGuestToAccountModalOpen, setIsGuestToAccountModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { profile, getAccessTokenSilently } = useProfile();

  const [openedSection, setOpenedSection] = useState<OpenedSection>(OpenedSection.Details);

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const handleToggleSection = (section: OpenedSection, state: "open" | "closed") => {
    if (state === "open") setOpenedSection(section);
  }

  const handleCloseGuestToAccountModal = () => {
    setIsGuestToAccountModalOpen(false);
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    mutateAccount(account, { rollbackOnError: true });
  }

  const handleSuccess = () => {
    handleCloseEditModal();
  }

  const { data: account, mutate: mutateAccount } = useSWR<Account>(
    buildPath("/adm/rs/subscriptions-manager/accounts/{account_id}", {
      path: { account_id: accountId }
    }),
    async (url: string) => {
      const token = await getAccessTokenSilently();

      return fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          [TENANT_ID_HEADER]: tenantInfo?.id ?? ""
        }
      })
        .then((res) => res.json())
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

  const owners = useMemo(() => {
    if (!account) return null;
    if (typeof account.owners !== "object") return null;

    if ("ids" in account.owners) {
      const accountOwners = account.owners.ids;

      if (accountOwners.includes(
        profile?.owners.find((owner) => owner.isPrincipal)?.id ?? ""
      )) {

        if (accountOwners.length === 1) {
          return "You";
        } else {
          return <>You and {accountOwners.length - 1} other</>
        }
      };

      return null;
    }
  }, [account, profile?.owners]);

  return (
    <SideCurtain
      open={isOpen}
      title="Account details"
      handleClose={onClose}
    >
      <div>
        <Typography as="span" decoration="smooth">Name</Typography>
        <Typography as="h2">{account?.name}</Typography>
      </div>

      <DetailsBox
        open={openedSection === OpenedSection.Details}
        onToggle={(state) => handleToggleSection(OpenedSection.Details, state)}
      >
        <DetailsBox.Summary>
          <Typography as="span">
            Details
          </Typography>
        </DetailsBox.Summary>

        <DetailsBox.Content minHeight="30">
          <div className="flex flex-col gap-8">
            <div>
              <Typography as="span" decoration="smooth">Created</Typography>
              <Typography as="p">{formatDDMMYY(new Date(account?.created ?? ""), true)}</Typography>
            </div>

            <div>
              <Typography as="span" decoration="smooth">Status</Typography>
              <Typography as="p">{camelToHumanText(account?.verboseStatus ?? "")}</Typography>
            </div>

            {owners && (
              <div>
                <Typography as="span" decoration="smooth">Owners</Typography>
                <Typography as="p">{owners}</Typography>
              </div>
            )}
          </div>
        </DetailsBox.Content>
      </DetailsBox>

      <DetailsBox
        open={openedSection === OpenedSection.Invitations}
        onToggle={(state) => handleToggleSection(OpenedSection.Invitations, state)}
      >
        <DetailsBox.Summary>
          <Typography as="span">
            Invitations
          </Typography>
        </DetailsBox.Summary>

        {openedSection === OpenedSection.Invitations && (
          <DetailsBox.Content minHeight="50">
            {tenantInfo?.id && account && (
              <div className="flex flex-col gap-1">
                <Typography as="span" decoration="smooth">Invitations</Typography>
                <Invitations account={account} tenantId={tenantInfo?.id} />
              </div>
            )}
          </DetailsBox.Content>
        )}
      </DetailsBox>

      <DetailsBox
        open={openedSection === OpenedSection.AdvancedActions}
        onToggle={(state) => handleToggleSection(OpenedSection.AdvancedActions, state)}
      >
        <DetailsBox.Summary>
          <Typography as="span">
            Advanced actions
          </Typography>
        </DetailsBox.Summary>

        <DetailsBox.Content minHeight="50">
          <Banner intent="info">
            <div className="flex justify-between gap-2 my-5">
              <div className="flex flex-col gap-2">
                <Typography as="span">
                  Invite user to account
                </Typography>

                <Typography as="small" decoration="smooth">
                  Guest users should be invited to the account with specific role.
                </Typography>
              </div>

              <div>
                <Button
                  rounded
                  onClick={() => setIsGuestToAccountModalOpen(true)}
                >
                  Invite
                </Button>
              </div>
            </div>
          </Banner>

          <Banner intent="info">
            <div className="flex justify-between gap-2 my-5">
              <div className="flex flex-col gap-2">
                <Typography as="span">
                  Edit account name
                </Typography>

                <Typography as="small" decoration="smooth">
                  Edit the account name.
                </Typography>
              </div>

              <div>
                <Button
                  rounded
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit
                </Button>
              </div>
            </div>
          </Banner>

          <Banner intent="error">
            <div className="flex justify-between gap-2 my-5">
              <div className="flex flex-col gap-2">
                <Typography as="span">
                  Delete account
                </Typography>

                <Typography as="small" decoration="smooth">
                  This action cannot be undone.
                </Typography>
              </div>

              <div>
                <Button
                  rounded
                  intent="danger"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Banner>
        </DetailsBox.Content>
      </DetailsBox>

      {tenantInfo?.id && account && (
        <DeleteAccount
          account={account}
          tenantId={tenantInfo?.id}
          isOpen={isDeleteModalOpen}
          onClose={onClose}
        />
      )}

      {account && (
        <GuestToAccountModal
          isOpen={isGuestToAccountModalOpen}
          onClose={handleCloseGuestToAccountModal}
          account={account}
        />
      )}

      {isEditModalOpen && account && (
        <EditAccountModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          account={account}
          onSuccess={handleSuccess}
        />
      )}
    </SideCurtain>
  )
}

/**
 * Invitations
 * 
 * @param account - The account
 * @param tenantId - The tenant id
 * @returns The invitations component
 */
function Invitations({ account, tenantId }: { account: Account, tenantId: string }) {
  const pageSize = 2;
  const [showMaxInvitations, setShowMaxInvitations] = useState<boolean>(false);
  const [isUnInviteModalOpen, setIsUnInviteModalOpen] = useState<boolean>(false);

  const { getAccessTokenSilently } = useProfile();

  const memoizedUrl = useMemo(() => {
    if (!account.id || !tenantId) return null;

    const { accountType } = account;

    if (typeof accountType !== "object") return null;

    if (
      ("subscription" in accountType) ||
      ("tenantManager" in accountType) ||
      ("roleAssociated" in accountType) ||
      ("actorAssociated" in accountType)
    ) {
      return buildPath("/adm/rs/subscriptions-manager/guests/accounts/{account_id}", {
        path: { account_id: account.id }
      });
    };

    return null;
  }, [account.id, account.accountType, tenantId]);

  const {
    data: invitations,
    mutate: mutateInvitations,
    isLoading
  } = useSWR<GuestUser[]>(
    memoizedUrl,
    async (url: string) => {
      if (!tenantId) return null;

      const token = await getAccessTokenSilently();

      return fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          [TENANT_ID_HEADER]: tenantId
        }
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch invitations");
          }

          return res.json();
        })
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

  const handleCloseUnInviteModal = () => {
    setIsUnInviteModalOpen(false);
    mutateInvitations(invitations, { rollbackOnError: true });
  }

  if (isLoading) return <div>Loading...</div>;

  if (!invitations || invitations.length === 0) return (
    <div>No invitations found</div>
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        {invitations
          ?.slice(0, showMaxInvitations ? invitations.length : pageSize)
          ?.map((invitation) => (
            <Fragment key={invitation.id} >
              <div className="flex flex-col gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow w-full px-4 py-1 rounded-lg">
                <Typography as="h4">
                  <div className="flex justify-between gap-2 items-center">
                    {formatEmail(invitation.email)}
                    <Typography as="small" decoration="smooth">
                      {invitation.wasVerified ? "Verified" : "Unverified"}
                    </Typography>
                  </div>
                </Typography>
                <Invitation guestRole={invitation.guestRole} />
                <Typography as="span" decoration="smooth">
                  {formatDDMMYY(new Date(invitation.created), true)}
                </Typography>

                <DetailsBox>
                  <DetailsBox.Summary>
                    <Typography as="span">
                      Actions
                    </Typography>
                  </DetailsBox.Summary>

                  <DetailsBox.Content>
                    <Banner intent="warning">
                      <div className="flex justify-between gap-2 my-5">
                        <div className="flex flex-col gap-2">
                          <Typography as="span">
                            Uninvite user
                          </Typography>

                          <Typography as="small" decoration="smooth">
                            Uninvite a user from the account.
                          </Typography>
                        </div>

                        <div>
                          <Button
                            rounded
                            intent="warning"
                            onClick={() => setIsUnInviteModalOpen(true)}
                          >
                            Uninvite
                          </Button>
                        </div>
                      </div>
                    </Banner>
                  </DetailsBox.Content>
                </DetailsBox>
              </div>

              {account.id && (
                <UnInviteGuestModal
                  guestUser={invitation}
                  accountId={account.id}
                  isOpen={isUnInviteModalOpen}
                  onClose={handleCloseUnInviteModal}
                />
              )}
            </Fragment>
          ))}
      </div>

      {invitations.length > pageSize && (
        <div className="flex justify-center">
          {showMaxInvitations
            ? (
              <Button
                rounded
                fullWidth
                intent="link"
                size="xs"
                onClick={() => setShowMaxInvitations(false)}
              >
                <Typography as="small" decoration="underline">Show less</Typography>
              </Button>
            )
            : (
              <Button
                rounded
                fullWidth
                intent="link"
                size="xs"
                onClick={() => setShowMaxInvitations(true)}
              >
                <Typography as="small" decoration="underline">Show all</Typography>
              </Button>
            )}
        </div>
      )}
    </div>
  )
}

/**
 * Invitation
 * 
 * @param guestRole - The guest role of the invitation
 * @returns The invitation component
 */
function Invitation({ guestRole }: { guestRole: GuestUser["guestRole"] }) {
  const { getAccessTokenSilently } = useProfile();
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
      return buildPath("/adm/rs/subscriptions-manager/guest-roles/{id}", {
        path: { id: localInvitationRecord }
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
          [TENANT_ID_HEADER]: tenantInfo?.id ?? ""
        }
      })
        .then((res) => res.json())
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
    if (typeof localInvitationRecord === "object" && localInvitationRecord !== null) {
      return localInvitationRecord;
    };

    //
    // Otherwise, if the remote invitation record is an object, return it
    //
    // The remote invitation record is an object indicates that the invitation
    // has been correctly fetched from the remote API.
    //
    if (typeof remoteInvitationRecord === "object") return remoteInvitationRecord;

    //
    // Otherwise, return undefined
    //
    // This indicates that the invitation record is not found.
    //
    return undefined;
  }, [localInvitationRecord, remoteInvitationRecord]);

  if (!invitationRecord) return null;

  return (
    <Typography as="h4">
      <div className="flex flex-col gap-1">
        <div className="flex gap-2">
          <Typography as="span" decoration="smooth">
            As:
          </Typography>
          <Typography as="span">
            {invitationRecord.name}
          </Typography>
          <Typography as="span">
            <PermissionIcon permission={invitationRecord.permission} />
          </Typography>
        </div>
        <Typography as="small" decoration="smooth">
          {invitationRecord.description}
        </Typography>
      </div>
    </Typography>
  )
}
