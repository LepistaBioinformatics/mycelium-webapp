"use client";

import AccountModal, { AccountModalProps } from "./AccountModal";
import { components } from "@/services/openapi/mycelium-schema";

type Account = components["schemas"]["Account"];

interface Props extends AccountModalProps {
  account: Account;
  accountId: string;
}

export default function EditAccountModal({
  isOpen,
  onClose,
  onSuccess,
  account,
  accountId,
}: Props) {
  return (
    <AccountModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      account={account}
      accountId={accountId}
      scope="subscription"
    />
  );
}
