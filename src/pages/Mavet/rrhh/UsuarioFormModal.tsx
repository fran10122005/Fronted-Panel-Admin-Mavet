import { Modal } from "../../../components/ui/modal";
import { Trabajador } from "../../../types";
import { validateEmail } from "../../../utils/validation";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingUsuarioId: number | null;
  formUsuario: {
    correo: string;
    password: string;
    id_rol: number;
    id_trabajador: number;
    estado: boolean;
  };
  trabajadores: Trabajador[];
  roles: any[];
  isSubmitting: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputCls: string;
}

const labelCls = "block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

export default function UsuarioFormModal({
  isOpen, onClose, editingUsuarioId, formUsuario,
  trabajadores, roles, isSubmitting,
  onChange, onSubmit, inputCls,
}: Props) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formUsuario.correo.trim()) {
      const err = validateEmail(formUsuario.correo, "Correo");
      if (err) { toast.error(err); return; }
    }
    if (editingUsuarioId === null && formUsuario.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    onSubmit(e);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[420px] p-5">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {editingUsuarioId !== null ? "Editar Usuario" : "Registrar Nuevo Usuario"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={labelCls}>Trabajador Vinculado</label>
            <select name="id_trabajador" value={formUsuario.id_trabajador} onChange={onChange} className={inputCls}>
              <option value={0}>Ninguno (Opcional)</option>
              {trabajadores.map((t) => (
                <option key={t.id || t.cedula} value={t.id}>{t.nombre} {t.apellido}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Correo (Usuario de Acceso)</label>
            <input type="email" name="correo" value={formUsuario.correo} onChange={onChange} placeholder="usuario@mavet.org" className={inputCls} required />
          </div>

          {editingUsuarioId === null && (
            <div>
              <label className={labelCls}>Contraseña Inicial</label>
              <input type="password" name="password" value={formUsuario.password} onChange={onChange} placeholder="••••••••" className={inputCls} required minLength={6} />
              <p className="text-[11px] text-gray-500 mt-0.5">Debe tener al menos 6 caracteres.</p>
            </div>
          )}

          <div>
            <label className={labelCls}>Rol del Sistema</label>
            <select name="id_rol" value={formUsuario.id_rol} onChange={onChange} className={inputCls} required>
              <option value={0} disabled>Seleccione un rol...</option>
              {roles.map((r: any) => (
                <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
              ))}
            </select>
          </div>

          {editingUsuarioId !== null && (
            <div>
              <label className={labelCls}>Estado</label>
              <select name="estado" value={formUsuario.estado ? "true" : "false"} onChange={onChange} className={inputCls}>
                <option value="true">Activo</option>
                <option value="false">Inactivo (Borrado Lógico)</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-700 mt-2">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-1.5 text-xs font-semibold text-gray-650 dark:text-gray-450 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting || formUsuario.id_rol === 0} className="flex items-center justify-center min-w-[130px] px-4 py-1.5 text-xs font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait">
              {isSubmitting ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                : editingUsuarioId !== null ? "Guardar Cambios" : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
