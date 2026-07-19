import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../../components/ui/modal";
import { AlertCircle, Book, Save, X, User, Tags, Calendar, Hash, MapPin, Layers } from "lucide-react";

const currentYear = new Date().getFullYear();
const todayStr = new Date().toISOString().split("T")[0];

const libroSchema = z.object({
  titulo: z.string().min(1, "El título es obligatorio"),
  cuota: z.string().optional(),
  unidad: z.string().optional(),
  estante: z.string().optional(),
  autorNombre: z.string().min(1, "El nombre del autor es obligatorio"),
  autorApellido: z.string().optional(),
  id_categoria: z.string().min(1, "Seleccione una categoría"),
  customCategoria: z.string().optional(),
  ano_libro: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z.number().min(1000, "Mínimo 1000").max(currentYear, `El año del libro no puede ser mayor a ${currentYear}`).optional()
  ),
  fecha_ingreso: z.string().optional(),
  cantidad_total: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Debe ser al menos 1")
  ),
  estado: z.string().optional(),
}).refine((data) => {
  if (data.id_categoria === "-1" && (!data.customCategoria || data.customCategoria.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Especifique la nueva categoría",
  path: ["customCategoria"]
}).refine((data) => {
  if (!data.fecha_ingreso) return true;
  return data.fecha_ingreso <= todayStr;
}, {
  message: "La fecha de ingreso no puede ser posterior al día de hoy",
  path: ["fecha_ingreso"]
});

export type LibroFormValues = z.infer<typeof libroSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  initialData: any;
  categorias: any[];
  isSubmitting: boolean;
  formError: string;
  onSubmit: (data: LibroFormValues) => void;
  inputCls: string;
}

const labelCls = "block mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300";
const baseInputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all";

export default function LibroFormModal({
  isOpen, onClose, isEditing, initialData,
  categorias, isSubmitting, formError, onSubmit, inputCls,
}: Props) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<LibroFormValues>({
    resolver: zodResolver(libroSchema) as any,
    defaultValues: initialData,
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialData);
    }
  }, [isOpen, initialData, reset]);

  const selectedCategoria = watch("id_categoria");

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[620px] p-0">
      <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {isEditing ? "Editar Libro" : "Registrar Nuevo Libro"}
            </h3>
            {isEditing && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Unidad: <span className="font-semibold text-brand-600 dark:text-brand-400">{initialData.unidad || initialData.id}</span>
              </p>
            )}
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-5">
        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 space-y-4 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <Book className="w-3.5 h-3.5" />
            Información del Libro
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                <Book className="w-4 h-4 text-gray-400" />
              </div>
              <input type="text" placeholder="Nombre del libro"
                className={`${baseInputCls} pl-10 ${errors.titulo ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                {...register("titulo")} />
              {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo.message}</p>}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                <Hash className="w-4 h-4 text-gray-400" />
              </div>
              <input type="text" placeholder="Ej. C-001"
                className={baseInputCls + " pl-10"}
                {...register("cuota")} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                <Layers className="w-4 h-4 text-gray-400" />
              </div>
              <input type="text" readOnly tabIndex={-1}
                className={baseInputCls + " pl-10 bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed opacity-70"}
                {...register("unidad")} />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                <MapPin className="w-4 h-4 text-gray-400" />
              </div>
              <input type="text" placeholder="Ej. Estante A - Fila 2"
                className={baseInputCls + " pl-10"}
                {...register("estante")} />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 space-y-4 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <User className="w-3.5 h-3.5" />
            Autor
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <input type="text" placeholder="Ej. Gabriel"
                className={`${baseInputCls} pl-10 ${errors.autorNombre ? 'border-red-500' : ''}`}
                {...register("autorNombre")} />
              {errors.autorNombre && <p className="text-red-500 text-xs mt-1">{errors.autorNombre.message}</p>}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <input type="text" placeholder="Ej. García Márquez"
                className={baseInputCls + " pl-10"}
                {...register("autorApellido")} />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 space-y-4 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <Tags className="w-3.5 h-3.5" />
            Clasificación
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                <Tags className="w-4 h-4 text-gray-400" />
              </div>
              <select className={`${baseInputCls} pl-10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10 ${errors.id_categoria ? 'border-red-500' : ''}`}
                {...register("id_categoria")}>
                <option value="" disabled>Seleccione una categoría...</option>
                {categorias.map((c: any) => (
                  <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>
                ))}
                <option value="-1">➕ Otra...</option>
              </select>
              {errors.id_categoria && <p className="text-red-500 text-xs mt-1">{errors.id_categoria.message}</p>}
              {selectedCategoria === "-1" && (
                <div className="mt-2">
                  <input type="text" placeholder="Escriba el nombre de la nueva categoría..."
                    className={`${baseInputCls} ${errors.customCategoria ? 'border-red-500' : ''}`}
                    {...register("customCategoria")} autoFocus />
                  {errors.customCategoria && <p className="text-red-500 text-xs mt-1">{errors.customCategoria.message}</p>}
                </div>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <input type="number" placeholder="Ej. 2023"
                className={`${baseInputCls} pl-10 ${errors.ano_libro ? 'border-red-500' : ''}`}
                {...register("ano_libro")} />
              {errors.ano_libro && <p className="text-red-500 text-xs mt-1">{errors.ano_libro.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <input type="date" max={new Date().toISOString().split('T')[0]}
                className={`${baseInputCls} pl-10 ${errors.fecha_ingreso ? 'border-red-500' : ''}`}
                {...register("fecha_ingreso")} />
              {errors.fecha_ingreso && <p className="text-red-500 text-xs mt-1">{errors.fecha_ingreso.message}</p>}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                <Hash className="w-4 h-4 text-gray-400" />
              </div>
              <input type="number" min={1} placeholder="Cantidad de ejemplares"
                className={`${baseInputCls} pl-10 ${errors.cantidad_total ? 'border-red-500' : ''}`}
                {...register("cantidad_total")} />
              {errors.cantidad_total && <p className="text-red-500 text-xs mt-1">{errors.cantidad_total.message}</p>}
            </div>
          </div>
          <div>
            <label className={labelCls}>Estado</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <select className={baseInputCls + " pl-10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10"}
                {...register("estado")}>
                <option value="Aprobado">Aprobado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Descartado/Venta">Descartado/Venta</option>
              </select>
            </div>
          </div>
        </div>

        {formError && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-900/30">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{formError}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose}
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
            {isSubmitting ? "Guardando..." : isEditing ? "Actualizar Libro" : "Registrar Libro"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
