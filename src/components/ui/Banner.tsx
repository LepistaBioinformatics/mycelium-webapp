import {
  projectVariants,
  projectDefaultVariants,
} from "@/constants/shared-component-styles";
import { cva, VariantProps } from "class-variance-authority";
import { ReactNode } from "react";
import { IoClose } from "react-icons/io5";

const { width } = projectVariants;

const styles = cva(
  "px-2 py-1 text-left text-sm rounded-lg border dark:text-zinc-100 text-zinc-800 bg-white dark:bg-brand-950 w-full",
  {
    variants: {
      width,
      // Caps the banner at a readable line length by default. Set
      // `boxed={false}` to let it span the full content area instead.
      boxed: {
        true: "sm:max-w-4xl",
        false: "",
      },
      intent: {
        error:
          "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900",
        info: "border-brand-600 dark:border-brand-400 bg-brand-50 dark:bg-brand-900",
        success:
          "border-green-500 dark:border-green-500 bg-green-50 dark:bg-green-900",
        warning:
          "border-yellow-500 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-900",
      },
    },
    defaultVariants: {
      ...projectDefaultVariants,
      intent: "info",
      boxed: true,
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
  width,
  boxed,
  closeable,
  onClose,
  ...props
}: Props) {
  return (
    <div className={styles({ intent, width, boxed })} {...props}>
      <div className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-3 flex items-center justify-between">
        {title && <div>{title}</div>}
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
