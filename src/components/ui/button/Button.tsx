import { ReactNode, ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

const sizes = {
  xs: "px-2.5 py-1.5 text-xs gap-1.5 rounded-lg",
  sm: "px-3.5 py-2 text-xs gap-1.5 rounded-lg",
  md: "px-5 py-2.5 text-sm gap-2 rounded-xl",
  lg: "px-6 py-3 text-sm gap-2 rounded-xl",
};

const variants = {
  primary:
    "bg-brand-500 text-white shadow-sm hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-300",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 disabled:bg-red-300",
  ghost:
    "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 disabled:opacity-50",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: keyof typeof sizes;
  variant?: keyof typeof variants;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  loading?: boolean;
}

export default function Button({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  loading,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={twMerge(
        "inline-flex items-center justify-center font-semibold transition-colors select-none",
        sizes[size],
        variants[variant],
        (disabled || loading) && "cursor-not-allowed",
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : startIcon ? (
        <span className="shrink-0">{startIcon}</span>
      ) : null}
      {children}
      {endIcon && <span className="shrink-0">{endIcon}</span>}
    </button>
  );
}
