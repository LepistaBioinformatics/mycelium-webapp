import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import useSWR from "swr";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import isPrivilegedAccount from "@/functions/is-privileged-account";
import { accountsGet } from "@/services/rpc/beginners";
import { components } from "@/services/openapi/mycelium-schema";
import { ActiveTab } from "@/screens/Dashboard/components/Profile/active-tab";

type Account = components["schemas"]["Account"];

function isContactInfoComplete(account: Account | null | undefined): boolean {
  if (!account) return false;
  if (!account.name) return false;

  const meta = (account.meta ?? {}) as Record<string, string>;

  return !!(
    meta.phone_number &&
    meta.emergency_contact_name &&
    meta.emergency_contact_phone &&
    meta.job_title
  );
}

export default function RequiredContactInfoBanner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, getAccessTokenSilently } = useProfile();

  const shouldFetch = isPrivilegedAccount(profile);

  const { data: account } = useSWR<Account | null>(
    shouldFetch ? "rpc:beginners.accounts.get" : null,
    () => accountsGet(getAccessTokenSilently),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  if (!shouldFetch) return null;
  if (isContactInfoComplete(account)) return null;

  const BASE = "components.RequiredContactInfoBanner";

  return (
    <div className="px-3 pt-3">
      <Banner intent="warning" boxed={false} title={t(`${BASE}.title`)}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Typography as="span" decoration="smooth" width="md">
            {t(`${BASE}.description`)}
          </Typography>

          <Button
            size="sm"
            onClick={() =>
              navigate(`/dashboard/profile?tab=${ActiveTab.ContactInfo}`)
            }
          >
            {t(`${BASE}.button`)}
          </Button>
        </div>
      </Banner>
    </div>
  );
}
