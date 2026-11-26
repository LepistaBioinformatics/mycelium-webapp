import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import Typography from "@/components/ui/Typography";
import usePendingInvitations from "@/hooks/use-pending-invitations";
import { ActiveTab } from "@/screens/Dashboard/components/Profile/active-tab";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useSearchParams } from "react-router";

const BASE = "components.PendingInvitationsBanner";

export default function PendingInvitationsBanner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { invitations } = usePendingInvitations();

  const onInvitationsTab =
    pathname.endsWith("/dashboard/profile") &&
    searchParams.get("tab") === ActiveTab.Invitations;

  if (invitations.length === 0 || onInvitationsTab) return null;

  return (
    <div className="px-3 pt-3" data-cy="pending-invitations-banner">
      <Banner
        intent="info"
        boxed={false}
        title={t(`${BASE}.title`, { count: invitations.length })}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Typography as="span" decoration="smooth" width="md">
            {t(`${BASE}.description`)}
          </Typography>

          <Button
            size="sm"
            onClick={() =>
              navigate(`/dashboard/profile?tab=${ActiveTab.Invitations}`)
            }
          >
            {t(`${BASE}.button`)}
          </Button>
        </div>
      </Banner>
    </div>
  );
}
