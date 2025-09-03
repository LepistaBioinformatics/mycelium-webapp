import CopyToClipboard from "@/components/ui/CopyToClipboard";
import IntroSection from "@/components/ui/IntroSection";
import ListItem from "@/components/ui/ListItem";
import { TENANT_ID_HEADER } from "@/constants/http-headers";
import formatEmail from "@/functions/format-email";
import useProfile from "@/hooks/use-profile";
import useSuspenseError from "@/hooks/use-suspense-error";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
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

  const { parseHttpError } = useSuspenseError();

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const memoizedUrl = useMemo(() => {
    if (!formattedEmail) return null;
    if (!tenantInfo?.id) return null;

    return buildPath("/_adm/subscriptions-manager/guests", {
      query: { email: formattedEmail },
    });
  }, [formattedEmail, tenantInfo?.id]);

  const { data } = useSWR<LicensedResource[]>(
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
