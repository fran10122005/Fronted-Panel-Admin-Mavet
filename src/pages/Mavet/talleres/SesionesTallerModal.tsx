import React, { useState } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import { mavetApi } from "../../../services/api";
import toast from "react-hot-toast";

interface SesionesTallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  taller: any;
  sesiones: any[];
  metricas: any;
  onRefresh: (taller: any) => void;
}

export default function SesionesTallerModal({
  isOpen,
  onClose,
  taller,
  sesiones,
  metricas,
  onRefresh
}: SesionesTallerModalProps) {
  const [view, setView] = useState<"lista" | "crear" | "asistencia">("lista");
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevoTema, setNuevoTema] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedSesion, setSelectedSesion] = useState<any>(null);
  const [asistencias, setAsistencias] = useState<any[]>([]);

  const handleCrearSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaFecha || !nuevoTema) return toast.error("Fecha y tema son obligatorios");
    setIsSubmitting(true);
    try {
      await mavetApi.crearSesionTaller(taller.id_taller, { fecha: nuevaFecha, tema_impartido: nuevoTema });
      toast.success("Sesión creada");
      setView("lista");
      setNuevaFecha("");
      setNuevoTema("");
      onRefresh(taller);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAsistencia = async (sesion: any) => {
    setSelectedSesion(sesion);
    try {
      const data = await mavetApi.getAsistenciaSesion(sesion.id_sesion);
      setAsistencias(data);
      setView("asistencia");
    } catch {
      toast.error("Error al cargar asistencia");
    }
  };

  const toggleAsistencia = (id_alumno: number) => {
    setAsistencias(prev =>
      prev.map(a => (a.id_alumno === id_alumno ? { ...a, asistio: !a.asistio } : a))
    );
  };

  const handleGuardarAsistencia = async () => {
    setIsSubmitting(true);
    try {
      await mavetApi.guardarAsistenciaSesion(selectedSesion.id_sesion, asistencias.map(a => ({
        id_alumno: a.id_alumno,
        asistio: a.asistio
      })));
      toast.success("Asistencia guardada");
      setView("lista");
      onRefresh(taller);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl p-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Control de Asistencia</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Taller: <span className="font-semibold text-brand-600">{taller?.nombre_curso}</span>
            </p>
          </div>
          {view !== "lista" && (
            <button onClick={() => setView("lista")} className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">
              &larr; Volver
            </button>
          )}
        </div>

        {view === "lista" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-gray-800 dark:text-white">Sesiones ({sesiones.length})</h4>
                <Button size="sm" onClick={() => setView("crear")} startIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                }>Nueva Sesión</Button>
              </div>
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-2 font-medium">Fecha</th>
                      <th className="px-4 py-2 font-medium">Tema</th>
                      <th className="px-4 py-2 font-medium text-center">Asistentes</th>
                      <th className="px-4 py-2 font-medium text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {sesiones.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No hay sesiones creadas.</td></tr>
                    ) : (
                      sesiones.map(s => (
                        <tr key={s.id_sesion} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                          <td className="px-4 py-3">{new Date(s.fecha + "T12:00:00").toLocaleDateString('es-ES')}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.tema_impartido}</td>
                          <td className="px-4 py-3 text-center font-medium tabular-nums">{s.asistentes}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => openAsistencia(s)} className="text-brand-600 hover:text-brand-800 font-medium text-xs bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 px-3 py-1.5 rounded transition-colors">
                              Pasar Lista
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="md:col-span-1">
              <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-3">Métricas de Asistencia</h4>
              <div className="bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Alumnos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none mt-1">{metricas?.totalAlumnos || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Sesiones</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none mt-1">{metricas?.totalSesiones || 0}</p>
                  </div>
                </div>
                
                <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">Ranking de Asistencia</h5>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(!metricas?.alumnos || metricas.alumnos.length === 0) ? (
                    <p className="text-xs text-gray-500">Sin alumnos</p>
                  ) : (
                    metricas.alumnos.map((a: any) => (
                      <div key={a.id_alumno} className="flex justify-between items-center bg-white dark:bg-gray-800 rounded p-2 shadow-sm text-xs">
                        <span className="truncate pr-2 font-medium text-gray-800 dark:text-gray-200" title={`${a.nombres} ${a.apellidos}`}>
                          {a.nombres.split(' ')[0]} {a.apellidos.split(' ')[0]}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-gray-500 tabular-nums">{a.asistidas}/{a.totalSesiones}</span>
                          <span className={`font-bold tabular-nums w-9 text-right ${a.porcentaje >= 75 ? 'text-green-600' : a.porcentaje < 50 && a.totalSesiones > 1 ? 'text-red-500' : 'text-amber-500'}`}>
                            {a.porcentaje}%
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "crear" && (
          <form onSubmit={handleCrearSesion} className="max-w-md mx-auto py-6">
            <h4 className="text-base font-bold text-gray-800 dark:text-white mb-4">Nueva Sesión</h4>
            <div className="space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Fecha *</label>
                <input type="date" required value={nuevaFecha} onChange={e => setNuevaFecha(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:text-white show-date-picker" />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Tema Impartido *</label>
                <input type="text" required value={nuevoTema} onChange={e => setNuevoTema(e.target.value)} placeholder="Ej. Técnicas de Acuarela"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:text-white" />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setView("lista")} disabled={isSubmitting}>Cancelar</Button>
                <Button disabled={isSubmitting}>Crear Sesión</Button>
              </div>
            </div>
          </form>
        )}

        {view === "asistencia" && (
          <div>
            <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/30 rounded-lg p-3 mb-4">
              <p className="font-semibold text-brand-800 dark:text-brand-300">{selectedSesion?.tema_impartido}</p>
              <p className="text-xs text-brand-600 dark:text-brand-400">{new Date(selectedSesion?.fecha + "T12:00:00").toLocaleDateString('es-ES')}</p>
            </div>
            
            <div className="overflow-x-auto max-h-[50vh] border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 shadow-sm z-10">
                  <tr>
                    <th className="px-4 py-2 font-medium">Alumno</th>
                    <th className="px-4 py-2 font-medium w-32 text-center">Asistió</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 bg-white dark:bg-gray-900/20">
                  {asistencias.length === 0 ? (
                    <tr><td colSpan={2} className="px-4 py-6 text-center text-gray-500">No hay alumnos inscritos en este taller.</td></tr>
                  ) : (
                    asistencias.map(a => (
                      <tr key={a.id_alumno} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                          {a.nombres} {a.apellidos}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleAsistencia(a.id_alumno)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors duration-200 ease-in-out ${a.asistio ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-600'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${a.asistio ? 'translate-x-2.5' : '-translate-x-2.5'}`} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setView("lista")} disabled={isSubmitting}>Cancelar</Button>
              <Button onClick={handleGuardarAsistencia} disabled={isSubmitting || asistencias.length === 0}>Guardar Asistencia</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
