import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "flex min-h-28 w-full rounded-[calc(var(--radius)*1.7)] border border-border/80 bg-white/85 px-4 py-3 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition-all duration-200 placeholder:text-muted-foreground/90 focus:border-secondary/60 focus:bg-white focus:ring-4 focus:ring-secondary/10 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
});

export { Textarea };
