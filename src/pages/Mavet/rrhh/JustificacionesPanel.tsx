import React, { useState, useEffect, useCallback } from "react";
import { mavetApi } from "../../../services/api";
import { Justificacion } from "../../../types";
import toast from "react-hot-toast";

const TIPOS_JUSTIFICACION = [
  { value: "falta_dia_completo", label: "Falta día completo" },
  { value: "falta_parcial", label: "Falta parcial" },
  { value: "llegada_tardia", label: "Llegada tardía" },
  { value: "salida_anticipada", label: "Salida anticipada" },
];

interface Props {
  idTrabajador: string | null;
}

export default function JustificacionesPanel({ idTrabajador }: Props) {
  const [justificaciones, setJustificaciones] = useState<Justificacion[]>([]);
  const [loading, setLoading] = useState(false);

  const [nuevaJustif, setNuevaJustif] = useState({ fecha: "", tipo: "falta_dia_completo", motivo: "", descripcion: "", hora_inicio: "", hora_fin: "", archivo: null as File | null });
  const [creandoJustif, setCreandoJustif] = useState(false);
  const [justifFile, setJustifFile] = useState<File | null>(null);

  const loadJustificaciones = useCallback(async () => {
    if (!idTrabajador) return;
    setLoading(true);
    try {
      const j = await mavetApi.getJustificaciones(idTrabajador);
      setJustificaciones(j);
    } catch (e) {
      toast.error("Error cargando justificaciones");
    } finally {
      setLoading(false);
    }
  }, [idTrabajador]);

  useEffect(() => {
    loadJustificaciones();
  }, [loadJustificaciones]);

  const handleCrearJustificacion = async () => {
    if (!idTrabajador) {
      toast.error("Primero guarde el trabajador para poder crear justificaciones");
      return;
    }
    if (!nuevaJustif.fecha || !nuevaJustif.motivo) {
      toast.error("Fecha y motivo son obligatorios");
      return;
    }
    
    const requiereHora = ["falta_parcial", "llegada_tardia", "salida_anticipada"].includes(nuevaJustif.tipo);
    if (requiereHora && (!nuevaJustif.hora_inicio || !nuevaJustif.hora_fin)) {
      toast.error("Para este tipo de justificación se requiere especificar el rango de horas");
      return;
    }

    setCreandoJustif(true);
    try {
      const j = await mavetApi.crearJustificacion(idTrabajador, {
        fecha: nuevaJustif.fecha,
        tipo: nuevaJustif.tipo,
        motivo: nuevaJustif.motivo,
        descripcion: nuevaJustif.descripcion || undefined,
        hora_inicio: requiereHora ? nuevaJustif.hora_inicio : undefined,
        hora_fin: requiereHora ? nuevaJustif.hora_fin : undefined,
      }, justifFile || undefined);
      setJustificaciones(prev => [j, ...prev]);
      setNuevaJustif({ fecha: "", tipo: "falta_dia_completo", motivo: "", descripcion: "", hora_inicio: "", hora_fin: "", archivo: null });
      setJustifFile(null);
      toast.success("Justificación creada");
    } catch (err: any) {
      toast.error(err.message || "Error al crear justificación");
    } finally {
      setCreandoJustif(false);
    }
  };

  const handleEliminarJustificacion = async (idJustificacion: string) => {
    if (!idTrabajador) return;
    try {
      await mavetApi.eliminarJustificacion(idTrabajador, idJustificacion);
      setJustificaciones(prev => prev.filter(j => j.id_justificacion !== idJustificacion));
      toast.success("Justificación eliminada");
    } catch (err: any) {
      toast.error("Error al eliminar justificación");
    }
  };

  const labelCls = "block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";
  const requiereHora = ["falta_parcial", "llegada_tardia", "salida_anticipada"].includes(nuevaJustif.tipo);

  if (!idTrabajador) {
    return (
      <div className="p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Primero guarde el trabajador para gestionar justificaciones</p>
      </div>
    );
  }

  return (
    <div>
      <details className="group mb-4">
        <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 select-none p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
          <svg className={`w-4 h-4 transition-transform group-open:rotate-90`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          Nueva Justificación
        </summary>
        <div className="mt-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3 bg-white dark:bg-gray-800/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Fecha</label>
              <input
                type="date"
                value={nuevaJustif.fecha}
                onChange={(e) => setNuevaJustif(prev => ({ ...prev, fecha: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className={labelCls}>Tipo</label>
              <select
                value={nuevaJustif.tipo}
                onChange={(e) => setNuevaJustif(prev => ({ ...prev, tipo: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
              >
                {TIPOS_JUSTIFICACION.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {requiereHora && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Hora de inicio</label>
                <input
                  type="time"
                  value={nuevaJustif.hora_inicio}
                  onChange={(e) => setNuevaJustif(prev => ({ ...prev, hora_inicio: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className={labelCls}>Hora de fin</label>
                <input
                  type="time"
                  value={nuevaJustif.hora_fin}
                  onChange={(e) => setNuevaJustif(prev => ({ ...prev, hora_fin: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className={labelCls}>Motivo</label>
            <input
              type="text"
              value={nuevaJustif.motivo}
              onChange={(e) => setNuevaJustif(prev => ({ ...prev, motivo: e.target.value }))}
              placeholder="Razón de la justificación"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className={labelCls}>Descripción (opcional)</label>
            <textarea
              value={nuevaJustif.descripcion}
              onChange={(e) => setNuevaJustif(prev => ({ ...prev, descripcion: e.target.value }))}
              rows={2}
              placeholder="Detalle adicional"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className={labelCls}>Archivo soporte (opcional)</label>
            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 text-xs font-medium text-white bg-gray-500 rounded-lg hover:bg-gray-600 cursor-pointer transition">
                {justifFile ? justifFile.name : "Seleccionar archivo"}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => setJustifFile(e.target.files?.[0] || null)}
                />
              </label>
              {justifFile && (
                <button
                  type="button"
                  onClick={() => setJustifFile(null)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Quitar
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCrearJustificacion}
              disabled={creandoJustif}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition disabled:opacity-60 flex items-center gap-1"
            >
              {creandoJustif ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              Crear Justificación
            </button>
          </div>
        </div>
      </details>

      {loading ? (
        <div className="flex justify-center p-4">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : justificaciones.length === 0 ? (
        <div className="p-6 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-400">No hay justificaciones registradas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {justificaciones.map(j => (
            <div key={j.id_justificacion} className="flex items-start justify-between gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
              <div className="flex gap-3">
                <div className={`p-2 rounded-lg ${
                  j.estado === 'aprobada' ? 'bg-green-50 text-green-600 dark:bg-green-950' :
                  j.estado === 'rechazada' ? 'bg-red-50 text-red-600 dark:bg-red-950' :
                  'bg-amber-50 text-amber-600 dark:bg-amber-950'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {new Date(j.fecha + 'T12:00:00').toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400">
                      {TIPOS_JUSTIFICACION.find(t => t.value === j.tipo)?.label || j.tipo}
                    </span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      j.estado === 'aprobada' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400' :
                      j.estado === 'rechazada' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400' :
                      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400'
                    }`}>
                      {j.estado === 'aprobada' ? 'Aprobada' : j.estado === 'rechazada' ? 'Rechazada' : 'Pendiente'}
                    </span>
                  </div>
                  
                  {(j.hora_inicio || j.hora_fin) && (
                    <p className="text-[11px] text-gray-500 font-mono mt-1">
                      Horas afectadas: {j.hora_inicio || '—'} a {j.hora_fin || '—'}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-medium">{j.motivo}</p>
                  {j.descripcion && <p className="text-[10px] text-gray-500 mt-0.5">{j.descripcion}</p>}
                  
                  {j.archivo_ruta && (
                    <a href={j.archivo_ruta} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-brand-600 hover:text-brand-700 mt-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Ver archivo adjunto
                    </a>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleEliminarJustificacion(j.id_justificacion)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                title="Eliminar justificación"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
