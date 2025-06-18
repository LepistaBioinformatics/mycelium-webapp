import { cva, VariantProps } from "class-variance-authority";

const styles = cva(
  "flex flex-col gap-0 bg-slate-50 dark:bg-slate-800 border-t-2 border-blue-200 dark:border-indigo-900 rounded-sm px-4 py-2 w-full hover:bg-blue-100 dark:hover:bg-slate-900 transition-all duration-500",
  {
    variants: {},
  }
);

interface Props extends BaseProps, VariantProps<typeof styles> {}

export default function MiniBox({ children, ...props }: Props) {
  return <div className={styles(props)}>{children}</div>;
}
