import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-blue-600 text-white dark:bg-blue-600 dark:text-white",
    secondary: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
    destructive:
      "bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900/60",
    outline: "text-slate-700 border border-slate-300 dark:text-slate-300 dark:border-slate-700",
    success:
      "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/60",
    warning:
      "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900/60",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
