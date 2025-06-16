import { cva, VariantProps } from "class-variance-authority";
import Typography from "./Typography";

const styles = cva("flex flex-col gap-4 w-full xl:max-w-4xl mx-auto border-2 border-dashed px-4 py-2 rounded-md", {
  variants: {
    event: {
      loading: "border-blue-300 dark:border-blue-700",
      unauthorized: "border-yellow-300 dark:border-yellow-700",
    },
  },
});

export interface AuthorizedOrProps extends
  BaseProps,
  VariantProps<typeof styles> {
  authorized: boolean | null | undefined | string | number;
  isLoading?: boolean;
}

export default function AuthorizedOr({
  children,
  authorized,
  isLoading,
  ...props
}: AuthorizedOrProps) {
  if (authorized) {
    return children;
  }

  if (isLoading) {
    return (
      <div className={styles()} {...props}>
        <Typography>Loading...</Typography>
      </div>
    );
  }

  return (
    <div className={styles()} {...props}>
      <Typography>You are not authorized to access this page</Typography>
    </div>
  );
}
