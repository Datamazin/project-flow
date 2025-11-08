import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full rounded-xl border border-white/10 bg-white/40 px-4 py-2 text-sm text-slate-900 shadow-inner placeholder:text-slate-500 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/80",
          "dark:border-slate-800/80 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:ring-slate-700/60",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
