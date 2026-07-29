import type { ReactNode, ChangeEvent } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchDataTour?: string;
  filters?: ReactNode;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, searchValue, onSearchChange, searchPlaceholder, searchDataTour, filters, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 data-tour="page-heading" className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-nowrap shrink-0">{actions}</div>}
      </div>
      {(searchValue !== undefined || filters) && (
        <div className="flex flex-wrap items-center gap-3">
          {searchValue !== undefined && onSearchChange && (
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="text"
                value={searchValue}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder || "Buscar..."}
                data-tour={searchDataTour}
                className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 shadow-sm dark:text-white/90"
              />
            </div>
          )}
          {filters}
        </div>
      )}
    </div>
  );
}
