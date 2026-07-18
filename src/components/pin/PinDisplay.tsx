interface Props {
  length: number;
  maxLength: number;
}

export default function PinDisplay({ length, maxLength }: Props) {
  return (
    <div className="flex justify-center gap-3 my-6">
      {Array.from({ length: maxLength }).map((_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
            i < length
              ? "bg-brand-500 border-brand-500 scale-110"
              : "bg-transparent border-gray-400 dark:border-gray-500"
          }`}
        />
      ))}
    </div>
  );
}
