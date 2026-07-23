import { ReactNode } from "react";

interface FormSectionProps {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
}

export default function FormSection({ icon, title, children, className = "" }: FormSectionProps) {
  return (
    <div className={`bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 space-y-4 border border-gray-100 dark:border-gray-700/50 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {icon && <span className="w-3.5 h-3.5 shrink-0">{icon}</span>}
        {title}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}
