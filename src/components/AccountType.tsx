import Typography from "@/components/ui/Typography";
import { camelToHumanText } from "@/functions/camel-to-human-text";
import { components } from "@/services/openapi/mycelium-schema";
import { ComponentProps, useCallback, useMemo } from "react";

type Account = components["schemas"]["Account"];

interface Props {
  account: Account;
  part?: "type" | "values";
  extraProps?: ComponentProps<typeof Typography>;
}

const attrs = { width: "max", as: "p", decoration: "light" } as ComponentProps<
  typeof Typography
>;

/**
 * Renders the account type
 *
 * @param account - The account to render the type of
 * @param part - The part of the account to render
 * @returns The account type
 */
export default function AccountType({
  account,
  part = "type",
  extraProps,
}: Props) {
  if (typeof account.accountType === "string") {
    return (
      <Typography {...attrs} nowrap {...extraProps}>
        {camelToHumanText(account.accountType)}
      </Typography>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const accountType = useMemo(
    () => Object.keys(account.accountType).at(0),
    [account.accountType]
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const renderedValues = useCallback((values: any) => {
    if (typeof values === "string") {
      return (
        <Typography {...attrs} {...extraProps}>
          {values}
        </Typography>
      );
    }

    if (Array.isArray(values)) {
      return values.map((value) => {
        return (
          <Typography {...attrs} {...extraProps}>
            {value}
          </Typography>
        );
      });
    }

    if (typeof values === "object") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return Object.entries(values).map(([_, value]) => {
        return (
          <Typography {...attrs} {...extraProps}>
            {value as string}
          </Typography>
        );
      });
    }

    return null;
  }, [extraProps]);

  if (part === "type") {
    return (
      <Typography {...attrs} nowrap {...extraProps}>
        {camelToHumanText(accountType ?? "")}
      </Typography>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-3">
      {Object.entries(account.accountType).map(([key, value], index) => (
        <div key={index} className="flex items-center gap-0 !text-xs -ml-1">
          <span className="text-gray-500 dark:text-gray-400 uppercase bg-indigo-100 dark:bg-indigo-900 px-2 py-1 rounded-l-md">
            {camelToHumanText(key)}
          </span>
          <div className="bg-indigo-100 dark:bg-indigo-900 px-2 rounded-r-md">
            {renderedValues(value)}
          </div>
        </div>
      ))}
    </div>
  );
}
