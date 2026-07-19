import { useState, useEffect, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { mavetApi } from "../../services/api";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import { exportarReporteAuditoria } from "../../services/pdf.service";

const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white/90 dark:bg-gray-900";

const tipoLabel: Record<string, string> = {
  login: "Inicio de sesión",
  logout: "Cierre de sesión",
  create: "Creación",
  update: "Actualización",
  delete: "Eliminación",
  restore: "Restauración",
  export: "Exportación",
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtro, setFiltro] = useState({ tipo: "", desde: "", hasta: "" });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (filtro.tipo) params.tipo = filtro.tipo;
      if (filtro.desde) params.desde = filtro.desde;
      if (filtro.hasta) params.hasta = filtro.hasta;
      const res = await mavetApi.getAuditLogs(params);
      setLogs(res.data);
      setTotalPages(res.meta.totalPages);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, filtro]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <>
      <PageMeta title="MAVET | Bitácora de Auditoría" description="Registro de accesos y acciones del sistema" />
      <PageBreadcrumb pageTitle="Bitácora de Auditoría" />
      <div className="space-y-5">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">Filtros</h4>
            <button
              onClick={() => exportarReporteAuditoria(filtro.tipo || filtro.desde || filtro.hasta ? filtro : undefined)}
              className="bg-brand-500 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-brand-600 transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generar Reporte
            </button>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo de Acción</label>
                <select value={filtro.tipo} onChange={e => { setFiltro(f => ({ ...f, tipo: e.target.value })); setPage(1); }}
                  className={inputCls}>
                  <option value="">Todos</option>
                  <option value="login">Inicio de sesión</option>
                  <option value="logout">Cierre de sesión</option>
                  <option value="create">Creación</option>
                  <option value="update">Actualización</option>
                  <option value="delete">Eliminación</option>
                  <option value="restore">Restauración</option>
                  <option value="export">Exportación</option>
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Desde</label>
                <input type="date" value={filtro.desde} onChange={e => { setFiltro(f => ({ ...f, desde: e.target.value })); setPage(1); }}
                  className={inputCls} />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hasta</label>
                <input type="date" value={filtro.hasta} onChange={e => { setFiltro(f => ({ ...f, hasta: e.target.value })); setPage(1); }}
                  className={inputCls} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">Registro de Actividad</h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {loading ? "..." : `${logs.length} registros`}
            </span>
          </div>
          <div className="p-5">
            {loading ? (
              <LoadingSkeleton rows={8} />
            ) : logs.length === 0 ? (
              <div className="text-center py-10 text-sm text-gray-500 dark:text-gray-400">
                No hay registros de actividad disponibles.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pr-3">Fecha y Hora</th>
                    <th className="pb-3 pr-3">Usuario</th>
                    <th className="pb-3 pr-3">Acción</th>
                    <th className="pb-3 pr-3">Detalle</th>
                    <th className="pb-3">Dirección IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={log.id ?? i} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <td className="py-3 pr-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {log.fecha ? new Date(log.fecha).toLocaleString("es-VE", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit", second: "2-digit"
                        }) : "—"}
                      </td>
                      <td className="py-3 pr-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {log.usuario || log.correo || "—"}
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                          log.tipo === "login" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                          log.tipo === "logout" ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" :
                          log.tipo === "delete" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" :
                          log.tipo === "create" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                        }`}>
                          {tipoLabel[log.tipo] || log.tipo || "—"}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {log.detalle || log.descripcion || "—"}
                      </td>
                      <td className="py-3 text-xs text-gray-500 dark:text-gray-500 font-mono">
                        {log.ip || log.direccion_ip || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-5 mt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Página {page} de {totalPages}
                </span>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">
                    Anterior
                  </button>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
