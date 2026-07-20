import { useRRHH, ITEMS_PER_PAGE } from "../../hooks/useRRHH";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import TrabajadorFormModal from "./rrhh/TrabajadorFormModal";
import UsuarioFormModal from "./rrhh/UsuarioFormModal";
import TrabajadorDetailModal from "./rrhh/TrabajadorDetailModal";
import { exportarCarnetTrabajador } from "../../services/pdf.service";
import { useAuth, getUserRole } from "../../context/AuthContext";
import Pagination from "../../components/ui/Pagination";
import Button from "../../components/ui/button/Button";
import TextField from "../../components/ui/TextField";
import Badge from "../../components/ui/Badge";

const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none dark:text-white/90";

const roleBadge: Record<string, "brand" | "info" | "warning" | "neutral"> = {
  administrador: "brand",
  admin: "brand",
  gerente: "info",
  curador: "warning",
};

const filterPills = ["activos", "suspendidos", "todos"] as const;

export default function RRHH() {
  const { user } = useAuth();
  const userRole = getUserRole(user);
  const isGerente = userRole === "Gerente";

  const {
    trabajadores, cargos, roles,
    isLoading, activeTab, setActiveTab,
    searchTerm, setSearchTerm,
    formData, formUsuario, isSubmitting,
    confirm,
    editingTrabajadorId, editingUsuarioId,
    selectedTrabajadorForDetail, setSelectedTrabajadorForDetail,
    trabajPage, trabajTotalPages, trabajTotalItems,
    refreshTrabajadores, refreshData,
    filteredTrabajadores, filteredUsuarios,
    isOpenTrabajador, closeTrabajador,
    isOpenUsuario, closeUsuario,
    handleOpenCrearTrabajador, handleOpenEditarTrabajador,
    handleOpenCrearUsuario, handleOpenEditarUsuario,
    handleResetPassword,
    handleSubmitTrabajador, handleSubmitUsuario,
    handleExportTrabajadores, handleExportUsuarios,
    handleDeleteTrabajador,
    handleToggleEstadoUsuario, filtroEstadoUsuarios, setFiltroEstadoUsuarios,
    usuarios,
  } = useRRHH();

  const activeAdminsCount = usuarios.filter(u => u.rol === "Administrador" && u.estado === true).length;
  const currentEditingUser = usuarios.find(u => u.id?.toString() === editingUsuarioId);
  const isEditingUserLastAdmin = currentEditingUser?.rol === "Administrador" && activeAdminsCount <= 1;

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de RRHH y Usuarios</h1>
          <p className="text-sm text-gray-500">Personal activo y accesos al sistema.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeTab === "usuarios" ? (
            <>
              <Button variant="secondary" size="sm" onClick={handleExportUsuarios} data-tour="exportar-usuarios-pdf"
                startIcon={<svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>
                <span className="hidden sm:inline">Exportar Usuarios PDF</span>
                <span className="sm:hidden">Usuarios PDF</span>
              </Button>
              {!isGerente && (
                <Button size="sm" onClick={handleOpenCrearUsuario} data-tour="crear-usuario"
                  startIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}>
                  Crear Usuario
                </Button>
              )}
            </>
          ) : activeTab === "trabajadores" ? (
            <>
              <Button variant="secondary" size="sm" onClick={handleExportTrabajadores} data-tour="exportar-trabajadores-pdf"
                startIcon={<svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>
                <span className="hidden sm:inline">Exportar Trabajadores PDF</span>
                <span className="sm:hidden">Trabajadores PDF</span>
              </Button>
              {!isGerente && (
                <Button size="sm" onClick={handleOpenCrearTrabajador} data-tour="registrar-trabajador"
                  startIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}>
                  Registrar Trabajador
                </Button>
              )}
            </>
          ) : null}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
            {(["trabajadores", "usuarios"] as const)
              .filter(tab => !(isGerente && tab === "usuarios"))
              .map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  data-tour={`tab-${tab}`}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
            ))}
          </div>
          <div className="flex gap-3">
            <TextField
              data-tour="buscador-rrhh"
              placeholder="Buscar por cédula, nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSkeleton variant="table" rows={8} cols={6} />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-x-auto">
              {activeTab === "trabajadores" && (
                <table className="w-full text-left table-auto">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-900/80 text-gray-600 dark:text-gray-400 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200 dark:border-gray-700">
                      <th className="px-2 py-2 w-8"></th>
                      <th className="px-2 py-2">Cédula</th>
                      <th className="px-2 py-2">Nombres</th>
                      <th className="px-2 py-2">Apellidos</th>
                      <th className="px-2 py-2">Cargo</th>
                      <th className="px-2 py-2 text-center">PIN</th>
                      <th className="px-2 py-2">Estado</th>
                      <th className="px-2 py-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredTrabajadores.length === 0 ? (
                      <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-500"><p className="font-medium text-sm">No se encontraron trabajadores</p></td></tr>
                    ) : filteredTrabajadores.map((t) => (
                      <tr key={t.cedula} onClick={() => setSelectedTrabajadorForDetail(t)} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors">
                        <td className="px-2 py-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                            {t.foto_url ? (
                              <img src={t.foto_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2 font-mono text-xs font-semibold">{t.cedula}</td>
                        <td className="px-2 py-2 font-semibold text-sm">{t.nombre}</td>
                        <td className="px-2 py-2 font-semibold text-sm">{t.apellido}</td>
                        <td className="px-2 py-2 text-xs text-gray-600 dark:text-gray-400">{t.cargo}</td>
                        <td className="px-2 py-2 text-center text-xs">
                          <span className={`font-medium ${(t as any).pin_hash ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}>
                            {(t as any).pin_hash ? "🔒" : "⚪"}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <Badge scheme={t.estado === "Activo" ? "success" : "neutral"}>{t.estado}</Badge>
                        </td>
                        <td className="px-2 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <Button size="xs" variant="secondary" onClick={() => exportarCarnetTrabajador(t)} title="Generar Credencial"
                              startIcon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.5.835 2.5 1.875M8 15c-1.306 0-2.5.835-2.5 1.875M15 11c1.306 0 2.5.835 2.5 1.875M17 15c-1.306 0-2.5.835-2.5 1.875" /></svg>} />
                            {!isGerente && (
                              <>
                                <Button size="xs" variant="secondary" onClick={() => handleOpenEditarTrabajador(t)} title="Editar trabajador"
                                  startIcon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} />
                                <Button size="xs" variant="ghost" onClick={() => handleDeleteTrabajador(t)} title="Eliminar trabajador"
                                  startIcon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>} />
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
                <>
                  <div className="px-4 py-2 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Filtrar:</span>
                    {filterPills.map((f) => (
                      <Button key={f} size="xs" variant={filtroEstadoUsuarios === f ? "primary" : "secondary"}
                        onClick={() => setFiltroEstadoUsuarios(f)}>
                        {f === "activos" ? "Activos" : f === "suspendidos" ? "Suspendidos" : "Todos"}
                      </Button>
                    ))}
                  </div>
                  <div className="overflow-x-auto">
                  <table className="w-full text-left table-auto">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-900/80 text-gray-600 dark:text-gray-400 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200 dark:border-gray-700">
                      <th className="px-2 py-2 w-8"></th>
                      <th className="px-2 py-2">Usuario (Correo)</th>
                      <th className="px-2 py-2">Trabajador</th>
                      <th className="px-2 py-2">Cargo</th>
                      <th className="px-2 py-2 text-center">Rol</th>
                      <th className="px-2 py-2 text-center">Estado</th>
                      <th className="px-2 py-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredUsuarios.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500"><p className="font-medium text-sm">No se encontraron usuarios</p></td></tr>
                    ) : filteredUsuarios.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-2 py-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600 text-[10px] font-bold text-gray-500">
                            {(u as any).foto_url ? (
                              <img src={(u as any).foto_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                               (u.trabajador?.nombre && (u.trabajador as any)?.apellidos) 
                               ? `${u.trabajador.nombre.charAt(0)}${(u.trabajador as any).apellidos.charAt(0)}`.toUpperCase() 
                               : "UM"
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2 font-semibold text-brand-700 dark:text-brand-400 text-sm">{u.correo}</td>
                        <td className="px-2 py-2 font-semibold text-sm">{u.trabajador ? `${u.trabajador.nombre}` : <span className="text-gray-400 italic">No vinculado</span>}</td>
                        <td className="px-2 py-2 text-xs text-gray-600 dark:text-gray-400">{u.trabajador ? u.trabajador.cargo : "—"}</td>
                        <td className="px-2 py-2 text-center">
                          <Badge scheme={roleBadge[u.rol.toLowerCase()] || "neutral"}>{u.rol}</Badge>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <Badge scheme={u.estado === true ? "success" : "neutral"} dot={u.estado === true} pulse={u.estado === true}>
                            {u.estado === true ? "Activo" : "Suspendido"}
                          </Badge>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button size="xs" variant="secondary" onClick={() => handleOpenEditarUsuario(u)} title="Editar usuario"
                              startIcon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} />
                            <Button size="xs" variant="secondary" onClick={() => handleResetPassword(u.id, u.correo)} title="Restablecer contraseña"
                              startIcon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-3.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>} />
                            {(!(u.rol === "Administrador" && activeAdminsCount <= 1 && u.estado === true)) && (
                              <Button size="xs" variant={u.estado === true ? "danger" : "secondary"}
                                onClick={() => handleToggleEstadoUsuario(u)}
                                title={u.estado === true ? "Suspender usuario" : "Activar usuario"}
                                startIcon={
                                  u.estado === true
                                    ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                }
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                </>
              )}
            </div>

            <div className="px-5 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              {activeTab === "trabajadores" && (
                <Pagination
                  currentPage={trabajPage}
                  totalPages={trabajTotalPages}
                  totalItems={trabajTotalItems}
                  pageSize={ITEMS_PER_PAGE}
                  label="trabajadores"
                  onPageChange={refreshTrabajadores}
                />
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
        isLastAdmin={isEditingUserLastAdmin}
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

      <ConfirmDialog {...confirm} />
    </div>
  );
}
