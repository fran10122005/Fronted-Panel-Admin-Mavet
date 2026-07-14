import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/modal";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  observacionData: { id: string; observaciones: string } | null;
  onSave: (id: string, observaciones: string) => Promise<void>;
}

export default function ObservacionModal({ isOpen, onClose, observacionData, onSave }: Props) {
  const [texto, setTexto] = useState(observacionData?.observaciones || "");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTexto(observacionData?.observaciones || "");
    }
  }, [isOpen, observacionData]);

  const handleGuardar = async () => {
    if (!observacionData) return;
    setGuardando(true);
    try {
      await onSave(observacionData.id, texto.trim());
      toast.success("Observación actualizada");
      onClose();
    } catch {
      toast.error("Error al actualizar la observación");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      className="max-w-md p-0 overflow-hidden"
    >
      <div className="bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Añadir Observación
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observación
            </label>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none outline-none transition-all placeholder-gray-400"
              rows={4}
              placeholder="Escribe la observación aquí..."
            ></textarea>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={guardando}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 dark:bg-brand-500 border border-transparent rounded-lg hover:bg-brand-700 dark:hover:bg-brand-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {guardando ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
