interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  label?: string;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, totalItems, pageSize, label = "registros", onPageChange }: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const showButtons = safeTotalPages > 1;

  const getVisiblePages = () => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(safeTotalPages, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex flex-wrap justify-between items-center gap-2">
      {totalItems !== undefined ? (
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
          Mostrando {pageSize ? Math.min(pageSize, totalItems - (currentPage - 1) * pageSize) : totalItems} de {totalItems} {label}
        </span>
      ) : null}
      {showButtons && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-xs font-medium disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          {getVisiblePages().map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 text-xs font-medium rounded-lg border transition-colors ${
                page === currentPage
                  ? "bg-brand-500 text-white border-brand-500"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= safeTotalPages}
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-xs font-medium disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
