export const inputCls =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 dark:text-white/90 dark:bg-gray-900";

export const inputClsWithIcon = inputCls + " pl-10";

export const selectCls =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white/90 dark:bg-gray-900";

export const textareaCls =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 dark:text-white/90 dark:bg-gray-900 resize-none";

export const labelCls =
  "block mb-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

export const errorCls = "text-red-500 text-xs mt-1";

export const iconWrapperCls =
  "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none";

export const iconWrapperClsTop =
  "absolute top-3 left-3.5 pointer-events-none";

export function inputWithError(base: string, hasError: boolean): string {
  return hasError
    ? `${base} border-red-500 focus:ring-red-500/20`
    : base;
}
