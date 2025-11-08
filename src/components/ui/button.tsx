import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "ghost"
  | "outline"
  | "subtle"
  | "accent";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
};

const styles: Record<ButtonVariant, string> = {
  primary:
    "bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:bg-slate-900/90",
  ghost:
    "bg-white/20 text-slate-900 hover:bg-white/30 active:bg-white/40 dark:text-slate-100 dark:hover:bg-slate-800/60",
  outline:
    "border border-slate-900/10 bg-transparent text-slate-900 hover:bg-slate-900/5 dark:border-slate-700/50 dark:text-slate-100 dark:hover:bg-slate-800/60",
  subtle:
    "bg-slate-900/80 text-slate-50 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700",
  accent:
    "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30 hover:brightness-110",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", icon, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200/70 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
