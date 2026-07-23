import { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "pills" | "underline";
  fullWidth?: boolean;
  className?: string;
}

const variants = {
  pills: {
    container: "flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg",
    tab: (active: boolean) =>
      twMerge(
        "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm"
          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
      ),
  },
  underline: {
    container: "flex border-b border-gray-200 dark:border-gray-700",
    tab: (active: boolean) =>
      twMerge(
        "whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors",
        active
          ? "border-brand-500 text-brand-600 dark:text-brand-400"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300",
      ),
  },
};

export default function Tabs({ tabs, activeTab, onChange, variant = "pills", fullWidth, className }: TabsProps) {
  const style = variants[variant];

  return (
    <nav className={twMerge(style.container, className)} role="tablist" aria-label="Navegación de pestañas">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          onClick={() => onChange(tab.id)}
          className={twMerge(style.tab(activeTab === tab.id), fullWidth && "flex-1")}
        >
          {tab.icon && <span className="shrink-0">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
