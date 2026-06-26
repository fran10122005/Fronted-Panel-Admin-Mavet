import { Modal } from "../../../components/ui/modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: {
    id_taller_inventario: number;
    cedula_instructor: string;
    id_espacio: number;
    sesiones: string;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    horas_totales: number;
    cupo_minimo: number;
    cupo_maximo: number;
    estado: boolean;
  };
  inventario: any[];
  espacios: any[];
  isSubmitting: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onEstadoChange: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputCls: string;
  selectCls: string;
  cedulaInstructor: string;
  instructorNombre: string;
  instructorLoading: boolean;
  instructorError: string;
  instructorAuto: boolean;
  onCedulaChange: (value: string) => void;
  onCedulaSearch: () => void;
}

const labelCls = "block mb-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

export default function TallerDetailModal({
  isOpen, onClose, isEditing, formData,
  inventario, espacios,
  isSubmitting, onChange, onEstadoChange, onSubmit,
  inputCls, selectCls,
  cedulaInstructor, instructorNombre, instructorLoading, instructorError, instructorAuto,
  onCedulaChange, onCedulaSearch,
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
              <option value={0}>Seleccione un taller del inventario...</option>
              {inventario.map((i: any) => (
                <option key={i.id_taller || i.id} value={i.id_taller || i.id}>{i.nombre}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelCls}>Cédula del Instructor <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cedulaInstructor}
                  onChange={(e) => onCedulaChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onCedulaSearch();
                    }
                  }}
                  className={inputCls}
                  placeholder="Ej. V-12345678"
                />
                <button
                  type="button"
                  onClick={onCedulaSearch}
                  disabled={instructorLoading || !cedulaInstructor}
                  className="bg-brand-500 hover:bg-brand-600 text-white px-3 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50 shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="hidden sm:inline text-xs">Buscar</span>
                </button>
              </div>
              {instructorLoading && (
                <p className="text-xs text-brand-600 font-medium flex items-center gap-2 mt-1">
                  <span className="w-3 h-3 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
                  Buscando persona...
                </p>
              )}
              {instructorError && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 p-2.5 rounded-lg mt-1 border border-red-100 dark:border-red-900/30">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs font-medium">{instructorError}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className={labelCls}>Instructor <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                value={instructorNombre}
                readOnly={instructorAuto}
                className={inputCls + (instructorAuto ? " bg-gray-50 dark:bg-gray-800" : "")}
                placeholder="Se autocompleta con cédula"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Espacio / Sala</label>
              <select name="id_espacio" value={formData.id_espacio}
                onChange={onChange} className={selectCls}>
                <option value={0}>Seleccione...</option>
                {espacios.map(e => (
                  <option key={e.id_espacio} value={e.id_espacio}>{e.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Sesiones</label>
              <input type="number" name="sesiones" value={formData.sesiones}
                onChange={onChange} className={inputCls} min={1} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div>
              <label className={labelCls}>Cupo Mínimo</label>
              <input type="number" name="cupo_minimo" value={formData.cupo_minimo}
                onChange={onChange} className={inputCls} min={0} />
            </div>
            <div>
              <label className={labelCls}>Cupo Máximo</label>
              <input type="number" name="cupo_maximo" value={formData.cupo_maximo}
                onChange={onChange} className={inputCls} min={1} />
            </div>
            <div>
              <label className={labelCls}>Fecha del Taller</label>
              <input type="date" name="fecha" value={formData.fecha}
                onChange={onChange} className={inputCls + " show-date-picker"} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Hora Inicio</label>
              <input type="time" name="hora_inicio" value={formData.hora_inicio}
                onChange={onChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Hora Fin</label>
              <input type="time" name="hora_fin" value={formData.hora_fin}
                onChange={onChange} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Horas Totales</label>
              <input type="number" name="horas_totales" value={formData.horas_totales}
                onChange={onChange} className={inputCls} min={0} />
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
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center min-w-[150px] px-5 py-2.5 sm:py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait">
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Planificar Taller"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}