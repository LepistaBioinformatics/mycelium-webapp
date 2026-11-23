import { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// Tables on the shadcn token layer. `TableHead` renders its own header row.

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="relative w-full overflow-x-auto rounded-lg border border-border bg-card shadow-xs">
      <table
        className={cn("w-full caption-bottom text-left text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function TableHead({ children, className, ...props }: ComponentProps<"thead">) {
  return (
    <thead className={cn("bg-muted/60 dark:bg-surface-900", className)} {...props}>
      <tr className="border-b border-border">{children}</tr>
    </thead>
  );
}

export function TableHeadCell({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "h-10 px-3 align-middle font-mono text-xs font-normal uppercase tracking-wide whitespace-nowrap text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return (
    <tbody
      className={cn("divide-y divide-border [&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "bg-card transition-colors hover:bg-muted dark:hover:bg-surface-800",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td className={cn("px-3 py-2.5 align-middle", className)} {...props} />
  );
}
