import { cva, VariantProps } from "class-variance-authority";

const styles = cva(
  "flex flex-col text-left gap-1 border-t-2 border-gray-300 dark:border-gray-700  px-4 py-2 mx-auto w-full xl:max-w-4xl",
  {
    variants: {},
    defaultVariants: {},
  }
);

interface Props extends BaseProps, VariantProps<typeof styles> {}

export default function ListItem({ children, ...props }: Props) {
  return (
    <div className={styles()} {...props}>
      {children}
    </div>
  );
}
