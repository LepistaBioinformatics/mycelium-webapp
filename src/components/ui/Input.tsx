import { ComponentProps, ComponentType } from "react";
import { cn } from "@/lib/utils";
import { fieldStyles } from "./field-styles";

// Form controls on the shadcn token layer.

interface Sizing {
  sizing?: "sm" | "md" | "lg";
}


interface TextInputProps
  extends Omit<ComponentProps<"input">, "color">,
    Sizing {
  icon?: ComponentType<{ className?: string }>;
  rightIcon?: ComponentType<{ className?: string }>;
  /** Large, rounded field for page-level search bars. */
  prominent?: boolean;
}

export function TextInput({
  sizing,
  icon: Icon,
  rightIcon: RightIcon,
  prominent,
  className,
  ...props
}: TextInputProps) {
  return (
    <div className={cn("relative w-full", className)}>
      {Icon && (
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 flex items-center text-muted-foreground",
            prominent ? "pl-5" : "pl-3"
          )}
        >
          <Icon className={prominent ? "size-5" : "size-4"} />
        </div>
      )}
      <input
        className={cn(
          fieldStyles({ sizing }),
          prominent &&
            "rounded-2xl px-5 py-3.5 text-base shadow-card focus-visible:shadow-raised",
          Icon && (prominent ? "pl-13" : "pl-9"),
          RightIcon && (prominent ? "pr-12" : "pr-10")
        )}
        {...props}
      />
      {RightIcon && (
        <div
          data-testid="right-icon"
          className={cn(
            "absolute inset-y-0 right-0 flex items-center",
            prominent ? "pr-4" : "pr-2"
          )}
        >
          <RightIcon />
        </div>
      )}
    </div>
  );
}

interface SelectProps
  extends Omit<ComponentProps<"select">, "color">,
    Sizing {}

export function Select({
  sizing,
  className,
  ...props
}: SelectProps) {
  return (
    <select
      className={cn(fieldStyles({ sizing }), "cursor-pointer pr-8", className)}
      {...props}
    />
  );
}

interface TextareaProps
  extends Omit<ComponentProps<"textarea">, "color">,
    Sizing {}

export function Textarea({
  sizing,
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={cn(fieldStyles({ sizing }), "min-h-16", className)}
      {...props}
    />
  );
}
