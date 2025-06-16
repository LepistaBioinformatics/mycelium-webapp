import Button from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";
import IntroSection from "@/components/ui/IntroSection";
import Modal from "@/components/ui/Modal";
import Typography from "@/components/ui/Typography";
import { TENANT_ID_HEADER } from "@/constants/http-headers";
import formatEmail from "@/functions/format-email";
import useProfile from "@/hooks/use-profile";
import useSuspenseError from "@/hooks/use-suspense-error";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { RootState } from "@/states/store";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

type GuestUser = components["schemas"]["GuestUser"];

interface Props {
  guestUser: GuestUser;
  accountId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function UnInviteGuestModal({ guestUser, accountId, isOpen, onClose }: Props) {
  const { getAccessTokenSilently } = useProfile({
    roles: [MycRole.SubscriptionsManager],
    permissions: [MycPermission.Write],
    restrictSystemAccount: true,
  });

  const { parseHttpError } = useSuspenseError();

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const guestRole = useMemo(() => {
    if (!guestUser.guestRole) return null;
    if (typeof guestUser.guestRole !== "object") return null;

    if ("record" in guestUser.guestRole) return guestUser.guestRole.record;

    return null;
  }, [guestUser.guestRole]);

  const localInvitationRecord: string | null | undefined = useMemo(() => {
    if (!guestUser.guestRole) return null;
    if (typeof guestUser.guestRole !== "object") return null;

    if ("record" in guestUser.guestRole) return guestUser.guestRole.record.id;
    if ("id" in guestUser.guestRole) return guestUser.guestRole.id;

    return null;
  }, [guestUser.guestRole]);

  const onSubmit = async () => {
    setIsSubmitting(true);

    const email = formatEmail(guestUser.email);

    if (!localInvitationRecord) {
      setIsSubmitting(false);
      throw new Error("Failed to uninvite guest");
    }

    if (!email) {
      setIsSubmitting(false);
      throw new Error("Failed to uninvite guest");
    }

    const token = await getAccessTokenSilently();

    const response = await fetch(
      buildPath("/adm/rs/subscriptions-manager/guests/accounts/{account_id}/roles/{role_id}", {
        path: { account_id: accountId, role_id: localInvitationRecord },
        query: { email }
      }),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          [TENANT_ID_HEADER]: tenantInfo?.id ?? "",
        },
      });

    if (!response.ok) {
      parseHttpError(response);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onClose();
  }

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography as="h4">Uninvite user</Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-2 w-full pt-5 px-1">
          <IntroSection
            content="Are you sure you want to uninvite user?"
            title="Uninvite user"
            as="h3"
          >
            <Divider style="invisible" />

            <IntroSection.Item
              prefix="email"
              title="Email"
            >
              {formatEmail(guestUser.email)}
            </IntroSection.Item>

            <IntroSection.Item
              prefix="role"
              title="Role"
            >
              {guestRole?.name}
            </IntroSection.Item>
          </IntroSection>

          <div className="mt-12">
            <Button
              intent="danger"
              rounded
              fullWidth
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Uninviting..." : "Uninvite"}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
