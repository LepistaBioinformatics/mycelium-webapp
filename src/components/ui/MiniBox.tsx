import { cva, VariantProps } from "class-variance-authority";

const styles = cva(
  "flex flex-col gap-0 rounded-lg border border-brand-600 px-4 py-2 hover:bg-brand-50 dark:hover:bg-brand-900 transition-all duration-300",
  {
    variants: {
      width: {
        full: "w-full",
        standard: "w-full sm:w-[calc(55vw-0.5rem)] lg:w-[calc(22vw-1rem)]",
      },
    },
    defaultVariants: {
      width: "standard",
    },
  }
);

interface Props extends BaseProps, VariantProps<typeof styles> { }

export default function MiniBox({ children, ...props }: Props) {
  return <div className={styles(props)}>{children}</div>;
}
