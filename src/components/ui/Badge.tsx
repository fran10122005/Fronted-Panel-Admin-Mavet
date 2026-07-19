import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

const schemes = {
  success: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/40",
  danger: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40",
  info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40",
  neutral: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  brand: "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/30 dark:text-brand-400 dark:border-brand-800/40",
};

interface BadgeProps {
  children: ReactNode;
  scheme?: keyof typeof schemes;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

export default function Badge({ children, scheme = "neutral", dot, pulse, className }: BadgeProps) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        schemes[scheme],
        className,
      )}
    >
      {(dot || pulse) && (
        <span className={twMerge("w-1.5 h-1.5 rounded-full bg-current", pulse && "animate-pulse")} />
      )}
      {children}
    </span>
  );
}
