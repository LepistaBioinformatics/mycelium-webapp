import {
  projectVariants,
  projectDefaultVariants,
} from "@/constants/shared-component-styles";
import { cva, VariantProps } from "class-variance-authority";
import { ReactNode } from "react";
import { IoClose } from "react-icons/io5";

const { width } = projectVariants;

const styles = cva(
  "p-2 text-left text-sm border shadow rounded-lg dark:text-gray-100 text-gray-800 bg-zinc-50 dark:bg-zinc-800 w-full sm:max-w-4xl",
  {
    variants: {
      width,
      intent: {
        error:
          "border-dashed border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900",
        info: "border-dashed border-indigo-500 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900",
        success:
          "border-dashed border-green-500 dark:border-green-500 bg-green-50 dark:bg-green-900",
        warning:
          "border-dashed border-yellow-500 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-900",
      },
    },
    defaultVariants: {
      ...projectDefaultVariants,
      intent: "info",
    },
  }
);

interface Props extends BaseProps, VariantProps<typeof styles> {
  title?: string | ReactNode;
  closeable?: boolean;
  onClose?: () => void;
}

export default function Banner({
  title,
  children,
  intent,
  closeable,
  onClose,
  ...props
}: Props) {
  return (
    <div className={styles({ intent })} {...props}>
      <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center justify-between">
        {title && <h3>{title}</h3>}
        {closeable && (
          <button onClick={onClose}>
            <IoClose className="w-4 h-4 -mt-2" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
