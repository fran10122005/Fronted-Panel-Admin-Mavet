import { Modal } from "../../../components/ui/modal";
import { limitNumericInput } from "../../../utils/validation";
import { AlertCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: {
    id_taller_inventario: string;
    selectedInstructorId: string;
    id_espacio: string;
    sesiones: string;
    fecha: string;
    fecha_fin: string;
    hora_inicio: string;
    hora_fin: string;
    horas_totales: number | string;
    cupo_minimo: number | string;
    cupo_maximo: number | string;
    estado: boolean;
  };
  inventario: any[];
  instructores: any[];
  espacios: any[];
  isSubmitting: boolean;
  formError: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onEstadoChange: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputCls: string;
  selectCls: string;
}

const labelCls = "block mb-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

export default function TallerDetailModal({
  isOpen, onClose, isEditing, formData,
  inventario, instructores, espacios,
  isSubmitting, formError, onChange, onEstadoChange, onSubmit,
  inputCls, selectCls,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[580px] p-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {isEditing ? "Editar Taller Planificado" : "Planificar Taller"}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Programe una edición del taller con fecha, instructor y cupos.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Taller <span className="text-red-500">*</span></label>
            <select name="id_taller_inventario" value={formData.id_taller_inventario}
              onChange={onChange} className={selectCls} required>
              <option value="">Seleccione un taller del inventario...</option>
              {inventario.map((i: any) => (
                <option key={i.id_taller || i.id} value={i.id_taller || i.id}>{i.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Instructor <span className="text-red-500">*</span></label>
            <select name="selectedInstructorId" value={formData.selectedInstructorId}
              onChange={onChange} className={selectCls} required>
              <option value="">Seleccione un instructor...</option>
              {instructores.map((inst: any) => (
                <option key={inst.id_instructor} value={inst.id_instructor}>
                  {inst.Persona?.nombres || ""} {inst.Persona?.apellidos || ""} {inst.Persona?.cedula ? `(${inst.Persona.cedula})` : ""}
                </option>
              ))}
            </select>
            {instructores.length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">No hay instructores registrados. Use el botón "Gestionar Instructores" en la página para agregar uno.</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Espacio / Sala</label>
              <select name="id_espacio" value={formData.id_espacio}
                onChange={onChange} className={selectCls}>
                <option value="">Seleccione...</option>
                {espacios.map(e => (
                  <option key={e.id_espacio} value={e.id_espacio}>{e.nombre_espacio || e.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Sesiones</label>
              <input type="number" name="sesiones" value={formData.sesiones}
                onChange={(e) => { onChange(e); e.target.reportValidity(); }} onKeyDown={limitNumericInput} className={inputCls} min={1} max={20} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div>
              <label className={labelCls}>Cupo Mínimo</label>
              <input type="number" name="cupo_minimo" value={formData.cupo_minimo}
                onChange={(e) => { onChange(e); e.target.reportValidity(); }} onKeyDown={limitNumericInput} className={inputCls} min={2} max={30} />
            </div>
            <div>
              <label className={labelCls}>Cupo Máximo</label>
              <input type="number" name="cupo_maximo" value={formData.cupo_maximo}
                onChange={(e) => { onChange(e); e.target.reportValidity(); }} onKeyDown={limitNumericInput} className={inputCls} min={2} max={30} />
            </div>
            <div>
              <label className={labelCls}>Fecha del Taller</label>
              <input type="date" name="fecha" value={formData.fecha}
                min={new Date().toISOString().split("T")[0]}
                max="9999-12-31"
                onChange={(e) => { onChange(e); e.target.reportValidity(); }} className={inputCls + " show-date-picker"} />
            </div>
            {Number(formData.sesiones) > 1 && (
              <div>
                <label className={labelCls}>Fecha de Fin</label>
                <input type="date" name="fecha_fin" value={formData.fecha_fin}
                  min={formData.fecha || new Date().toISOString().split("T")[0]}
                  max="9999-12-31"
                  onChange={(e) => { onChange(e); e.target.reportValidity(); }} className={inputCls + " show-date-picker"} />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Hora Inicio</label>
              <input type="time" name="hora_inicio" value={formData.hora_inicio}
                onChange={(e) => { onChange(e); e.target.reportValidity(); }} className={inputCls} min="09:00" max="17:00" />
            </div>
            <div>
              <label className={labelCls}>Hora Fin</label>
              <input type="time" name="hora_fin" value={formData.hora_fin}
                onChange={(e) => { onChange(e); e.target.reportValidity(); }} className={inputCls} min="09:00" max="17:00" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Horas Totales
                <span className="ml-1.5 text-[9px] font-bold text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-1.5 py-0.5 rounded-full tracking-wide">AUTO</span>
              </label>
              <input type="number" name="horas_totales" value={formData.horas_totales}
                readOnly
                className={inputCls + " bg-gray-50 dark:bg-gray-800/50 text-brand-600 dark:text-brand-400 font-semibold cursor-not-allowed"} min={0} />
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <select name="estado" value={formData.estado ? "true" : "false"}
                onChange={e => onEstadoChange(e.target.value === "true")}
                className={selectCls}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
          {formError && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-900/30">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{formError}</p>
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
              ) : isEditing ? "Guardar Cambios" : "Planificar Taller"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
