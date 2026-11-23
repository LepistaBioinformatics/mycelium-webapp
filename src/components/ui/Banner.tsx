import {
  projectVariants,
  projectDefaultVariants,
} from "@/constants/shared-component-styles";
import { cva, VariantProps } from "class-variance-authority";
import { ReactNode } from "react";
import { IoClose } from "react-icons/io5";

const { width } = projectVariants;

const styles = cva(
  "px-4 py-3 text-left text-sm rounded-lg border dark:text-zinc-100 text-zinc-800 bg-card w-full",
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
          "border-red-500/40 bg-red-50 dark:bg-red-950/40",
        info: "border-brand-600/30 dark:border-brand-400/25 bg-brand-50/60 dark:bg-surface-900",
        success:
          "border-green-500/40 bg-green-50 dark:bg-green-950/40",
        warning:
          "border-amber-500/40 bg-amber-50 dark:bg-amber-950/40",
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
      <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center justify-between">
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
