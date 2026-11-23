import { cva } from "class-variance-authority";

// Text-field look shared by the Input primitives and hand-rolled form fields.
export const fieldStyles = cva(
  "w-full min-w-0 rounded-md border border-input bg-field text-foreground shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
  {
    variants: {
      sizing: {
        sm: "px-2.5 py-1.5 text-sm",
        md: "px-3 py-2 text-sm",
        lg: "px-3.5 py-2.5 text-base",
      },
    },
    defaultVariants: {
      sizing: "md",
    },
  }
);
