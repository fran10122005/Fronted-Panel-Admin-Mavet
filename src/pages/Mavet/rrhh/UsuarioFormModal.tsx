import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../../components/ui/modal";
import { Trabajador } from "../../../types";
import { AlertCircle, Save, X, User, Mail, Lock, Shield } from "lucide-react";

const buildUsuarioSchema = (isCreation: boolean) =>
  z.object({
    id_trabajador: z.preprocess(
      (val) => (val === 0 || val === "0" || val === "" || val === null || val === undefined ? undefined : String(val)),
      z.string({ required_error: "El trabajador vinculado es obligatorio" }).min(1, "El trabajador vinculado es obligatorio")
    ),
    correo: z.string().email("Debe ser un correo válido"),
    password: z.string().optional(),
    id_rol: z.string().min(1, "El rol del sistema es obligatorio"),
    estado: z.preprocess((val) => val === "true" || val === true, z.boolean().optional()),
  }).superRefine((data, ctx) => {
    if (isCreation) {
      if (!data.password || data.password.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La contraseña es obligatoria para nuevos usuarios", path: ["password"] });
      }
    }
    if (data.password && data.password.length > 0) {
      if (data.password.length < 6) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La contraseña debe tener al menos 6 caracteres", path: ["password"] });
      }
      if (!/^[a-zA-Z0-9]+$/.test(data.password)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La contraseña solo debe contener letras y números (sin caracteres especiales)", path: ["password"] });
      }
    }
  });

export type UsuarioFormValues = z.infer<ReturnType<typeof buildUsuarioSchema>>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingUsuarioId: string | null;
  initialData: UsuarioFormValues;
  trabajadores: Trabajador[];
  roles: any[];
  isSubmitting: boolean;
  onSubmit: (data: UsuarioFormValues) => void;
  inputCls: string;
  isLastAdmin?: boolean;
}

const baseInputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all";
const baseSelectCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10";

export default function UsuarioFormModal({
  isOpen, onClose, editingUsuarioId, initialData,
  trabajadores, roles, isSubmitting, onSubmit, inputCls,
  isLastAdmin = false
}: Props) {
  const schema = useMemo(() => buildUsuarioSchema(editingUsuarioId === null), [editingUsuarioId]);
  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<UsuarioFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: initialData,
  });

  const watchedIdTrabajador = useWatch({ control, name: "id_trabajador" });
  const watchedCorreo = watch("correo");

  useEffect(() => {
    if (isOpen) reset(initialData);
  }, [isOpen, initialData, reset]);

  useEffect(() => {
    if (editingUsuarioId !== null) return;
    if (!watchedIdTrabajador || watchedIdTrabajador === "0" || watchedCorreo?.trim()) return;
    const t = trabajadores.find((tr) => String(tr.id) === String(watchedIdTrabajador));
    if (t?.correo) setValue("correo", t.correo);
  }, [watchedIdTrabajador, editingUsuarioId, watchedCorreo, trabajadores, setValue]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[420px] p-0">
      <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingUsuarioId !== null ? "Editar Usuario" : "Registrar Nuevo Usuario"}
            </h3>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLastAdmin && (
        <div className="mx-6 mt-4 flex items-start gap-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-900/30">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-xs">Este es el único administrador activo del sistema. Por seguridad, no se puede modificar su rol ni suspender su cuenta.</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-5">
        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 space-y-4 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <User className="w-3.5 h-3.5" />
            Datos del Usuario
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <select className={`${baseSelectCls} pl-10 ${errors.id_trabajador ? 'border-red-500' : ''}`}
              {...register("id_trabajador")}>
              <option value="">Seleccione un trabajador...</option>
              {trabajadores.map((t) => (
                <option key={t.id || t.cedula} value={t.id}>{t.cedula.replace(/^[VE]-/i, '')} - {t.nombre} {t.apellido}</option>
              ))}
            </select>
            {errors.id_trabajador && <p className="text-red-500 text-xs mt-1">{errors.id_trabajador.message}</p>}
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
              <Mail className="w-4 h-4 text-gray-400" />
            </div>
            <input type="email" placeholder="usuario@mavet.org"
              className={`${baseInputCls} pl-10 ${errors.correo ? 'border-red-500' : ''}`}
              {...register("correo")} />
            {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo.message}</p>}
          </div>

          {(editingUsuarioId === null) && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
              <input type="password" placeholder="••••••••"
                className={`${baseInputCls} pl-10 ${errors.password ? 'border-red-500' : ''}`}
                {...register("password")} />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              {!errors.password && <p className="text-xs text-gray-500 mt-1">Debe tener al menos 6 caracteres alfanuméricos.</p>}
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
              <Shield className="w-4 h-4 text-gray-400" />
            </div>
            <select className={`${baseSelectCls} pl-10 ${errors.id_rol ? 'border-red-500' : ''}`}
              {...register("id_rol")} disabled={isLastAdmin}>
              <option value="" disabled>Seleccione un rol...</option>
              {roles.map((r: any) => (
                <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
              ))}
            </select>
            {errors.id_rol && <p className="text-red-500 text-xs mt-1">{errors.id_rol.message}</p>}
          </div>

          {editingUsuarioId !== null && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <select className={baseSelectCls + " pl-10"} {...register("estado")} disabled={isLastAdmin}>
                <option value="true">Activo</option>
                <option value="false">Suspendido</option>
              </select>
            </div>
          )}
        </div>

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
            {isSubmitting ? "Guardando..." : editingUsuarioId !== null ? "Guardar Cambios" : "Crear Usuario"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
