import { useState, useEffect, useMemo, useCallback } from "react";
import { mavetApi } from "../../services/api";
import { formatHoras } from "../../utils/formatters";
import { useDebounce } from "../../hooks/useDebounce";
import { useAuth, getUserRole } from "../../context/AuthContext";
import Pagination from "../../components/ui/Pagination";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import AsistenciaModal from "../../components/AsistenciaModal";
import ObservacionModal from "./rrhh/ObservacionModal";
import JustificacionModal from "./rrhh/JustificacionModal";
import ExportarAsistenciaModal from "./rrhh/ExportarAsistenciaModal";
import type { RegistroAsistencia, ResumenSemanalTrabajador } from "../../types";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 20;

export default function AsistenciaPersonal() {
  const { user } = useAuth();
  const userRole = getUserRole(user);
  const isGerente = userRole === "Gerente";

  const [asistencias, setAsistencias] = useState<RegistroAsistencia[]>([]);
  const [resumenSemanal, setResumenSemanal] = useState<ResumenSemanalTrabajador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [asistPage, setAsistPage] = useState(1);
  const [asistTotalPages, setAsistTotalPages] = useState(1);
  const [asistTotalItems, setAsistTotalItems] = useState(0);

  const [asistFecha, setAsistFecha] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });

  const [isRegistroOpen, setIsRegistroOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [observacionModalData, setObservacionModalData] = useState<{ id: string; observaciones: string } | null>(null);
  const [selectedForJustificacion, setSelectedForJustificacion] = useState<ResumenSemanalTrabajador | null>(null);

  const refreshAsistencias = useCallback(async (page: number, date?: string) => {
    const targetDate = date ?? asistFecha;
    try {
      const res = await mavetApi.getAsistencia(page, ITEMS_PER_PAGE, targetDate);
      setAsistencias(res.data);
      setAsistPage(res.currentPage);
      setAsistTotalPages(res.totalPages);
      setAsistTotalItems(res.totalItems);
    } catch {
      toast.error("Error al cargar registros de asistencia");
    }
  }, [asistFecha]);

  const refreshResumenSemanal = useCallback(async () => {
    try {
      const data = await mavetApi.getResumenSemanalTodos();
      setResumenSemanal(data);
    } catch {
      // silently fail
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([refreshAsistencias(1), refreshResumenSemanal()]);
    setIsLoading(false);
  }, [refreshAsistencias, refreshResumenSemanal]);

  useEffect(() => {
    loadData();
  }, []);

  const handleFechaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAsistFecha(val);
    refreshAsistencias(1, val);
  }, [refreshAsistencias]);

  const handleUpdateObservaciones = useCallback(async (id: string, observaciones: string) => {
    try {
      await mavetApi.updateAsistenciaObservaciones(id, observaciones);
      setAsistencias((prev) =>
        prev.map((a) => (a.id === id ? { ...a, observaciones } : a))
      );
    } catch {
      toast.error("Error al actualizar observaciones");
      throw new Error("Error al actualizar observaciones");
    }
  }, []);

  const handleJustificarSemana = useCallback(async (cedula: string, texto: string, horas_justificadas: number) => {
    try {
      await mavetApi.justificarHoras(cedula, texto, horas_justificadas);
      await refreshResumenSemanal();
    } catch {
      toast.error("Error al guardar justificación");
      throw new Error("Error al guardar justificación");
    }
  }, [refreshResumenSemanal]);

  const filteredAsistencias = useMemo(() =>
    asistencias.filter((a) =>
      a.trabajadorNombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      a.cedula.toLowerCase().includes(debouncedSearch.toLowerCase())
    ), [asistencias, debouncedSearch]);

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registro de Asistencia Personal</h1>
          <p className="text-sm text-gray-500">Control de asistencia del personal del Museo MAVET</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsRegistroOpen(true)}
            className="bg-brand-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors flex items-center gap-2 text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Registrar Entrada/Salida
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="bg-white text-gray-700 border border-gray-300 font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
          >
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="date"
                value={asistFecha}
                onChange={handleFechaChange}
                className="pl-10 h-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="relative w-full max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por cédula o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <LoadingSkeleton variant="table" rows={8} cols={6} />
          </div>
        ) : (
          <>
            {/* Resumen Semanal */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-700">
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 select-none">
                  <svg className={`w-4 h-4 transition-transform group-open:rotate-90`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                  Resumen Semanal
                  <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">({resumenSemanal.length} trabajadores)</span>
                </summary>

                <div className="mt-2 pl-6 flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1"><span className="text-green-600 dark:text-green-400 text-sm">✓</span> Completo</div>
                  <div className="flex items-center gap-1"><span className="text-blue-600 dark:text-blue-400 text-sm">📝</span> Justificado</div>
                  <div className="flex items-center gap-1"><span className="text-amber-500 text-sm">⚠</span> Incompleto</div>
                </div>

                <div className="mt-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-900/80 text-gray-800 dark:text-gray-300 uppercase text-xs font-bold border-b border-gray-300 dark:border-gray-700">
                        <th className="px-3 py-2">Trabajador</th>
                        <th className="px-3 py-2">Cargo</th>
                        <th className="px-3 py-2 text-center">Req.</th>
                        <th className="px-3 py-2 text-center">Acum.</th>
                        <th className="px-3 py-2 text-center">Restan</th>
                        <th className="px-3 py-2 text-center">Cumplió</th>
                        <th className="px-3 py-2">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-200 dark:divide-gray-700">
                      {resumenSemanal.length === 0 ? (
                        <tr><td colSpan={7} className="px-3 py-4 text-center text-gray-500"><p className="font-medium">No hay datos esta semana</p></td></tr>
                      ) : resumenSemanal.map((r) => (
                        <tr key={r.id_trabajador} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-3 py-2 font-semibold text-xs">{r.nombres} {r.apellidos}</td>
                          <td className="px-3 py-2 text-gray-600 dark:text-gray-400 text-xs">{r.cargo || "—"}</td>
                          <td className="px-3 py-2 text-center text-xs">{r.horas_semanales > 0 ? `${r.horas_semanales}h` : "—"}</td>
                          <td className="px-3 py-2 text-center text-xs font-medium">{r.horas_acumuladas > 0 ? `${r.horas_acumuladas}h` : "0h"}</td>
                          <td className={`px-3 py-2 text-center text-xs font-medium ${r.horas_restantes > 0 ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"}`}>{r.horas_restantes > 0 ? `${r.horas_restantes}h` : "0h"}</td>
                          <td className="px-3 py-2 text-center">
                            {r.cumplio ? (
                              <span className="text-green-600 dark:text-green-400 text-lg" title="Completo">✓</span>
                            ) : r.justificado ? (
                              <span className="text-blue-600 dark:text-blue-400 text-lg" title="Justificado">📝</span>
                            ) : (
                              <span className="text-amber-500 text-lg" title="Incompleto">⚠</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              {r.observaciones ? (
                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]" title={r.observaciones}>{r.observaciones}</span>
                              ) : null}
                              {!r.cumplio && !r.justificado && !isGerente && new Date().getDay() === 3 && (
                                <button
                                  onClick={() => setSelectedForJustificacion(r)}
                                  className="text-xs font-semibold rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 transition-colors px-2.5 py-1"
                                >
                                  Justificar
                                </button>
                              )}
                              {r.cumplio && (
                                <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">Completo</span>
                              )}
                              {r.justificado && (
                                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">Justificado</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </div>

            {/* Tabla de Asistencias */}
            <div className="overflow-x-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-900/80 text-gray-800 dark:text-gray-300 uppercase text-xs font-bold border-b border-gray-300 dark:border-gray-700">
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2">Cédula</th>
                    <th className="px-4 py-2">Nombre y Apellido</th>
                    <th className="px-4 py-2">Cargo</th>
                    <th className="px-4 py-2 text-center border-l border-gray-200 dark:border-gray-700 text-green-700 dark:text-green-400">Entrada</th>
                    <th className="px-4 py-2 text-center text-red-600 dark:text-red-400">Salida</th>
                    <th className="px-4 py-2 text-center">Horas</th>
                    <th className="px-4 py-2">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAsistencias.length === 0 ? (
                    <tr><td colSpan={8} className="px-5 py-6 text-center text-gray-500"><p className="font-medium">No hay registros de asistencia para esta fecha</p></td></tr>
                  ) : filteredAsistencias.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-2 font-mono text-xs text-gray-500">{a.fecha}</td>
                      <td className="px-4 py-2 font-mono text-xs font-semibold">{a.cedula}</td>
                      <td className="px-4 py-2 font-semibold">{a.trabajadorNombre}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400 text-xs">{a.cargo}</td>
                      <td className="px-4 py-2 text-center font-mono text-xs border-l border-gray-100 dark:border-gray-700">
                        <span className={a.entrada !== "-" ? "text-green-700 dark:text-green-400 font-semibold" : "text-gray-300 dark:text-gray-600"}>{a.entrada}</span>
                      </td>
                      <td className="px-4 py-2 text-center font-mono text-xs">
                        <span className={a.salida !== "-" ? "text-red-600 dark:text-red-400 font-semibold" : "text-gray-300 dark:text-gray-600"}>{a.salida}</span>
                      </td>
                      <td className="px-4 py-2 text-center font-semibold text-sm">{a.horasCumplidas != null ? formatHoras(a.horasCumplidas) : "—"}</td>
                      <td className="px-4 py-2 max-w-[160px]">
                        {isGerente ? (
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate block max-w-[120px]" title={a.observaciones || ""}>
                            {a.observaciones || "—"}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[120px]" title={a.observaciones || ""}>
                              {a.observaciones || "—"}
                            </span>
                            <button
                              onClick={() => setObservacionModalData({ id: a.id, observaciones: a.observaciones || "" })}
                              className="p-1 text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                              title="Añadir o editar observación"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="px-5 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <Pagination
                currentPage={asistPage}
                totalPages={asistTotalPages}
                totalItems={asistTotalItems}
                pageSize={ITEMS_PER_PAGE}
                label="asistencias"
                onPageChange={refreshAsistencias}
              />
            </div>
          </>
        )}
      </div>

      {/* Kiosko Modal */}
      <AsistenciaModal
        isOpen={isRegistroOpen}
        onClose={() => {
          setIsRegistroOpen(false);
          refreshAsistencias(asistPage);
          refreshResumenSemanal();
        }}
      />

      {/* Observaciones Modal */}
      <ObservacionModal
        isOpen={!!observacionModalData}
        onClose={() => setObservacionModalData(null)}
        observacionData={observacionModalData}
        onSave={handleUpdateObservaciones}
      />

      {/* Justificación Modal */}
      <JustificacionModal
        trabajador={selectedForJustificacion}
        onClose={() => setSelectedForJustificacion(null)}
        onSave={handleJustificarSemana}
      />

      {/* Exportar Asistencia Modal */}
      <ExportarAsistenciaModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={(params) => {
          import("../../services/pdf.service").then(m => m.exportarReporteAsistencia(params));
        }}
      />
    </div>
  );
}
