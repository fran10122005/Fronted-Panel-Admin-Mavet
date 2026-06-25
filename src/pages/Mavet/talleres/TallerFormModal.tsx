import { Modal } from "../../../components/ui/modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: { nombre: string; descripcion: string };
  isSubmitting: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputCls: string;
}

const labelCls = "block mb-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

export default function TallerFormModal({
  isOpen, onClose, isEditing, formData,
  isSubmitting, onChange, onSubmit, inputCls,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {isEditing ? "Editar Taller" : "Crear Taller"}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          {isEditing
            ? "Modifique los datos del taller en el inventario."
            : "Agregue un taller al inventario maestro."}
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Nombre del Taller <span className="text-red-500">*</span></label>
            <input
              type="text" name="nombre" value={formData.nombre}
              onChange={onChange}
              className={inputCls} placeholder="Ej. Pintura al Óleo" required
            />
          </div>
          <div>
            <label className={labelCls}>Descripción</label>
            <textarea rows={3} name="descripcion" value={formData.descripcion}
              onChange={onChange}
              className={inputCls + " resize-none"} placeholder="Breve descripción del taller..." />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center min-w-[130px] px-5 py-2.5 sm:py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait">
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isEditing ? "Actualizar" : "Guardar Taller"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
