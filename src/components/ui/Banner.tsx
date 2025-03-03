import { projectVariants, projectDefaultVariants } from "@/constants/shared-component-styles";
import { cva, VariantProps } from "class-variance-authority";
import { ReactNode } from "react";

const { width } = projectVariants;

const styles = cva("p-2 text-left text-sm border-2 shadow rounded-lg dark:text-gray-100 text-gray-800 bg-white dark:bg-slate-800 mx-auto w-full xl:max-w-4xl", {
  variants: {
    width,
    intent: {
      error: "border-dashed border-red-500 dark:border-red-500",
      info: "border-dashed border-blue-500 dark:border-blue-500",
      success: "border-dashed border-green-500 dark:border-green-500",
      warning: "border-dashed border-yellow-500 dark:border-yellow-500",
    }
  },
  defaultVariants: {
    ...projectDefaultVariants,
    intent: "info",
  },
});

interface Props extends BaseProps, VariantProps<typeof styles> {
  title?: string | ReactNode;
}

export default function Banner({ title, children, intent, ...props }: Props) {
  return (
    <div className={styles({ intent })} {...props}>
      {title && (
        <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
