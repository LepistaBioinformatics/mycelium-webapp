import { cva, VariantProps } from "class-variance-authority";
import { ReactNode } from "react";

const styles = cva("p-2 text-sm border-2 dark:border-indigo-900 shadow rounded-lg dark:text-gray-100 text-gray-800 bg-white dark:bg-slate-800", {
  variants: {
    maxWidth: {
      none: "max-w-none",
      xs: "max-w-xs",
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
    },
  },
  defaultVariants: {
    maxWidth: "md",
  },
});

interface Props extends BaseProps, VariantProps<typeof styles> {
  title?: string | ReactNode;
}

export default function Banner({ title, children, maxWidth, ...props }: Props) {
  return (
    <div className={styles({ maxWidth })} {...props}>
      {title && (
        <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
