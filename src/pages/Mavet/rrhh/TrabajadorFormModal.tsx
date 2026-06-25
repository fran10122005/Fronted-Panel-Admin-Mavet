import { Modal } from "../../../components/ui/modal";
import { Cargo } from "../../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingTrabajadorId: number | null;
  formData: {
    cedula: string;
    nombres: string;
    apellidos: string;
    telefono: string;
    correo_personal: string;
    id_cargo: number;
    horas_semanales: number;
    estado: "Activo" | "Inactivo";
    fecha_nacimiento: string;
    direccion: string;
    fecha_ingreso: string;
  };
  cargos: Cargo[];
  isSubmitting: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputCls: string;
}

const labelCls = "block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

export default function TrabajadorFormModal({
  isOpen, onClose, editingTrabajadorId, formData,
  cargos, isSubmitting, onChange, onSubmit, inputCls,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] p-5">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {editingTrabajadorId !== null ? "Editar Trabajador" : "Registrar Nuevo Trabajador"}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Complete los datos del trabajador. Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <h5 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Datos Personales</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Nombres <span className="text-red-500">*</span></label>
                <input type="text" name="nombres" value={formData.nombres} onChange={onChange} placeholder="Ej. Ricardo Andrés" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Apellidos <span className="text-red-500">*</span></label>
                <input type="text" name="apellidos" value={formData.apellidos} onChange={onChange} placeholder="Ej. López Martínez" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Cédula <span className="text-red-500">*</span></label>
                <input type="text" name="cedula" value={formData.cedula} onChange={onChange} placeholder="V-12345678" className={inputCls} required
                  readOnly={editingTrabajadorId !== null} />
              </div>
              <div>
                <label className={labelCls}>Fecha de Nacimiento</label>
                <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={onChange} className={inputCls + " show-date-picker"} />
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Contacto</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Teléfono</label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={onChange} placeholder="0414-1234567" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Correo Personal</label>
                <input type="email" name="correo_personal" value={formData.correo_personal} onChange={onChange} placeholder="ejemplo@correo.com" className={inputCls} />
              </div>
            </div>
            <div className="mt-3">
              <label className={labelCls}>Dirección</label>
              <input type="text" name="direccion" value={formData.direccion} onChange={onChange} placeholder="Ej. Av. Principal, Urb. Las Flores, Casa N° 10" className={inputCls} />
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Información Laboral</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Cargo <span className="text-red-500">*</span></label>
                <select name="id_cargo" value={formData.id_cargo} onChange={onChange} className={inputCls} required>
                  <option value={0} disabled>Seleccione un cargo...</option>
                  {cargos.map((c) => (
                    <option key={c.id_cargo} value={c.id_cargo}>{c.nombre_cargo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Horas Semanales</label>
                <input type="number" name="horas_semanales" value={formData.horas_semanales} onChange={onChange} placeholder="Ej. 40" min={0} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Fecha de Ingreso</label>
                <input type="date" name="fecha_ingreso" value={formData.fecha_ingreso} onChange={onChange} className={inputCls + " show-date-picker"} />
              </div>
              <div>
                <label className={labelCls}>Estado</label>
                <select name="estado" value={formData.estado} onChange={onChange} className={inputCls}>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting || formData.id_cargo === 0} className="flex items-center justify-center min-w-[130px] px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait">
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : editingTrabajadorId !== null ? "Guardar Cambios" : "Registrar Trabajador"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
