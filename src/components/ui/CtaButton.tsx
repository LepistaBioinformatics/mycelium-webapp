import { ArrowRight, ArrowUpRight, Loader2 } from "lucide-react";
import { ComponentProps, ComponentType } from "react";
import { cn } from "@/lib/utils";

interface Props extends ComponentProps<"button"> {
  /** Leading icon (e.g. a sign-in glyph) */
  icon?: ComponentType<{ className?: string }>;
  /** Show a spinner and block clicks while an action runs */
  loading?: boolean;
  /**
   * `action` (default): filled, for a submit on the page.
   * `link`: tonal with a diagonal arrow, for a button that takes the user to
   * another page (e.g. the hosted sign-in page).
   */
  variant?: "action" | "link";
}

const VARIANT_STYLES = {
  action:
    "bg-primary text-primary-foreground shadow-card hover:bg-primary/90 hover:shadow-raised",
  // Transparent at rest; the tonal surface and border only show on hover or
  // keyboard focus.
  link: "border border-transparent bg-transparent text-brand-700 hover:border-brand-200 hover:bg-brand-100 hover:text-brand-800 hover:shadow-xs focus-visible:border-brand-200 focus-visible:bg-brand-100 dark:text-brand-200 dark:hover:border-brand-700 dark:hover:bg-brand-900/60 dark:hover:text-brand-100 dark:focus-visible:border-brand-700 dark:focus-visible:bg-brand-900/60",
};

/**
 * The main call to action of a page (sign in, send code): a filled, rounded
 * button with a leading icon and an arrow that slides on hover. Use at most
 * once per card; everything else uses `Button`.
 */
export default function CtaButton({
  icon: Icon,
  loading,
  variant = "action",
  disabled,
  className,
  children,
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "group/cta inline-flex items-center justify-center rounded-xl",
        "font-medium",
        variant === "action" ? "h-12 gap-2.5 px-5 text-base" : "h-16 gap-3 px-8 text-xl",
        VARIANT_STYLES[variant],
        variant === "action" && "w-full",
        "transition-[background-color,box-shadow,transform] duration-200 active:scale-[0.99]",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60",
        "disabled:pointer-events-none disabled:opacity-60",
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2
          aria-hidden
          className={cn("animate-spin", variant === "link" ? "size-6" : "size-5")}
        />
      ) : (
        Icon && <Icon className={variant === "link" ? "size-6" : "size-5"} />
      )}
      <span>{children}</span>
      {!loading && variant === "action" && (
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-200 group-hover/cta:translate-x-1"
        />
      )}
      {!loading && variant === "link" && (
        <ArrowUpRight
          aria-hidden
          className="size-5 transition-transform duration-200 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
        />
      )}
    </button>
  );
}
