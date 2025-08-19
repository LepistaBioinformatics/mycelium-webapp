import { cva, VariantProps } from "class-variance-authority";

const styles = cva(
  "flex flex-col text-left gap-1 border-t border-gray-300 dark:border-gray-700  px-4 py-2 mx-auto w-full xl:max-w-4xl",
  {
    variants: {
      _index: {
        even: "bg-white dark:bg-zinc-800",
        odd: "bg-zinc-50 dark:bg-zinc-900",
      },
    },
    defaultVariants: {},
  }
);

interface Props extends BaseProps, VariantProps<typeof styles> {
  index?: number;
}

export default function ListItem({ children, index, ...props }: Props) {
  const _index = index === undefined ? "odd" : index % 2 === 0 ? "even" : "odd";

  return (
    <div className={styles({ _index })} {...props}>
      {children}
    </div>
  );
}
