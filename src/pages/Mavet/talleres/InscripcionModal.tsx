import { Modal } from "../../../components/ui/modal";
import { AlertCircle, UserPlus, X, User, Calendar, Phone, FileText } from "lucide-react";
import { limitNumericInput } from "../../../utils/validation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  talleres: any[];
  selectedTallerEnroll: any;
  enrollForm: {
    tallerId: string;
    alumnoCedula: string;
    alumnoNombre: string;
    alumnoEdad: string;
    repNombre: string;
    repCedula: string;
    repTelefono: string;
    correo: string;
  };
  esMenor: boolean;
  isSubmitting: boolean;
  formError: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputCls: string;
  selectCls: string;
}

const labelCls = "block mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300";
const baseInputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all";
const baseSelectCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10";

export default function InscripcionModal({
  isOpen, onClose, talleres, selectedTallerEnroll,
  enrollForm, esMenor, isSubmitting, formError,
  onChange, onSubmit, inputCls, selectCls,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-0">
      <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Inscribir Alumno</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Taller: <span className="font-semibold text-brand-600 dark:text-brand-400">{selectedTallerEnroll?.nombre_curso || ""}</span>
            </p>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <form onSubmit={onSubmit} className="p-6 space-y-5">
        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 space-y-4 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            Taller
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <select name="tallerId" value={enrollForm.tallerId} onChange={onChange} className={baseSelectCls + " pl-10"} required>
              {talleres.map(t => <option key={t.id_taller} value={t.id_taller}>{t.nombre_curso}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 space-y-4 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <User className="w-3.5 h-3.5" />
            Datos del Alumno
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.5.835 2.5 1.875M11 17.25c0-1.04.894-1.875 2-1.875" /></svg>
              </div>
              <input type="text" name="alumnoCedula" value={enrollForm.alumnoCedula} onChange={onChange}
                className={baseInputCls + " pl-10"} required disabled={isSubmitting} placeholder="V-12345678" />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <input type="text" name="alumnoNombre" value={enrollForm.alumnoNombre} onChange={onChange}
                className={baseInputCls + " pl-10"} required disabled={isSubmitting} placeholder="Ej. Carlos Mendoza" />
            </div>
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <input type="number" name="alumnoEdad" value={enrollForm.alumnoEdad}
                  onChange={onChange} onKeyDown={limitNumericInput}
                  className={baseInputCls + " pl-10"} required disabled={isSubmitting} placeholder="Edad" />
              </div>
              {enrollForm.alumnoEdad && !esMenor && (
                <p className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-1.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  Mayor de edad — no requiere representante.
                </p>
              )}
              {esMenor && (
                <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 mt-1.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Menor de edad — se requieren datos del representante.
                </p>
              )}
            </div>
          </div>
        </div>

        {esMenor && (
          <div className="bg-amber-50/50 dark:bg-amber-500/5 rounded-xl p-4 space-y-4 border border-amber-200 dark:border-amber-500/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              <User className="w-3.5 h-3.5" />
              Datos del Representante
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-amber-400" />
                </div>
                <input type="text" name="repNombre" value={enrollForm.repNombre} onChange={onChange}
                  className={baseInputCls + " pl-10"} required disabled={isSubmitting} placeholder="Ej. Ana Mendoza" />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.5.835 2.5 1.875M11 17.25c0-1.04.894-1.875 2-1.875" /></svg>
                </div>
                <input type="text" name="repCedula" value={enrollForm.repCedula} onChange={onChange}
                  className={baseInputCls + " pl-10"} required disabled={isSubmitting} placeholder="V-12345678" />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-amber-400" />
                </div>
                <input type="text" name="repTelefono" value={enrollForm.repTelefono}
                  onChange={onChange} onKeyDown={limitNumericInput}
                  className={baseInputCls + " pl-10"} disabled={isSubmitting} placeholder="0414-1234567" />
              </div>
            </div>
          </div>
        )}

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
              <UserPlus className="w-4 h-4" />
            )}
            {isSubmitting ? "Inscribiendo..." : "Inscribir Alumno"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
