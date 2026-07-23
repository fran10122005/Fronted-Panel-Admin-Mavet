import { useState, useEffect, useMemo, useCallback } from "react";
import { mavetApi } from "../../services/api";
import { formatHoras } from "../../utils/formatters";
import { useDebounce } from "../../hooks/useDebounce";
import { useAuth, getUserRole } from "../../context/AuthContext";
import Pagination from "../../components/ui/Pagination";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import AsistenciaModal from "../../components/AsistenciaModal";
import ObservacionModal from "./rrhh/ObservacionModal";
import JustificacionesPanel from "./rrhh/JustificacionesPanel";
import CircularProgress from "../../components/ui/CircularProgress";
import { Modal } from "../../components/ui/modal";
import ExportarAsistenciaModal from "./rrhh/ExportarAsistenciaModal";
import type { RegistroAsistencia, ResumenSemanalTrabajador } from "../../types";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import Tabs from "../../components/ui/Tabs";

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
  const [justificarModalTrabajadorId, setJustificarModalTrabajadorId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'diario' | 'semanal'>('diario');
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



  const filteredAsistencias = useMemo(() =>
    asistencias.filter((a) =>
      a.trabajadorNombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      a.cedula.toLowerCase().includes(debouncedSearch.toLowerCase())
    ), [asistencias, debouncedSearch]);

  return (
    <div className="space-y-6 relative">
      <PageHeader
        title="Registro de Asistencia Personal"
        subtitle="Control de asistencia del personal del Museo MAVET"
        actions={
          <>
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
          </>
        }
      />

      <Tabs
        variant="underline"
        tabs={[
          { id: "diario", label: "Registro Diario" },
          { id: "semanal", label: "Resumen Semanal" },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as "diario" | "semanal")}
      />

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm min-h-[400px] flex flex-col">
        {activeTab === 'diario' && (
          <>
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
              <div className="flex flex-col flex-1">
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left table-auto">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-900/80 text-gray-600 dark:text-gray-400 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Cédula</th>
                        <th className="px-4 py-3">Nombre y Apellido</th>
                        <th className="px-4 py-3">Cargo</th>
                        <th className="px-4 py-3 text-center border-l border-gray-200 dark:border-gray-700 text-green-700 dark:text-green-400">Entrada</th>
                        <th className="px-4 py-3 text-center text-red-600 dark:text-red-400">Salida</th>
                        <th className="px-4 py-3 text-center">Horas</th>
                        <th className="px-4 py-3">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredAsistencias.length === 0 ? (
                        <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500"><p className="font-medium">No hay registros de asistencia para esta fecha</p></td></tr>
                      ) : filteredAsistencias.map((a) => (
                        <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">{a.fecha}</td>
                          <td className="px-4 py-3 font-mono text-xs font-semibold">{a.cedula}</td>
                          <td className="px-4 py-3 font-semibold">{a.trabajadorNombre}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{a.cargo}</td>
                          <td className="px-4 py-3 text-center font-mono text-xs border-l border-gray-100 dark:border-gray-700">
                            <span className={a.entrada !== "-" ? "text-green-700 dark:text-green-400 font-semibold" : "text-gray-300 dark:text-gray-600"}>{a.entrada}</span>
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-xs">
                            <span className={a.salida !== "-" ? "text-red-600 dark:text-red-400 font-semibold" : "text-gray-300 dark:text-gray-600"}>{a.salida}</span>
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-sm">{a.horasCumplidas != null ? formatHoras(a.horasCumplidas) : "—"}</td>
                          <td className="px-4 py-3">
                            {isGerente ? (
                              <span className="text-xs text-gray-500 dark:text-gray-400 truncate block max-w-[150px]" title={a.observaciones || ""}>
                                {a.observaciones || "—"}
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[150px]" title={a.observaciones || ""}>
                                  {a.observaciones || "—"}
                                </span>
                                <button
                                  onClick={() => setObservacionModalData({ id: a.id, observaciones: a.observaciones || "" })}
                                  className="p-1.5 text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
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
                <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 mt-auto">
                  <Pagination
                    currentPage={asistPage}
                    totalPages={asistTotalPages}
                    totalItems={asistTotalItems}
                    pageSize={ITEMS_PER_PAGE}
                    label="asistencias"
                    onPageChange={refreshAsistencias}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'semanal' && (
          <div className="p-6 custom-scrollbar">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Estado de Horas de la Semana Actual</h2>
              <div className="flex gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 block"></span> Completo</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 block"></span> Justificado</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span> Incompleto</span>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-64 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                ))}
              </div>
            ) : resumenSemanal.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No hay datos de trabajadores registrados.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {resumenSemanal.map(r => (
                  <div key={r.id_trabajador} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center relative overflow-hidden group">
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      {r.cumplio ? (
                        <span className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-green-200 dark:border-green-800/30">
                          ✓ Completo
                        </span>
                      ) : r.justificado ? (
                        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-blue-200 dark:border-blue-800/30">
                          Justificado
                        </span>
                      ) : (
                        <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-amber-200 dark:border-amber-800/30">
                          Incompleto
                        </span>
                      )}
                    </div>

                    {/* Circular Progress */}
                    <div className="mt-8 mb-4">
                      <CircularProgress 
                        percentage={(r.horas_acumuladas / (r.horas_semanales || 1)) * 100}
                        color={r.cumplio ? "text-green-500" : r.justificado ? "text-blue-500" : "text-amber-500"}
                        trackColor="text-gray-100 dark:text-gray-700/50"
                        size={100}
                        strokeWidth={8}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{r.horas_acumuladas}h</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">de {r.horas_semanales}h</span>
                        </div>
                      </CircularProgress>
                    </div>

                    {/* Info */}
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate w-full px-2" title={`${r.nombres} ${r.apellidos}`}>{r.nombres} {r.apellidos}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate w-full px-2">{r.cargo || "—"}</p>

                    {r.horas_restantes > 0 && !r.cumplio && (
                      <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg w-full mb-3 border border-amber-100 dark:border-amber-900/30">
                        Faltan {r.horas_restantes} horas
                      </p>
                    )}

                    {r.observaciones && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3 italic line-clamp-2 px-2">"{r.observaciones}"</p>
                    )}

                    <div className="mt-auto w-full pt-3">
                      <button
                        onClick={() => setJustificarModalTrabajadorId(r.id_trabajador?.toString() ?? null)}
                        className="w-full py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Gestionar Justificaciones
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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



      {/* Exportar Asistencia Modal */}
      <ExportarAsistenciaModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={(params) => {
          import("../../services/pdf.service").then(m => m.exportarReporteAsistencia(params));
        }}
      />

      {/* Modal para Gestionar Justificaciones in-situ */}
      <Modal 
        isOpen={!!justificarModalTrabajadorId} 
        onClose={() => { 
          setJustificarModalTrabajadorId(null);
          refreshResumenSemanal();
        }} 
        className="max-w-2xl p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gestionar Justificaciones</h3>
          <button onClick={() => { setJustificarModalTrabajadorId(null); refreshResumenSemanal(); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
          <JustificacionesPanel idTrabajador={justificarModalTrabajadorId} />
        </div>
      </Modal>
    </div>
  );
}
