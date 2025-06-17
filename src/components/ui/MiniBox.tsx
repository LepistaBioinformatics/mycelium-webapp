import { cva, VariantProps } from "class-variance-authority";

const styles = cva(
  "flex flex-col gap-0 bg-blue-50 dark:bg-slate-900 bg-opacity-50 dark:bg-opacity-50 border border-blue-200 dark:border-indigo-900 rounded-lg px-4 py-2 w-full hover:bg-blue-100 dark:hover:bg-indigo-900 dark:hover:bg-opacity-20 transition-all duration-300",
  {
    variants: {},
  }
);

interface Props extends BaseProps, VariantProps<typeof styles> {}

export default function MiniBox({ children, ...props }: Props) {
  return <div className={styles(props)}>{children}</div>;
}
