import { GrSecure } from "react-icons/gr";
import Typography from "@/components/ui/Typography";
import formatEmail from "@/functions/format-email";
import { components } from "@/services/openapi/mycelium-schema";
import CopyToClipboard from "./ui/CopyToClipboard";

type Account = components["schemas"]["Account"];
type MultiFactorAuthentication =
  components["schemas"]["MultiFactorAuthentication"];

/**
 * Renders the owners of the account
 *
 * @param account - The account to render the owners of
 * @returns The owners of the account
 */
export default function Owners({ account }: { account: Account }) {
  const isSecure = (mfa: MultiFactorAuthentication) => {
    if (typeof mfa === "string") return false;

    if ("totp" in mfa) {
      const totp = mfa.totp;

      if (typeof totp === "string") return false;

      if ("enabled" in totp) {
        return totp.enabled.verified;
      }
    }

    return false;
  };

  if ("records" in account.owners) {
    return (
      <Typography as="span" decoration="smooth" margin="none" padding="none">
        {account.owners.records.map((owner) => {
          const email = formatEmail(owner.email);

          return (
            <span
              key={owner.id}
              className="flex items-center gap-2 rounded-md w-min hover:text-zinc-600 dark:hover:text-zinc-300 group group/clip whitespace-nowrap"
            >
              {email}
              {isSecure(owner.mfa) && <GrSecure />}
              {email && <CopyToClipboard text={email} groupHidden />}
            </span>
          );
        })}
      </Typography>
    );
  }

  return null;
}
