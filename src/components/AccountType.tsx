import Typography from "@/components/ui/Typography";
import { camelToHumanText } from "@/functions/camel-to-human-text";
import { components } from "@/services/openapi/mycelium-schema";
import { useCallback, useMemo } from "react";

type Account = components["schemas"]["Account"];

interface Props {
  account: Account;
  part?: "type" | "values";
}

/**
 * Renders the account type
 * 
 * @param account - The account to render the type of
 * @param part - The part of the account to render
 * @returns The account type
 */
export default function AccountType({ account, part = "type" }: Props) {
  if (typeof account.accountType === "string") {
    return (
      <Typography nowrap width="max" as="p">
        {camelToHumanText(account.accountType)}
      </Typography>
    );
  }

  const accountType = useMemo(
    () => Object.keys(account.accountType).at(0),
    [account.accountType]
  );

  const renderedValues = useCallback((values: any) => {
    if (typeof values === "string") {
      return <Typography width="max" as="p">{values}</Typography>;
    }

    if (Array.isArray(values)) {
      return values.map((value) => {
        return <Typography width="max" as="p">{value}</Typography>;
      });
    }

    if (typeof values === "object") {
      return Object.entries(values).map(([_, value]) => {
        return <Typography width="max" as="p">{value as string}</Typography>;
      });
    }

    return null;
  }, []);

  if (part === "type") {
    return (
      <Typography nowrap width="max" as="p">
        {camelToHumanText(accountType ?? "")}
      </Typography>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-3">
      {Object.entries(account.accountType).map(([key, value], index) => (
        <div key={index} className="flex items-center gap-0 !text-xs -ml-1">
          <span className="text-gray-500 dark:text-gray-400 uppercase bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-l-md">
            {camelToHumanText(key)}
          </span>
          <div className="bg-blue-100 dark:bg-blue-900 px-2 rounded-r-md">
            {renderedValues(value)}
          </div>
        </div>
      ))}
    </div>
  );
}
