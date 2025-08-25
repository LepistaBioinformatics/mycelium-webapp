import Modal from "@/components/ui/Modal";
import { AccountModalProps } from "./AccountModal";
import Typography from "@/components/ui/Typography";
import { useCallback, useMemo, useState } from "react";
import useProfile from "@/hooks/use-profile";
import Button from "@/components/ui/Button";
import { buildPath } from "@/services/openapi/mycelium-api";
import useSuspenseError from "@/hooks/use-suspense-error";
import { Spinner } from "flowbite-react";
import Countdown from "react-countdown";
import { useTranslation } from "react-i18next";

enum AllowedAccountTypes {
  User = "user",
  Manager = "manager",
  Staff = "staff",
}

enum AllowedActions {
  Upgrade = "upgrade",
  Downgrade = "downgrade",
}

interface Props extends Omit<AccountModalProps, "scope"> {}

export default function UpgradeOrDowngradeAccountModal({
  isOpen,
  onClose,
  onSuccess,
  account,
}: Props) {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);

  const { parseHttpError } = useSuspenseError();

  const { hasAdminPrivileges, getAccessTokenSilently } = useProfile();

  const currentAccountTypeNumeric = useMemo(() => {
    if (!account) return null;

    if (typeof account.accountType === "string") {
      return getNumericAccountType(account.accountType);
    }

    return null;
  }, [account]);

  const handleStatusUpdate = useCallback(
    async (accountType: AllowedAccountTypes, action: AllowedActions) => {
      setIsLoading(true);

      if (!hasAdminPrivileges) {
        setIsLoading(false);
        return;
      }

      const token = await getAccessTokenSilently();

      if (!token) {
        setIsLoading(false);
        return;
      }

      if (!account?.id) {
        setIsLoading(false);
        return;
      }

      const params = { path: { account_id: account.id } };
      const url =
        action === AllowedActions.Upgrade
          ? buildPath("/_adm/staffs/accounts/{account_id}/upgrade", params)
          : buildPath("/_adm/staffs/accounts/{account_id}/downgrade", params);

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: accountType }),
      });

      if (!response.ok) {
        setIsLoading(false);
        parseHttpError(response);
        return;
      }

      setIsLoading(false);
      onSuccess?.();
    },
    [
      hasAdminPrivileges,
      getAccessTokenSilently,
      account?.id,
      parseHttpError,
      onSuccess,
    ]
  );

  return (
    <Modal open={isOpen}>
      <Modal.Header handleClose={onClose}>
        <Typography>
          {t("screens.Dashboard.Accounts.UpgradeOrDowngradeAccountModal.title")}
        </Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-2 w-full">
          <Typography decoration="smooth">
            {t(
              "screens.Dashboard.Accounts.UpgradeOrDowngradeAccountModal.description"
            )}
          </Typography>

          {Object.values(AllowedAccountTypes).map((accountType) => {
            const isDisabled =
              currentAccountTypeNumeric === getNumericAccountType(accountType);

            const action =
              currentAccountTypeNumeric &&
              currentAccountTypeNumeric >= getNumericAccountType(accountType)
                ? AllowedActions.Downgrade
                : AllowedActions.Upgrade;

            const intent =
              action === AllowedActions.Upgrade ? "info" : "danger";

            return (
              <ConfirmButton
                confirm={() => handleStatusUpdate(accountType, action)}
                intent={intent}
                action={action}
                accountType={accountType}
                isDisabled={isDisabled || isLoading}
                isLoading={isLoading}
              />
            );
          })}
        </div>
      </Modal.Body>
    </Modal>
  );
}

interface ConfirmButtonProps {
  confirm: () => void;
  intent: "info" | "danger";
  action: AllowedActions;
  accountType: AllowedAccountTypes;
  isDisabled: boolean;
  isLoading: boolean;
}

function ConfirmButton({
  confirm,
  intent,
  action,
  accountType,
  isDisabled,
  isLoading,
}: ConfirmButtonProps) {
  const { t } = useTranslation();

  const [wantToConfirm, setWantToConfirm] = useState(false);

  const handleConfirm = () => {
    setWantToConfirm(false);
    confirm();
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {wantToConfirm ? (
        <Countdown
          date={Date.now() + 1000 * 5}
          onComplete={() => setWantToConfirm(false)}
          renderer={({ seconds }) => {
            return (
              <Button fullWidth rounded intent={intent} onClick={handleConfirm}>
                {t(
                  "screens.Dashboard.Accounts.UpgradeOrDowngradeAccountModal.confirm",
                  { seconds }
                )}
              </Button>
            );
          }}
        />
      ) : (
        <Button
          fullWidth
          rounded
          intent={intent}
          key={accountType}
          disabled={isDisabled || isLoading}
          onClick={() => setWantToConfirm(true)}
        >
          {isLoading ? (
            <Spinner />
          ) : (
            <div className="flex justify-center items-center gap-2 !text-white">
              <Typography as="span" decoration="bold" alternativeColor="white">
                {t(
                  `screens.Dashboard.Accounts.UpgradeOrDowngradeAccountModal.${action}`
                )}
              </Typography>
              <Typography as="small" alternativeColor="white">
                {t(
                  "screens.Dashboard.Accounts.UpgradeOrDowngradeAccountModal.to"
                )}
              </Typography>
              <Typography as="span" decoration="bold" alternativeColor="white">
                {accountType.toUpperCase()}
              </Typography>
            </div>
          )}
        </Button>
      )}
    </div>
  );
}

function getNumericAccountType(accountType: string) {
  if (accountType === AllowedAccountTypes.User) return 1;
  if (accountType === AllowedAccountTypes.Manager) return 2;
  if (accountType === AllowedAccountTypes.Staff) return 3;

  return 1;
}
