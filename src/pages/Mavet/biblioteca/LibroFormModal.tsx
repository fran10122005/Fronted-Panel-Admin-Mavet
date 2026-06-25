import { Modal } from "../../../components/ui/modal";
import { Libro } from "../../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  libroFormData: Libro;
  autores: any[];
  categorias: any[];
  isSubmitting: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputCls: string;
}

export default function LibroFormModal({
  isOpen, onClose, isEditing, libroFormData,
  autores, categorias, isSubmitting,
  onChange, onSubmit, inputCls,
}: Props) {
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

        <form onSubmit={onSubmit} className="space-y-3">
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
                onChange={onChange} placeholder="Ej. 823.914 BEC"
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
                onChange={onChange} placeholder="Ej. BIB-001"
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
                Autor <span className="text-red-500">*</span>
              </label>
              <select
                name="id_autor" value={libroFormData.id_autor || ""}
                onChange={onChange} className={inputCls} required
              >
                <option value="" disabled>Seleccione un autor...</option>
                {autores.map((a: any) => (
                  <option key={a.id_autor} value={a.id_autor}>
                    {a.nombre} {a.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                name="id_categoria" value={libroFormData.id_categoria || ""}
                onChange={onChange} className={inputCls} required
              >
                <option value="" disabled>Seleccione una categoría...</option>
                {categorias.map((c: any) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre_categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Año del Libro
              </label>
              <input
                type="number" name="ano_libro" value={libroFormData.ano_libro || ""}
                onChange={onChange} placeholder="Ej. 2023"
                min={1000} max={2099} className={inputCls}
              />
            </div>
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha de Ingreso
              </label>
              <input
                type="date" name="fecha_ingreso" value={libroFormData.fecha_ingreso || ""}
                onChange={onChange} className={inputCls}
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
                onChange={onChange} min={1} className={inputCls} required
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
