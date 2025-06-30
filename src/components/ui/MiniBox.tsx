import { cva, VariantProps } from "class-variance-authority";

const styles = cva(
  "flex flex-col gap-0 border-t-2 border-l-2 border-r-[0.5px] border-b-[0.5px] border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 hover:bg-indigo-100 dark:hover:bg-zinc-800 transition-all duration-300",
  {
    variants: {
      width: {
        full: "w-full",
        standard: "w-full sm:w-[calc(55vw-0.5rem)] lg:w-[calc(30vw-1rem)]",
      },
    },
    defaultVariants: {
      width: "standard",
    },
  }
);

interface Props extends BaseProps, VariantProps<typeof styles> {}

export default function MiniBox({ children, ...props }: Props) {
  return <div className={styles(props)}>{children}</div>;
}
