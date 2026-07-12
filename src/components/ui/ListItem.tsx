import { cva, VariantProps } from "class-variance-authority";

const styles = cva(
  "flex flex-col text-left gap-1 border border-l-4 border-brand-600 px-4 py-2 mx-auto w-full xl:max-w-4xl",
  {
    variants: {
      _index: {
        even: "bg-white dark:bg-brand-950",
        odd: "bg-zinc-50 dark:bg-brand-900",
      },
    },
    defaultVariants: {},
  }
);

interface Props extends BaseProps, VariantProps<typeof styles> {
  index?: number;
}

export default function ListItem({ children, index, ...props }: Props) {
  const _index =
    index === undefined ? "even" : index % 2 === 0 ? "even" : "odd";

  return (
    <div className={styles({ _index })} {...props}>
      {children}
    </div>
  );
}
