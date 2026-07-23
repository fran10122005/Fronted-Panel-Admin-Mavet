export const getBaseInputCls = (hasError?: boolean) => {
  const base = "w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none dark:text-white/90 shadow-sm transition-all duration-200 ";
  const normal = "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-brand-500/20";
  const error = "border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20";
  return base + (hasError ? error : normal);
};

export const inputCls = getBaseInputCls(false);

export const inputClsWithIcon = inputCls + " pl-10";

export const selectCls = inputCls;

export const textareaCls = inputCls + " resize-y";

export const labelCls = "block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200";

export const errorCls = "text-red-500 text-[11px] mt-1 font-medium";

export const errorTextCls = errorCls;

export const iconWrapperCls = "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none";

export const iconWrapperClsTop = "absolute top-3 left-3.5 pointer-events-none";

export function inputWithError(base: string, hasError: boolean): string {
  if (!hasError) return base;
  return base.replace(
    "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-brand-500/20",
    "border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-red-500/20"
  );
}

export const modalCls = "max-w-2xl p-0 overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800";
