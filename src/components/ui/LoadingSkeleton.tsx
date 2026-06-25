type SkeletonVariant = "table" | "card" | "text";

interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  rows?: number;
  cols?: number;
}

function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full animate-pulse">
      {/* header */}
      <div className="flex gap-4 mb-3 px-3 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={`h-${i}`} className="h-3 bg-gray-200 dark:bg-gray-700 rounded" style={{ width: `${60 + Math.random() * 40}px` }} />
        ))}
      </div>
      {/* rows */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={`r-${r}`} className="flex gap-4 px-3 py-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={`c-${r}-${c}`}
                className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded"
                style={{ width: `${50 + Math.random() * 80}px` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 space-y-3 border border-gray-200 dark:border-gray-700">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-1/2" />
          <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-5/6" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-2" />
        </div>
      ))}
    </div>
  );
}

function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2.5 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-gray-200 dark:bg-gray-700 rounded"
          style={{ width: `${70 + Math.random() * 30}%` }}
        />
      ))}
    </div>
  );
}

export default function LoadingSkeleton({ variant = "table", rows, cols }: LoadingSkeletonProps) {
  switch (variant) {
    case "card":
      return <CardSkeleton count={rows} />;
    case "text":
      return <TextSkeleton lines={rows} />;
    default:
      return <TableSkeleton rows={rows} cols={cols} />;
  }
}
