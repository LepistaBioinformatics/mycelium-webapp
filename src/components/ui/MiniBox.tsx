import { cva, VariantProps } from "class-variance-authority";

const styles = cva(
  "flex flex-col gap-0 border-t-2 border-gray-300 dark:border-gray-700 rounded-sm px-4 py-2 w-full hover:bg-indigo-100 dark:hover:bg-zinc-900 transition-all duration-500",
  {
    variants: {},
  }
);

interface Props extends BaseProps, VariantProps<typeof styles> {}

export default function MiniBox({ children, ...props }: Props) {
  return <div className={styles(props)}>{children}</div>;
}
