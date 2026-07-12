import { cva } from "class-variance-authority";

export const buttonStyles = cva(
  "rounded-lg border font-mono tracking-wide transition-all",
  {
    variants: {
      fullWidth: {
        true: "w-full",
      },
      center: {
        true: "text-center justify-center items-center",
      },
      intent: {
        // Violet surface + violet border. Cyan #64C5EB is too light for a
        // solid fill under white text (WCAG), so the accent lives in the border.
        // brand-800 reads near-black against the light-mode page background, so
        // light mode uses brand-600 and dark mode goes one step darker (brand-700)
        // to stay legible against the dark brand-950 shell.
        // Subtle shadow only — the hard-offset `shadow-neo` treatment is reserved
        // for marketing surfaces (HomePage), it reads as too heavy repeated across
        // a dense admin UI.
        primary:
          "uppercase bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-800 text-white border-brand-600 shadow-sm dark:shadow-none",
        secondary:
          "uppercase text-white font-semibold bg-zinc-600 hover:bg-zinc-700 border-zinc-500",
        warning:
          "uppercase bg-yellow-500 dark:bg-yellow-600 text-white hover:bg-yellow-600 hover:dark:bg-yellow-700 border-yellow-600 font-semibold",
        danger:
          "uppercase bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 border-red-600",
        link: "!text-brand-600 dark:!text-brand-300 bg-transparent hover:bg-transparent border-transparent hover:border-brand-600 dark:hover:border-brand-300",
        info: "uppercase bg-infra-600 hover:bg-infra-700 text-white border-infra-700",
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
      padding: "md",
    },
  }
);
