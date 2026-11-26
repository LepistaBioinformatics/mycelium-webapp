import { ComponentProps } from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// Horizontal tabs (Radix: keyboard navigation and ARIA built in). The active
// tab is a raised white pill, like the vertical tab rail and the sidebar.

function Root({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      className={cn("flex flex-col gap-4 w-full", className)}
      {...props}
    />
  );
}

function List({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex w-full items-center gap-1 overflow-x-auto scrollbar rounded-xl bg-muted p-1 dark:bg-surface-950",
        className
      )}
      {...props}
    />
  );
}

function Trigger({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-[color,background-color,box-shadow] outline-none",
        "hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "data-[state=active]:bg-card data-[state=active]:font-medium data-[state=active]:text-brand-800 data-[state=active]:shadow-card dark:data-[state=active]:bg-surface-800 dark:data-[state=active]:text-brand-100",
        "[&_svg]:shrink-0 data-[state=active]:[&_svg]:text-primary dark:data-[state=active]:[&_svg]:text-infra-400",
        className
      )}
      {...props}
    />
  );
}

function Content({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        "flex flex-col gap-4 outline-none animate-in fade-in-0 duration-150",
        className
      )}
      {...props}
    />
  );
}

const Tabs = Object.assign(Root, { List, Trigger, Content });

export default Tabs;
