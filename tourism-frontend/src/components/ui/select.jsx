import * as React from "react";

import { cn } from "@/lib/utils";

const Select = React.forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        data-slot="select"
        className={cn(
          "flex h-12 w-full appearance-none rounded-[calc(var(--radius)*1.7)] border border-border/80 bg-white/85 px-4 pr-11 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition-all duration-200 focus:border-secondary/60 focus:bg-white focus:ring-4 focus:ring-secondary/10 disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path d="M7 10l5 5 5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    </div>
  );
});

export { Select };
