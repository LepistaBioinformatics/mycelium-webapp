import { cva, VariantProps } from "class-variance-authority";
import Typography from "./Typography";

const styles = cva("flex flex-col gap-4 w-full xl:max-w-4xl mx-auto border-2 border-dashed border-yellow-300 dark:border-yellow-700 px-4 py-2 rounded-md", {
  variants: {},
});

export interface AuthorizedOrProps extends
  BaseProps,
  VariantProps<typeof styles> {
  authorized: boolean | null | undefined | string | number;
}

export default function AuthorizedOr({
  children,
  authorized,
  ...props
}: AuthorizedOrProps) {
  if (authorized) {
    return children;
  }

  return (
    <div className={styles()} {...props}>
      <Typography>You are not authorized to access this page</Typography>
    </div>
  );
}
