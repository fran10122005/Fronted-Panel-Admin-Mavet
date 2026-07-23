import { AlertCircle, X } from "lucide-react";

interface FormErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export default function FormErrorBanner({ message, onDismiss }: FormErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-900/30">
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="text-sm font-medium flex-1">{message}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss}
          className="shrink-0 text-red-400 hover:text-red-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
