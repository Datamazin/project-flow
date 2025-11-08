import { cn } from "@/lib/utils";

export type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "info" | "success" | "warning";
  className?: string;
};

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-slate-900/10 text-slate-900 dark:text-slate-100",
  info: "bg-sky-500/20 text-sky-800 dark:text-sky-200",
  success: "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200",
  warning: "bg-amber-500/20 text-amber-800 dark:text-amber-200",
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
