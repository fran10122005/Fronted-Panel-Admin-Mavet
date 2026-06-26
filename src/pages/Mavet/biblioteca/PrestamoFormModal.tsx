import { Modal } from "../../../components/ui/modal";
import { limitNumericInput } from "../../../utils/validation";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedLibroTitle: string;
  cedula: string;
  nombre: string;
  isSubmitting: boolean;
  onCedulaChange: (v: string) => void;
  onNombreChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputCls: string;
}

export default function PrestamoFormModal({
  isOpen, onClose, selectedLibroTitle,
  cedula, nombre, isSubmitting,
  onCedulaChange, onNombreChange, onSubmit, inputCls,
}: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    if (!cedula.trim()) {
      toast.error("La cédula del solicitante es obligatoria");
      e.preventDefault();
      return;
    }
    if (!nombre.trim()) {
      toast.error("El nombre del solicitante es obligatorio");
      e.preventDefault();
      return;
    }
    onSubmit(e);
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Registrar Préstamo</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Libro:{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedLibroTitle}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Cédula del Solicitante
            </label>
            <input
              type="text" value={cedula}
              onChange={(e) => onCedulaChange(e.target.value)}
              onKeyDown={limitNumericInput}
              disabled={isSubmitting}
              className={inputCls + " disabled:opacity-50"}
              placeholder="V-12345678" required
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre del Solicitante
            </label>
            <input
              type="text" value={nombre}
              onChange={(e) => onNombreChange(e.target.value)}
              disabled={isSubmitting}
              className={inputCls + " disabled:opacity-50"}
              placeholder="Ej. María López" required
            />
          </div>
          <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 dark:border-gray-700 mt-4">
            <button
              type="button" onClick={onClose} disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className="flex items-center justify-center min-w-[150px] px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Confirmar Préstamo"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
