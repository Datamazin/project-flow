import * as React from "react";
import { cn } from "@/lib/utils";

export type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "neutral" | "warm" | "cool" | "emerald";
};

const toneClasses: Record<NonNullable<PanelProps["tone"]>, string> = {
  neutral:
    "bg-white/90 dark:bg-slate-900/70 border-slate-200/40 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 backdrop-blur-xl",
  warm: "bg-gradient-to-br from-rose-500/10 via-orange-500/10 to-amber-500/10 border-transparent",
  cool: "bg-gradient-to-br from-indigo-500/10 via-sky-500/10 to-cyan-500/10 border-transparent",
  emerald: "bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-sky-500/10 border-transparent",
};

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, tone = "neutral", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-3xl border p-6 transition-shadow hover:shadow-xl",
          toneClasses[tone],
          className,
        )}
        {...props}
      />
    );
  },
);
Panel.displayName = "Panel";
