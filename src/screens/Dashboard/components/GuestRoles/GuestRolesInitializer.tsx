import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import useSuspenseError from "@/hooks/use-suspense-error";
import { guestRolesCreateSystemRoles } from "@/services/rpc/managers";
import { Bot } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const PREFIX = "screens.Dashboard.GuestRoles.initializer";

// Mirrors the actors of the gateway's `create_system_roles` use case
// (core/src/use_cases/super_users/managers/guest_role/create_system_roles.rs)
const SYSTEM_ROLES = [
  "Subscriptions Manager",
  "Users Manager",
  "Account Manager",
  "Guests Manager",
  "Gateway Manager",
  "System Manager",
  "Tenant Manager",
];

interface Props {
  onSuccess: () => void;
}

/**
 * Header action (managers only) that creates the gateway's built-in guest
 * roles. The gateway gets-or-creates each one, so running it again is safe.
 */
export default function GuestRolesInitializer({ onSuccess }: Props) {
  const { t } = useTranslation();

  const { profile, isLoadingUser, getAccessTokenSilently } = useProfile();

  const { parseHttpError, dispacheSuccess } = useSuspenseError();

  const [isOpen, setIsOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleInitialize = async () => {
    setIsLoading(true);

    try {
      await guestRolesCreateSystemRoles(getAccessTokenSilently);
      dispacheSuccess(t(`${PREFIX}.success`));
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      parseHttpError(err as Response);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingUser || !profile?.isManager) return null;

  return (
    <>
      <Button
        size="sm"
        intent="secondary"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="size-4" />
        {t(`${PREFIX}.button`)}
      </Button>

      <Modal open={isOpen}>
        <Modal.Header handleClose={() => setIsOpen(false)}>
          <Typography>{t(`${PREFIX}.title`)}</Typography>
        </Modal.Header>

        <Modal.Body>
          <div className="flex w-full flex-col gap-4">
            <Typography as="p" decoration="smooth">
              {t(`${PREFIX}.description`)}
            </Typography>

            <ul className="flex flex-wrap gap-2">
              {SYSTEM_ROLES.map((role) => (
                <li
                  key={role}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 text-sm"
                >
                  <Bot className="size-3.5 text-brand-600 dark:text-brand-300" />
                  {role}
                </li>
              ))}
            </ul>

            <Typography as="small" decoration="smooth">
              {t(`${PREFIX}.idempotent`)}
            </Typography>

            <div className="flex justify-end gap-3">
              <Button
                intent="secondary"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                {t(`${PREFIX}.cancel`)}
              </Button>
              <Button onClick={handleInitialize} disabled={isLoading}>
                {isLoading ? <Spinner /> : t(`${PREFIX}.confirm`)}
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
