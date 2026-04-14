import { cva, VariantProps } from "class-variance-authority";
import { AriaRole } from "react";

const styles = cva("text-zinc-700 dark:text-zinc-50", {
  variants: {
    fullWidth: {
      true: "w-full",
    },
    center: {
      true: "text-center justify-center items-center",
    },
    rounded: {
      true: "rounded-lg",
      full: "rounded-full",
      left: "rounded-l-full",
      right: "rounded-r-full",
    },
    intent: {
      primary:
        "bg-brand-violet-500 hover:bg-brand-violet-600 dark:bg-brand-lime-600 dark:hover:bg-brand-lime-700 text-white",
      secondary:
        "text-white font-semibold bg-zinc-500 hover:bg-zinc-600 dark:bg-zinc-600 dark:hover:bg-zinc-700",
      warning:
        "bg-yellow-500 dark:bg-yellow-600 text-white hover:bg-yellow-600 hover:dark:bg-yellow-700 font-semibold",
      danger:
        "bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700",
      link: "!text-brand-violet-500 dark:text-brand-lime-500 bg-transparent hover:bg-transparent border border-transparent hover:border-brand-violet-500 dark:hover:border-brand-lime-500",
      info: "bg-brand-violet-500 text-white hover:bg-brand-violet-600 dark:bg-brand-violet-500 dark:hover:bg-brand-violet-700",
    },
    size: {
      xs: "py-1 px-2 text-xs",
      sm: "py-1 px-2 text-sm",
      md: "py-2 px-4 text-base",
      lg: "py-3 px-6 text-lg",
    },
    padding: {
      none: "!p-0",
      sm: "!px-1 !py-0.5",
      md: "!px-2 !py-1",
      lg: "!px-3 !py-2",
    },
    disabled: {
      true: "opacity-50 cursor-not-allowed",
    },
  },
  defaultVariants: {
    fullWidth: false,
    intent: "primary",
    size: "md",
    rounded: false,
    padding: "md",
  },
});

interface Props extends BaseProps, VariantProps<typeof styles> {
  onClick?: () => void;
  role?: AriaRole | undefined;
  type?: "button" | "submit" | "reset" | undefined;
  disabled?: boolean;
}

export default function Button({
  fullWidth,
  intent,
  size,
  role,
  rounded,
  padding,
  onClick,
  type,
  disabled,
  center,
  ...props
}: Props) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={styles({
        fullWidth,
        intent,
        size,
        rounded,
        disabled,
        padding,
        center,
      })}
      type={type}
      role={role}
      disabled={disabled}
      {...props}
    />
  );
}
