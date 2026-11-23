import { cva } from "class-variance-authority";

// Lepista DS on the shadcn token layer: mono uppercase labels, violet primary
// (`--primary`), cyan focus ring (`--ring`). Cyan is too light for a solid fill
// under white text, so the `info` intent uses infra-600.
export const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-md border font-mono text-[0.85em] tracking-wide whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:shrink-0",
  {
    variants: {
      fullWidth: {
        true: "w-full",
      },
      center: {
        true: "text-center justify-center items-center",
      },
      intent: {
        // Tonal fills: a tinted surface with dark text reads as the call to
        // action without the glare of a saturated solid block.
        primary:
          "uppercase shadow-xs bg-brand-100 text-brand-800 border-brand-200 hover:bg-brand-200 dark:bg-brand-900/60 dark:text-brand-100 dark:border-brand-700 dark:hover:bg-brand-800",
        secondary:
          "uppercase shadow-xs bg-field text-zinc-700 border-input hover:bg-muted dark:text-zinc-200",
        warning:
          "uppercase shadow-xs bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800 dark:hover:bg-amber-900",
        danger:
          "uppercase shadow-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900 dark:hover:bg-red-900/60",
        link: "text-primary! dark:text-brand-300! bg-transparent border-transparent underline-offset-4 hover:underline",
        info: "uppercase shadow-xs bg-infra-100 text-infra-800 border-infra-200 hover:bg-infra-200 dark:bg-infra-900/60 dark:text-infra-200 dark:border-infra-800 dark:hover:bg-infra-800",
      },
      size: {
        xs: "py-1 px-2 text-xs",
        sm: "py-1 px-2 text-sm",
        md: "py-2 px-4 text-base",
        lg: "py-3 px-6 text-lg",
      },
      padding: {
        none: "p-0!",
        sm: "px-1! py-0.5!",
        md: "px-2.5! py-1!",
        lg: "px-3.5! py-2!",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
      },
    },
    defaultVariants: {
      fullWidth: false,
      intent: "primary",
      size: "md",
      padding: "md",
    },
  }
);
