interface Props {
  onDigit: (d: string) => void;
  onDelete: () => void;
  onClear: () => void;
  disabled?: boolean;
}

const btnBase =
  "w-full aspect-square rounded-2xl text-2xl font-bold transition-all active:scale-95 select-none touch-manipulation";

export default function PinKeypad({ onDigit, onDelete, onClear, disabled }: Props) {
  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
  ];

  return (
    <div className="w-full max-w-xs mx-auto select-none">
      {keys.map((row, ri) => (
        <div key={ri} className="flex gap-3 mb-3">
          {row.map((k) => (
            <button
              key={k}
              type="button"
              disabled={disabled}
              onClick={() => onDigit(k)}
              className={`${btnBase} bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50`}
            >
              {k}
            </button>
          ))}
        </div>
      ))}
      <div className="flex gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={onClear}
          className={`${btnBase} bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm disabled:opacity-50`}
        >
          BORRAR
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDigit("0")}
          className={`${btnBase} bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50`}
        >
          0
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          className={`${btnBase} bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50`}
        >
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
