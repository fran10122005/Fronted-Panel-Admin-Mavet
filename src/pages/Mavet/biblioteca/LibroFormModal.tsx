import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../../components/ui/modal";
import { AlertCircle } from "lucide-react";

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

export default function LibroFormModal({
  isOpen, onClose, isEditing, initialData,
  categorias, isSubmitting, formError, onSubmit, inputCls,
}: Props) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<LibroFormValues>({
    resolver: zodResolver(libroSchema) as any,
    defaultValues: initialData,
  });

  // Reset form when initialData changes or modal opens
  useEffect(() => {
    if (isOpen) {
      reset(initialData);
    }
  }, [isOpen, initialData, reset]);

  const selectedCategoria = watch("id_categoria");

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[620px] p-5">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">
          {isEditing ? "Editar Libro" : "Registrar Nuevo Libro"}
        </h3>
        {isEditing && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Unidad: <span className="font-semibold text-brand-600">{initialData.unidad || initialData.id}</span>
          </p>
        )}
        {!isEditing && <div className="mb-4" />}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text" placeholder="Nombre del libro"
                className={`${inputCls} ${errors.titulo ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                {...register("titulo")}
              />
              {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo.message}</p>}
            </div>
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cuota (Nº Catalogación)
              </label>
              <input
                type="text" placeholder="Ej. C-001"
                className={inputCls}
                {...register("cuota")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Unidad (Código de unidad)
              </label>
              <input
                type="text" readOnly tabIndex={-1}
                className={inputCls + " bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-70"}
                {...register("unidad")}
              />
            </div>
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estante / Ubicación Física
              </label>
              <input
                type="text" placeholder="Ej. Estante A - Fila 2"
                className={inputCls}
                {...register("estante")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nombre del Autor <span className="text-red-500">*</span>
              </label>
              <input
                type="text" placeholder="Ej. Gabriel"
                className={`${inputCls} ${errors.autorNombre ? 'border-red-500' : ''}`}
                {...register("autorNombre")}
              />
              {errors.autorNombre && <p className="text-red-500 text-xs mt-1">{errors.autorNombre.message}</p>}
            </div>
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Apellido del Autor
              </label>
              <input
                type="text" placeholder="Ej. García Márquez"
                className={inputCls}
                {...register("autorApellido")}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                className={`${inputCls} ${errors.id_categoria ? 'border-red-500' : ''}`}
                {...register("id_categoria")}
              >
                <option value="" disabled>Seleccione una categoría...</option>
                {categorias.map((c: any) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre_categoria}
                  </option>
                ))}
                <option value="-1">➕ Otra...</option>
              </select>
              {errors.id_categoria && <p className="text-red-500 text-xs mt-1">{errors.id_categoria.message}</p>}
              
              {selectedCategoria === "-1" && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Escriba el nombre de la nueva categoría..."
                    className={`${inputCls} ${errors.customCategoria ? 'border-red-500' : ''}`}
                    {...register("customCategoria")}
                    autoFocus
                  />
                  {errors.customCategoria && <p className="text-red-500 text-xs mt-1">{errors.customCategoria.message}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Año del Libro
              </label>
              <input
                type="number" placeholder="Ej. 2023"
                className={`${inputCls} ${errors.ano_libro ? 'border-red-500' : ''}`}
                {...register("ano_libro")}
              />
              {errors.ano_libro && <p className="text-red-500 text-xs mt-1">{errors.ano_libro.message}</p>}
            </div>
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha de Ingreso
              </label>
              <input
                type="date" max={new Date().toISOString().split('T')[0]}
                className={`${inputCls} ${errors.fecha_ingreso ? 'border-red-500' : ''}`}
                {...register("fecha_ingreso")}
              />
              {errors.fecha_ingreso && <p className="text-red-500 text-xs mt-1">{errors.fecha_ingreso.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cantidad Total (Ejemplares) <span className="text-red-500">*</span>
              </label>
              <input
                type="number" min={1}
                className={`${inputCls} ${errors.cantidad_total ? 'border-red-500' : ''}`}
                {...register("cantidad_total")}
              />
              {errors.cantidad_total && <p className="text-red-500 text-xs mt-1">{errors.cantidad_total.message}</p>}
            </div>
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </label>
              <select
                className={inputCls}
                {...register("estado")}
              >
                <option value="Aprobado">Aprobado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Descartado/Venta">Descartado/Venta</option>
              </select>
            </div>
          </div>

          {formError && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-900/30">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{formError}</p>
            </div>
          )}
          <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button" onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-gray-650 dark:text-gray-450 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className="flex items-center justify-center min-w-[130px] px-4 py-1.5 text-xs font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isEditing ? (
                "Actualizar Libro"
              ) : (
                "Registrar Libro"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
