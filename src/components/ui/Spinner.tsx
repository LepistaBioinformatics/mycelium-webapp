import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      role="status"
      aria-label="Loading"
      className={cn("size-6 animate-spin text-primary", className)}
    />
  );
}
