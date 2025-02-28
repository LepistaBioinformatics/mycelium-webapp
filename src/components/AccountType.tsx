import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";

type Account = components["schemas"]["Account"];

interface Props {
  account: Account;
}

/**
 * Renders the account type
 * 
 * @param account - The account to render the type of
 * @returns The account type
 */
export default function AccountType({ account }: Props) {
  if (typeof account.accountType === "string") {
    return <Typography width="max" as="p">{account.accountType}</Typography>;
  }

  return (
    <div>
      <Typography as="span" decoration="smooth">
        {Object.keys(account.accountType).at(0)}
      </Typography>

      <div className="flex flex-col gap-2">
        {Object.entries(account.accountType).map(([key, value]) => (
          <div key={key} className="flex gap-2">
            <Typography as="span" decoration="smooth">{key}</Typography>
            <Typography as="p">{value}</Typography>
          </div>
        ))}
      </div>
    </div>
  );
}
