import { Save } from "lucide-react";

interface SubmitButtonProps {
  isSubmitting: boolean;
  isEditing?: boolean;
  labelNew?: string;
  labelEdit?: string;
  className?: string;
}

export default function SubmitButton({
  isSubmitting,
  isEditing,
  labelNew = "Guardar",
  labelEdit = "Actualizar",
  className = "",
}: SubmitButtonProps) {
  return (
    <button type="submit" disabled={isSubmitting}
      className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait ${className}`}>
      {isSubmitting ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <Save className="w-4 h-4" />
      )}
      {isSubmitting ? "Guardando..." : isEditing ? labelEdit : labelNew}
    </button>
  );
}
