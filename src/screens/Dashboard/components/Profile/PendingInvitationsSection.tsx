import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PermissionBadge from "@/components/ui/PermissionBadge";
import Typography from "@/components/ui/Typography";
import { describeError } from "@/functions/describe-error";
import { PendingInvitation } from "@/functions/list-pending-invitations";
import usePendingInvitations, {
  markInvitationAccepted,
} from "@/hooks/use-pending-invitations";
import useProfile, { invalidateProfile } from "@/hooks/use-profile";
import useSuspenseError from "@/hooks/use-suspense-error";
import useTenantName from "@/hooks/use-tenant-name";
import { guestsAcceptInvitation } from "@/services/rpc/beginners";
import { MycPermission } from "@/types/MyceliumPermission";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const PREFIX = "screens.Dashboard.PendingInvitationsSection";

function InvitationItem({
  invitation,
  onAccepted,
}: {
  invitation: PendingInvitation;
  onAccepted: () => void;
}) {
  const { t } = useTranslation();
  const { getAccessTokenSilently } = useProfile();
  const { dispatchError } = useSuspenseError();
  const tenantName = useTenantName(invitation.tenantId);
  const [busy, setBusy] = useState(false);

  const accept = async () => {
    setBusy(true);
    try {
      await guestsAcceptInvitation(
        {
          accountId: invitation.accountId,
          guestRoleName: invitation.role,
          permission: invitation.permission === MycPermission.Write ? 1 : 0,
        },
        getAccessTokenSilently
      );
      markInvitationAccepted(invitation.key);
      onAccepted();
      await invalidateProfile();
    } catch (err) {
      dispatchError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <li
      data-cy="pending-invitation"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-xs"
    >
      <div className="flex flex-col gap-2 min-w-0">
        <span className="font-display text-lg font-semibold text-primary dark:text-brand-300 truncate">
          {invitation.accountName}
        </span>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>
            {t(`${PREFIX}.tenant`)}: {tenantName ?? invitation.tenantId}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5">
            <span className="font-mono text-xs text-foreground">
              {invitation.role}
            </span>
            <PermissionBadge permission={invitation.permission} />
          </span>
        </div>
      </div>

      <Button size="sm" onClick={accept} disabled={busy}>
        <MailCheck className="size-4" />
        {busy ? t(`${PREFIX}.accepting`) : t(`${PREFIX}.accept`)}
      </Button>
    </li>
  );
}

export default function PendingInvitationsSection() {
  const { t } = useTranslation();
  const { invitations, isLoading } = usePendingInvitations();
  const [acceptedCount, setAcceptedCount] = useState(0);

  return (
    <Card padding="sm" width="alwaysFull" height="fit">
      <Card.Header>
        <Typography as="h5" decoration="faded">
          {t(`${PREFIX}.title`)}
        </Typography>
      </Card.Header>

      <Card.Body width="full">
        <div className="flex flex-col gap-4 w-full">
          {acceptedCount > 0 && (
            <Banner intent="success" boxed={false}>
              {t(`${PREFIX}.accepted`)}
            </Banner>
          )}

          {!isLoading && invitations.length === 0 ? (
            <div className="flex flex-col gap-2 py-4">
              <Typography decoration="smooth">{t(`${PREFIX}.empty`)}</Typography>
              <Typography as="small" decoration="smooth" width="xs">
                {t(`${PREFIX}.emptyDescription`)}
              </Typography>
            </div>
          ) : (
            <>
              <Typography as="small" decoration="smooth">
                {t(`${PREFIX}.description`)}
              </Typography>
              <ul className="flex flex-col gap-2 w-full">
                {invitations.map((invitation) => (
                  <InvitationItem
                    key={invitation.key}
                    invitation={invitation}
                    onAccepted={() => setAcceptedCount((n) => n + 1)}
                  />
                ))}
              </ul>
            </>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
