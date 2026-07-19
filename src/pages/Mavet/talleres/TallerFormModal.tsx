import { Modal } from "../../../components/ui/modal";
import { AlertCircle, Save, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: { nombre: string; descripcion: string };
  isSubmitting: boolean;
  formError: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputCls: string;
}

const labelCls = "block mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300";
const baseInputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all";

export default function TallerFormModal({
  isOpen, onClose, isEditing, formData,
  isSubmitting, formError, onChange, onSubmit, inputCls,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-0">
      <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {isEditing ? "Editar Taller" : "Crear Taller"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {isEditing
                ? "Modifique los datos del taller en el inventario."
                : "Agregue un taller al inventario maestro."}
            </p>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <form onSubmit={onSubmit} className="p-6 space-y-5">
        <div>
          <label className={labelCls}>Nombre del Taller <span className="text-red-400">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <input type="text" name="nombre" value={formData.nombre}
              onChange={onChange} className={baseInputCls + " pl-10"} placeholder="Ej. Pintura al Óleo" required />
          </div>
        </div>
        <div>
          <label className={labelCls}>Descripción</label>
          <div className="relative">
            <div className="absolute top-3 left-3.5 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
            </div>
            <textarea rows={3} name="descripcion" value={formData.descripcion}
              onChange={onChange} className={baseInputCls + " pl-10 resize-none"} placeholder="Breve descripción del taller..." />
          </div>
        </div>

        {formError && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-900/30">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{formError}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
            <X className="w-4 h-4" />
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait">
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Guardar Taller"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
