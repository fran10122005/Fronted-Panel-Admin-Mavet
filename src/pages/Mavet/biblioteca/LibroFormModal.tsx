import { Modal } from "../../../components/ui/modal";
import { Libro } from "../../../types";
import { limitNumericInput } from "../../../utils/validation";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  libroFormData: Libro;
  categorias: any[];
  isSubmitting: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputCls: string;
  customCategoria?: string;
  onCustomCategoriaChange?: (value: string) => void;
  autorNombre?: string;
  autorApellido?: string;
}

export default function LibroFormModal({
  isOpen, onClose, isEditing, libroFormData,
  categorias, isSubmitting,
  onChange, onSubmit, inputCls,
  customCategoria = "", onCustomCategoriaChange,
  autorNombre = "", autorApellido = "",
}: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    if (!libroFormData.titulo?.trim()) {
      toast.error("El título es obligatorio");
      e.preventDefault();
      return;
    }
    if (!autorNombre.trim() && !autorApellido.trim()) {
      toast.error("El nombre del autor es obligatorio");
      e.preventDefault();
      return;
    }
    if (libroFormData.ano_libro) {
      const ano = Number(libroFormData.ano_libro);
      if (isNaN(ano) || ano < 1000 || ano > 2099) {
        toast.error("El año debe estar entre 1000 y 2099");
        e.preventDefault();
        return;
      }
    }
    if (libroFormData.cantidad_total === undefined || libroFormData.cantidad_total < 1) {
      toast.error("La cantidad total debe ser al menos 1");
      e.preventDefault();
      return;
    }
    onSubmit(e);
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[620px] p-5">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">
          {isEditing ? "Editar Libro" : "Registrar Nuevo Libro"}
        </h3>
        {isEditing && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Unidad: <span className="font-semibold text-brand-600">{libroFormData.unidad || libroFormData.id}</span>
          </p>
        )}
        {!isEditing && <div className="mb-4" />}

        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text" name="titulo" value={libroFormData.titulo}
                onChange={onChange} placeholder="Nombre del libro"
                className={inputCls} required
              />
            </div>
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cuota (Nº Catalogación)
              </label>
              <input
                type="text" name="cuota" value={libroFormData.cuota || ""}
                onChange={onChange} onKeyDown={limitNumericInput} placeholder="Ej. 823.914 BEC"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Unidad (Código de unidad)
              </label>
              <input
                type="text" name="unidad" value={libroFormData.unidad || ""}
                onChange={onChange} onKeyDown={limitNumericInput} placeholder="Ej. BIB-001"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estante / Ubicación Física
              </label>
              <input
                type="text" name="estante" value={libroFormData.estante || ""}
                onChange={onChange} placeholder="Ej. Estante A - Fila 2"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nombre del Autor <span className="text-red-500">*</span>
              </label>
              <input
                type="text" name="autorNombre" value={autorNombre}
                onChange={onChange} placeholder="Ej. Gabriel"
                className={inputCls} required
              />
            </div>
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Apellido del Autor
              </label>
              <input
                type="text" name="autorApellido" value={autorApellido}
                onChange={onChange} placeholder="Ej. García Márquez"
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                name="id_categoria" value={libroFormData.id_categoria ?? ""}
                onChange={onChange} className={inputCls} required
              >
                <option value="" disabled>Seleccione una categoría...</option>
                {categorias.map((c: any) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre_categoria}
                  </option>
                ))}
                <option value="-1">➕ Otra...</option>
              </select>
              {libroFormData.id_categoria === -1 && (
                <input
                  type="text"
                  value={customCategoria}
                  onChange={(e) => onCustomCategoriaChange?.(e.target.value)}
                  placeholder="Escriba el nombre de la nueva categoría..."
                  className={`${inputCls} mt-2`}
                  autoFocus
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Año del Libro
              </label>
              <input
                type="number" name="ano_libro" value={libroFormData.ano_libro || ""}
                onChange={onChange} onKeyDown={limitNumericInput} placeholder="Ej. 2023"
                min={1000} max={2099} className={inputCls}
              />
            </div>
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha de Ingreso
              </label>
              <input
                type="date" name="fecha_ingreso" value={libroFormData.fecha_ingreso || ""}
                onChange={onChange} max={new Date().toISOString().split('T')[0]} className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cantidad Total (Ejemplares) <span className="text-red-500">*</span>
              </label>
              <input
                type="number" name="cantidad_total" value={libroFormData.cantidad_total}
                onChange={onChange} onKeyDown={limitNumericInput} min={1} className={inputCls} required
              />
            </div>
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </label>
              <select
                name="estado" value={libroFormData.estado}
                onChange={onChange} className={inputCls}
              >
                <option value="Aprobado">Aprobado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Descartado/Venta">Descartado/Venta</option>
              </select>
            </div>
          </div>

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
