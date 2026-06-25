import { Modal } from "../../../components/ui/modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  talleres: any[];
  selectedTallerEnroll: any;
  enrollForm: {
    tallerId: string;
    alumnoNombre: string;
    alumnoEdad: string;
    repNombre: string;
    repCedula: string;
    repTelefono: string;
    correo: string;
  };
  esMenor: boolean;
  isSubmitting: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputCls: string;
  selectCls: string;
}

const labelCls = "block mb-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

export default function InscripcionModal({
  isOpen, onClose, talleres, selectedTallerEnroll,
  enrollForm, esMenor, isSubmitting,
  onChange, onSubmit, inputCls, selectCls,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Inscribir Alumno</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          Taller: <span className="font-semibold text-brand-600 dark:text-brand-400">{selectedTallerEnroll?.nombre_curso || ""}</span>
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Taller o Curso</label>
            <select name="tallerId" value={enrollForm.tallerId} onChange={onChange} className={selectCls} required>
              {talleres.map(t => <option key={t.id_taller} value={t.id_taller}>{t.nombre_curso}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nombre del Alumno <span className="text-red-500">*</span></label>
              <input type="text" name="alumnoNombre" value={enrollForm.alumnoNombre} onChange={onChange}
                className={inputCls} required disabled={isSubmitting} placeholder="Ej. Carlos Mendoza" />
            </div>
            <div>
              <label className={labelCls}>Edad <span className="text-red-500">*</span></label>
              <input type="number" name="alumnoEdad" value={enrollForm.alumnoEdad} onChange={onChange}
                className={inputCls} required disabled={isSubmitting} placeholder="Ej. 12" />
              {enrollForm.alumnoEdad && !esMenor && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Mayor de edad — no requiere representante.</p>
              )}
              {esMenor && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Menor de edad — se requieren datos del representante.</p>
              )}
            </div>
          </div>
          {esMenor && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-amber-50/50 dark:bg-amber-500/5 rounded-lg border border-amber-200 dark:border-amber-500/20">
              <div>
                <label className={labelCls}>Nombre del Representante</label>
                <input type="text" name="repNombre" value={enrollForm.repNombre} onChange={onChange}
                  className={inputCls} required disabled={isSubmitting} placeholder="Ej. Ana Mendoza" />
              </div>
              <div>
                <label className={labelCls}>Cédula</label>
                <input type="text" name="repCedula" value={enrollForm.repCedula} onChange={onChange}
                  className={inputCls} required disabled={isSubmitting} placeholder="V-12345678" />
              </div>
              <div>
                <label className={labelCls}>Teléfono</label>
                <input type="text" name="repTelefono" value={enrollForm.repTelefono} onChange={onChange}
                  className={inputCls} disabled={isSubmitting} placeholder="0414-1234567" />
              </div>
            </div>
          )}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center min-w-[150px] px-5 py-2.5 sm:py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait">
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Inscribir Alumno"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
