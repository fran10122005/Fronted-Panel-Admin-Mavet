import { useState, useEffect } from "react";
import { Modal } from "./modal";
import { mavetApi } from "../../services/api";
import toast from "react-hot-toast";

interface Movimiento {
  id_movimiento: string;
  tipo: string;
  descripcion: string;
  fecha: string;
  ubicacion_origen?: string;
  ubicacion_destino?: string;
  responsable?: string;
  observaciones?: string;
  created_at: string;
}

interface Props {
  obra: { id: string; titulo: string; codigo_inventario?: string } | null;
  onClose: () => void;
}

const TIPO_COLORS: Record<string, string> = {
  movimiento: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/40",
  restauracion: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/40",
  prestamo: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40",
  ingreso: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/40",
  baja: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/40",
};

export default function HistorialObraModal({ obra, onClose }: Props) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipo: "movimiento",
    descripcion: "",
    fecha: new Date().toISOString().split("T")[0],
    ubicacion_origen: "",
    ubicacion_destino: "",
    responsable: "",
    observaciones: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!obra) return;
    setIsLoading(true);
    mavetApi.getHistorialObra(obra.id)
      .then((res) => setMovimientos(res.data || []))
      .catch(() => toast.error("Error al cargar historial"))
      .finally(() => setIsLoading(false));
  }, [obra]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!obra) return;
    setIsSubmitting(true);
    try {
      await mavetApi.registrarMovimientoObra(obra.id, formData);
      toast.success("Movimiento registrado");
      setFormOpen(false);
      setFormData({ tipo: "movimiento", descripcion: "", fecha: new Date().toISOString().split("T")[0], ubicacion_origen: "", ubicacion_destino: "", responsable: "", observaciones: "" });
      const res = await mavetApi.getHistorialObra(obra.id);
      setMovimientos(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Error al registrar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={obra !== null} onClose={onClose} className="max-w-2xl p-0 overflow-hidden">
      {obra && (
        <div className="p-6">
          <div className="flex justify-between items-start mb-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Historial de la Obra</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {obra.titulo} {obra.codigo_inventario ? `(${obra.codigo_inventario})` : ""}
              </p>
            </div>
            <button
              onClick={() => setFormOpen(!formOpen)}
              className="px-3 py-1.5 text-xs font-semibold bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nuevo Movimiento
            </button>
          </div>

          {formOpen && (
            <form onSubmit={handleRegister} className="mb-5 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Tipo</label>
                  <select value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })} className="w-full border rounded-lg px-2 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="movimiento">Movimiento</option>
                    <option value="restauracion">Restauración</option>
                    <option value="prestamo">Préstamo</option>
                    <option value="ingreso">Ingreso</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Fecha</label>
                  <input type="date" value={formData.fecha} onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} required className="w-full border rounded-lg px-2 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Descripción *</label>
                <input type="text" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} required placeholder="Ej. Traslado a sala de exposición" className="w-full border rounded-lg px-2 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Ubicación Origen</label>
                  <input type="text" value={formData.ubicacion_origen} onChange={(e) => setFormData({ ...formData, ubicacion_origen: e.target.value })} placeholder="Ej. Bóveda" className="w-full border rounded-lg px-2 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Ubicación Destino</label>
                  <input type="text" value={formData.ubicacion_destino} onChange={(e) => setFormData({ ...formData, ubicacion_destino: e.target.value })} placeholder="Ej. Sala 1" className="w-full border rounded-lg px-2 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Responsable</label>
                  <input type="text" value={formData.responsable} onChange={(e) => setFormData({ ...formData, responsable: e.target.value })} placeholder="Nombre del responsable" className="w-full border rounded-lg px-2 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Observaciones</label>
                  <input type="text" value={formData.observaciones} onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} placeholder="Notas adicionales" className="w-full border rounded-lg px-2 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setFormOpen(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-3 py-1.5 text-xs font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-70">{isSubmitting ? "Guardando..." : "Guardar"}</button>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />)}
            </div>
          ) : movimientos.length === 0 ? (
            <div className="text-center py-10">
              <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">No hay movimientos registrados para esta obra.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {movimientos.map((m) => (
                <div key={m.id_movimiento} className="p-3 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${TIPO_COLORS[m.tipo] || TIPO_COLORS.movimiento}`}>
                          {m.tipo.charAt(0).toUpperCase() + m.tipo.slice(1)}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono">{new Date(m.fecha).toLocaleDateString("es-ES")}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{m.descripcion}</p>
                      {(m.ubicacion_origen || m.ubicacion_destino) && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {m.ubicacion_origen && <span>Desde: {m.ubicacion_origen}</span>}
                          {m.ubicacion_origen && m.ubicacion_destino && <span> → </span>}
                          {m.ubicacion_destino && <span>Hacia: {m.ubicacion_destino}</span>}
                        </p>
                      )}
                    </div>
                  </div>
                  {m.responsable && (
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between text-[11px] text-gray-400">
                      <span>Responsable: {m.responsable}</span>
                      {m.observaciones && <span>{m.observaciones}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700">Cerrar</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
