import { cva, VariantProps } from "class-variance-authority";

const styles = cva(
  "flex flex-col text-left gap-1 rounded-lg border border-border bg-card px-4 py-3 mx-auto w-full xl:max-w-4xl shadow-xs transition-[color,box-shadow,border-color] hover:shadow-card hover:border-brand-600/40 dark:hover:border-brand-400/30",
  {
    variants: {
      _index: {
        even: "",
        odd: "",
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
