import { ReactNode, FormEvent } from "react";
import { Modal } from "../modal";
import { X } from "lucide-react";
import FormErrorBanner from "./FormErrorBanner";
import SubmitButton from "./SubmitButton";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  formError?: string;
  onDismissError?: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  maxWidth?: string;
  submitLabelNew?: string;
  submitLabelEdit?: string;
}

export default function FormModal({
  isOpen, onClose, title, subtitle,
  formError, onDismissError,
  isSubmitting, isEditing,
  onSubmit, children,
  maxWidth = "max-w-lg",
  submitLabelNew, submitLabelEdit,
}: FormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className={`${maxWidth} p-0 overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-xl`}>
      <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <form onSubmit={onSubmit} className="p-6 space-y-5">
        {children}

        {formError && (
          <FormErrorBanner message={formError} onDismiss={onDismissError} />
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
            <X className="w-4 h-4" />
            Cancelar
          </button>
          <SubmitButton
            isSubmitting={!!isSubmitting}
            isEditing={!!isEditing}
            labelNew={submitLabelNew}
            labelEdit={submitLabelEdit}
          />
        </div>
      </form>
    </Modal>
  );
}
