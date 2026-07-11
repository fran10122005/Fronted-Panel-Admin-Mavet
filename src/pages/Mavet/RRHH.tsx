import { useRRHH, ITEMS_PER_PAGE } from "../../hooks/useRRHH";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import TrabajadorFormModal from "./rrhh/TrabajadorFormModal";
import UsuarioFormModal from "./rrhh/UsuarioFormModal";
import TrabajadorDetailModal from "./rrhh/TrabajadorDetailModal";
import JustificacionModal from "./rrhh/JustificacionModal";
import { exportarCarnetTrabajador } from "../../services/pdf.service";
import { useAuth } from "../../context/AuthContext";

const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none dark:text-white/90";

function formatHoras(h: number): string {
  const totalMinutos = Math.floor(h * 60);
  const hrs = Math.floor(totalMinutos / 60);
  const min = totalMinutos % 60;
  if (hrs === 0) return `${min} min`;
  if (min === 0) return `${hrs}h`;
  return `${hrs}h ${min}min`;
}

export default function RRHH() {
  const { user } = useAuth();
  const userRole = user?.Role?.nombre_rol || user?.rol || "Administrador";
  const isGerente = userRole === "Gerente";

  const {
    trabajadores, cargos, roles,
    isLoading, activeTab, setActiveTab,
    searchTerm, setSearchTerm,
    formData, formUsuario, isSubmitting,
    confirm, setConfirm,
    editingTrabajadorId, editingUsuarioId,
    selectedTrabajadorForDetail, setSelectedTrabajadorForDetail,
    trabajPage, trabajTotalPages, trabajTotalItems,
    asistPage, asistTotalPages, asistTotalItems,
    refreshTrabajadores, refreshAsistencias, refreshData,
    filteredAsistencias, filteredTrabajadores, filteredUsuarios,
    isOpenTrabajador, closeTrabajador,
    isOpenUsuario, closeUsuario,
    handleOpenCrearTrabajador, handleOpenEditarTrabajador,
    handleOpenCrearUsuario, handleOpenEditarUsuario,
    handleResetPassword,
    handleSubmitTrabajador, handleSubmitUsuario,
    handleExportAsistencia, handleExportTrabajadores, handleExportUsuarios,
    handleDeleteTrabajador, handleDeleteUsuario,
    resumenSemanal, handleUpdateObservaciones,
    selectedForJustificacion, setSelectedForJustificacion,
  } = useRRHH();

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de RRHH y Usuarios</h1>
          <p className="text-sm text-gray-500">Personal activo, accesos al sistema y registros de asistencia.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeTab === "asistencias" && (
            <button data-tour="exportar-asistencia-pdf" onClick={handleExportAsistencia} className="bg-white text-gray-700 border border-gray-300 font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span className="hidden sm:inline">Exportar Asistencia PDF</span>
              <span className="sm:hidden">Asistencia PDF</span>
            </button>
          )}
          {activeTab === "usuarios" ? (
            <>
              <button data-tour="exportar-usuarios-pdf" onClick={handleExportUsuarios} className="bg-white text-gray-700 border border-gray-300 font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="hidden sm:inline">Exportar Usuarios PDF</span>
                <span className="sm:hidden">Usuarios PDF</span>
              </button>
              {!isGerente && (
                <button data-tour="crear-usuario" onClick={handleOpenCrearUsuario} className="bg-brand-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  <span className="hidden sm:inline">Crear Usuario</span>
                  <span className="sm:hidden">Usuario</span>
                </button>
              )}
            </>
          ) : activeTab === "trabajadores" ? (
            <>
              <button data-tour="exportar-trabajadores-pdf" onClick={handleExportTrabajadores} className="bg-white text-gray-700 border border-gray-300 font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="hidden sm:inline">Exportar Trabajadores PDF</span>
                <span className="sm:hidden">Trabajadores PDF</span>
              </button>
              {!isGerente && (
                <button data-tour="registrar-trabajador" onClick={handleOpenCrearTrabajador} className="bg-brand-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                  <span className="hidden sm:inline">Registrar Trabajador</span>
                  <span className="sm:hidden">Trabajador</span>
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
            {(["trabajadores", "usuarios", "asistencias"] as const)
              .filter(tab => !(isGerente && tab === "usuarios"))
              .map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input data-tour="buscador-rrhh" type="text" placeholder="Buscar por cédula, nombre o correo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSkeleton variant="table" rows={8} cols={6} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              {activeTab === "trabajadores" && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-900/80 text-gray-800 dark:text-gray-300 uppercase text-xs font-bold border-b border-gray-300 dark:border-gray-700">
                      <th className="px-3 py-2 w-10"></th>
                      <th className="px-5 py-2">Cédula</th>
                      <th className="px-5 py-2">Nombres</th>
                      <th className="px-5 py-2">Apellidos</th>
                      <th className="px-5 py-2">Cargo</th>
                      <th className="px-5 py-2">Estado</th>
                      <th className="px-5 py-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTrabajadores.length === 0 ? (
                      <tr><td colSpan={7} className="px-5 py-6 text-center text-gray-500"><p className="font-medium">No se encontraron trabajadores</p></td></tr>
                    ) : filteredTrabajadores.map((t) => (
                      <tr key={t.cedula} onClick={() => setSelectedTrabajadorForDetail(t)} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                        <td className="px-3 py-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                            {t.foto_url ? (
                              <img src={t.foto_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-2 font-mono text-xs font-semibold">{t.cedula}</td>
                        <td className="px-5 py-2 font-semibold">{t.nombre}</td>
                        <td className="px-5 py-2 font-semibold">{t.apellido}</td>
                        <td className="px-5 py-2 text-gray-600 dark:text-gray-400">{t.cargo}</td>
                        <td className="px-5 py-2">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            t.estado === "Activo" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400" : "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400"
                          }`}>{t.estado}</span>
                        </td>
                        <td className="px-5 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                             <button onClick={() => exportarCarnetTrabajador(t)} title="Generar Credencial" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-300 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.5.835 2.5 1.875M8 15c-1.306 0-2.5.835-2.5 1.875M15 11c1.306 0 2.5.835 2.5 1.875M17 15c-1.306 0-2.5.835-2.5 1.875" /></svg>
                               Carnet
                             </button>
                             {!isGerente && (
                                <>
                                   <button onClick={() => handleOpenEditarTrabajador(t)} title="Editar trabajador" className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-brand-300 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                                      <IconEdit /> Editar
                                   </button>
                                   <button onClick={() => handleDeleteTrabajador(t)} title="Eliminar trabajador" className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                   </button>
                                </>
                             )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "usuarios" && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-900/80 text-gray-800 dark:text-gray-300 uppercase text-xs font-bold border-b border-gray-300 dark:border-gray-700">
                      <th className="px-5 py-2">Usuario (Correo)</th>
                      <th className="px-5 py-2">Trabajador Vinculado</th>
                      <th className="px-5 py-2">Cargo</th>
                      <th className="px-5 py-2 text-center">Rol</th>
                      <th className="px-5 py-2 text-center">Estado</th>
                      <th className="px-5 py-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsuarios.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-6 text-center text-gray-500"><p className="font-medium">No se encontraron usuarios</p></td></tr>
                    ) : filteredUsuarios.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-5 py-2 font-semibold text-brand-700 dark:text-brand-400">{u.correo}</td>
                        <td className="px-5 py-2 font-medium">{u.trabajador ? `${u.trabajador.nombre}` : <span className="text-gray-400 italic">No vinculado</span>}</td>
                        <td className="px-5 py-2 text-gray-600 dark:text-gray-400">{u.trabajador ? u.trabajador.cargo : "—"}</td>
                        <td className="px-5 py-2 text-center">
                          <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200">{u.rol}</span>
                        </td>
                        <td className="px-5 py-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${u.estado === true ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {u.estado === true ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-5 py-2 text-center">
                           <div className="flex items-center justify-center gap-1.5">
                             <button onClick={() => handleOpenEditarUsuario(u)} title="Editar usuario" className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-brand-300 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                               <IconEdit /> Editar
                             </button>
                             <button onClick={() => handleResetPassword(u.id, u.correo)} title="Enviar correo de restablecimiento de contraseña" className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-300 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                               Resetear
                             </button>
                             <button onClick={() => handleDeleteUsuario(u)} title="Eliminar usuario" className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "asistencias" && (
                <>
                  {/* Resumen Semanal */}
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-700">
                    <details className="group">
                      <summary data-tour="resumen-semanal" className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 select-none">
                        <svg className={`w-4 h-4 transition-transform group-open:rotate-90`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        Resumen Semanal
                        <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">({resumenSemanal.length} trabajadores)</span>
                      </summary>
                      <div className="mt-3 overflow-x-auto">
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
                                    <span className="text-blue-600 dark:text-blue-400 text-lg" title="Justificado">✓</span>
                                  ) : (
                                    <span className="text-amber-500 text-lg" title="Incompleto">⚠</span>
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    {r.observaciones ? (
                                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]" title={r.observaciones}>
                                        {r.observaciones}
                                      </span>
                                    ) : null}
                                    {!r.cumplio && !r.justificado && (
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
                        <tr><td colSpan={8} className="px-5 py-6 text-center text-gray-500"><p className="font-medium">No hay registros de asistencia</p></td></tr>
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
                            <input
                              type="text"
                              key={a.observaciones ?? ""}
                              defaultValue={a.observaciones || ""}
                              onBlur={(e) => {
                                const val = e.target.value.trim();
                                if (val !== (a.observaciones || "")) handleUpdateObservaciones(a.id, val);
                              }}
                              className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-brand-500 focus:outline-none text-xs px-1 py-0.5 dark:text-gray-300"
                              placeholder="—"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>

            <div className="px-5 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-wrap justify-between items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
              {activeTab === "trabajadores" && (
                <>
                  <span>Mostrando <span className="font-semibold">{Math.min(filteredTrabajadores.length, ITEMS_PER_PAGE)}</span> de <span className="font-semibold">{trabajTotalItems}</span> trabajadores</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => refreshTrabajadores(trabajPage - 1)} disabled={trabajPage <= 1} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-xs font-medium disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:cursor-not-allowed">Anterior</button>
                    <span className="text-xs font-medium">Pág. {trabajPage} de {trabajTotalPages || 1}</span>
                    <button onClick={() => refreshTrabajadores(trabajPage + 1)} disabled={trabajPage >= trabajTotalPages} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-xs font-medium disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:cursor-not-allowed">Siguiente</button>
                  </div>
                </>
              )}
              {activeTab === "asistencias" && (
                <>
                  <span>Mostrando <span className="font-semibold">{Math.min(filteredAsistencias.length, ITEMS_PER_PAGE)}</span> de <span className="font-semibold">{asistTotalItems}</span> asistencias</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => refreshAsistencias(asistPage - 1)} disabled={asistPage <= 1} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-xs font-medium disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:cursor-not-allowed">Anterior</button>
                    <span className="text-xs font-medium">Pág. {asistPage} de {asistTotalPages || 1}</span>
                    <button onClick={() => refreshAsistencias(asistPage + 1)} disabled={asistPage >= asistTotalPages} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-xs font-medium disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:cursor-not-allowed">Siguiente</button>
                  </div>
                </>
              )}
              {activeTab === "usuarios" && (
                <span>Mostrando <span className="font-semibold">{filteredUsuarios.length}</span> registros</span>
              )}
            </div>
          </>
        )}
      </div>

      <TrabajadorFormModal
        isOpen={isOpenTrabajador}
        onClose={closeTrabajador}
        editingTrabajadorId={editingTrabajadorId}
        initialData={formData}
        cargos={cargos}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitTrabajador}
        inputCls={inputCls}
      />

      <UsuarioFormModal
        isOpen={isOpenUsuario}
        onClose={closeUsuario}
        editingUsuarioId={editingUsuarioId}
        initialData={formUsuario}
        trabajadores={trabajadores}
        roles={roles}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitUsuario}
        inputCls={inputCls}
      />

      <TrabajadorDetailModal
        trabajador={selectedTrabajadorForDetail}
        onClose={() => setSelectedTrabajadorForDetail(null)}
        onEdit={(t) => {
          handleOpenEditarTrabajador(t);
          setSelectedTrabajadorForDetail(null);
        }}
        onRefresh={refreshData}
      />

      <JustificacionModal
        trabajador={selectedForJustificacion}
        onClose={() => setSelectedForJustificacion(null)}
        onSave={handleUpdateObservaciones}
      />

      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        variant={confirm.variant}
        confirmLabel={confirm.confirmLabel}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}
