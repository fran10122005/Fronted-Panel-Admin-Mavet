import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../../components/ui/modal";
import { Trabajador } from "../../../types";

const usuarioSchema = z.object({
  id_trabajador: z.preprocess((val) => Number(val), z.number().optional()),
  correo: z.string().email("Debe ser un correo válido"),
  password: z.string().optional(),
  id_rol: z.preprocess((val) => Number(val), z.number().min(1, "El rol es obligatorio")),
  estado: z.preprocess((val) => val === "true" || val === true, z.boolean().optional()),
}).superRefine((data, ctx) => {
  if (data.password && data.password.length > 0 && data.password.length < 6) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La contraseña debe tener al menos 6 caracteres",
      path: ["password"],
    });
  }
});

export type UsuarioFormValues = z.infer<typeof usuarioSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingUsuarioId: number | null;
  initialData: UsuarioFormValues;
  trabajadores: Trabajador[];
  roles: any[];
  isSubmitting: boolean;
  onSubmit: (data: UsuarioFormValues) => void;
  inputCls: string;
}

const labelCls = "block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

export default function UsuarioFormModal({
  isOpen, onClose, editingUsuarioId, initialData,
  trabajadores, roles, isSubmitting, onSubmit, inputCls,
}: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialData);
    }
  }, [isOpen, initialData, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[420px] p-5">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {editingUsuarioId !== null ? "Editar Usuario" : "Registrar Nuevo Usuario"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
          <div>
            <label className={labelCls}>Trabajador Vinculado</label>
            <select
              className={inputCls}
              {...register("id_trabajador")}
            >
              <option value={0}>Ninguno (Opcional)</option>
              {trabajadores.map((t) => (
                <option key={t.id || t.cedula} value={t.id}>{t.nombre} {t.apellido}</option>
              ))}
            </select>
            {errors.id_trabajador && <p className="text-red-500 text-xs mt-1">{errors.id_trabajador.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Correo (Usuario de Acceso) <span className="text-red-500">*</span></label>
            <input
              type="email" placeholder="usuario@mavet.org"
              className={`${inputCls} ${errors.correo ? 'border-red-500' : ''}`}
              {...register("correo")}
            />
            {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo.message}</p>}
          </div>

          {editingUsuarioId === null && (
            <div>
              <label className={labelCls}>Contraseña Inicial <span className="text-red-500">*</span></label>
              <input
                type="password" placeholder="••••••••"
                className={`${inputCls} ${errors.password ? 'border-red-500' : ''}`}
                {...register("password")}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              {!errors.password && <p className="text-[11px] text-gray-500 mt-0.5">Debe tener al menos 6 caracteres.</p>}
            </div>
          )}

          <div>
            <label className={labelCls}>Rol del Sistema <span className="text-red-500">*</span></label>
            <select
              className={`${inputCls} ${errors.id_rol ? 'border-red-500' : ''}`}
              {...register("id_rol")}
            >
              <option value={0} disabled>Seleccione un rol...</option>
              {roles.map((r: any) => (
                <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
              ))}
            </select>
            {errors.id_rol && <p className="text-red-500 text-xs mt-1">{errors.id_rol.message}</p>}
          </div>

          {editingUsuarioId !== null && (
            <div>
              <label className={labelCls}>Estado</label>
              <select className={inputCls} {...register("estado")}>
                <option value="true">Activo</option>
                <option value="false">Inactivo (Borrado Lógico)</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-700 mt-2">
            <button
              type="button" onClick={onClose} disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold text-gray-650 dark:text-gray-450 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className="flex items-center justify-center min-w-[130px] px-4 py-1.5 text-xs font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : editingUsuarioId !== null ? "Guardar Cambios" : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
