import CopyToClipboard from "@/components/ui/CopyToClipboard";
import IntroSection from "@/components/ui/IntroSection";
import ListItem from "@/components/ui/ListItem";
import formatEmail from "@/functions/format-email";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import { guestsListLicensedAccountsOfEmail } from "@/services/rpc/subscriptionsManager";
import { RootState } from "@/states/store";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import useSWR from "swr";

type Email = components["schemas"]["Email"];
type LicensedResource = components["schemas"]["LicensedResource"];

interface Props {
  email: Email;
}

export default function GuestsByEmail({ email }: Props) {
  const { t } = useTranslation();

  const formattedEmail = useMemo(() => formatEmail(email), [email]);

  const { getAccessTokenSilently } = useProfile();

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const swrKey = useMemo(() => {
    if (!formattedEmail) return null;
    if (!tenantInfo?.id) return null;

    return `rpc:subscriptionsManager.guests.listLicensedAccountsOfEmail:${formattedEmail}:${tenantInfo.id}`;
  }, [formattedEmail, tenantInfo?.id]);

  const { data } = useSWR<LicensedResource[]>(
    swrKey,
    async () =>
      guestsListLicensedAccountsOfEmail(
        { email: formattedEmail!, tenantId: tenantInfo!.id! },
        getAccessTokenSilently
      )
  );

  return (
    <div className="flex flex-col gap-3">
      {data
        ?.sort((a, b) => a.accName.localeCompare(b.accName))
        ?.map((guest, index) => (
          <ListItem key={index}>
            <IntroSection content={guest.accName} as="h3">
              <IntroSection.Item
                prefix={t(
                  "screens.Dashboard.Accounts.AccountDetails.inAccount.prefix"
                )}
                title={t(
                  "screens.Dashboard.Accounts.AccountDetails.inAccount.title"
                )}
              >
                {guest.accName}
              </IntroSection.Item>

              <IntroSection.Item
                prefix={t(
                  "screens.Dashboard.Accounts.AccountDetails.inTenant.prefix"
                )}
                title={t(
                  "screens.Dashboard.Accounts.AccountDetails.inTenant.title"
                )}
              >
                {tenantInfo?.name}
              </IntroSection.Item>

              <IntroSection.Item
                prefix={t(
                  "screens.Dashboard.Accounts.AccountDetails.withRole.prefix"
                )}
                title={t(
                  "screens.Dashboard.Accounts.AccountDetails.withRole.title"
                )}
              >
                {guest.role}
                <CopyToClipboard text={guest.role} inline size="sm" />
              </IntroSection.Item>

              <IntroSection.Item
                prefix={t(
                  "screens.Dashboard.Accounts.AccountDetails.withPermission.prefix"
                )}
                title={t(
                  "screens.Dashboard.Accounts.AccountDetails.withPermission.title"
                )}
              >
                {guest.perm.toUpperCase()}
              </IntroSection.Item>
            </IntroSection>
          </ListItem>
        ))}
    </div>
  );
}
