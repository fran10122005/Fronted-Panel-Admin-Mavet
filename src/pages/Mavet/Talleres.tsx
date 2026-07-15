import { useState } from "react";
import { useTalleres } from "../../hooks/useTalleres";
import ComponentCard from "../../components/common/ComponentCard";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { Modal } from "../../components/ui/modal";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import TallerFormModal from "./talleres/TallerFormModal";
import TallerDetailModal from "./talleres/TallerDetailModal";
import InscripcionModal from "./talleres/InscripcionModal";
import SesionesTallerModal from "./talleres/SesionesTallerModal";
import { useAuth, getUserRole } from "../../context/AuthContext";
import { mavetApi, axiosInstance } from "../../services/api";
import toast from "react-hot-toast";
import { AlertCircle } from "lucide-react";

const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 dark:text-white/90 dark:bg-gray-900";
const selectCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white/90 dark:bg-gray-900";

function tallerFinalizado(t: any): boolean {
  if (!t.fecha_fin) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(t.fecha_fin + "T23:59:59");
  return fin < hoy;
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 px-3 py-3 sm:px-5 sm:py-4 shadow-sm">
      <div className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function Talleres() {
  const { user } = useAuth();
  const userRole = getUserRole(user);
  const isGerente = userRole === "Gerente";
  const [activeTab, setActiveTab] = useState<"planificados" | "inscripciones" | "inventario" | "instructores">("planificados");

  const tabs = [
    { id: "planificados" as const, label: "Planificados", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { id: "inscripciones" as const, label: "Inscripciones", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
    { id: "inventario" as const, label: "Inventario", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { id: "instructores" as const, label: "Instructores", icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" },
  ];

  const {
    talleres, inventario, instructores, espacios,
    isLoading,
    searchTerm, setSearchTerm,
    filterInstructor, setFilterInstructor,
    currentPage, setCurrentPage,
    inventarioForm, setInventarioForm,
    planificarForm, setPlanificarForm,
    enrollForm,
    isSubmitting,
    esMenor, inscripcionesAgrupadas,
    totalPages, paginatedTalleres,
    totalPlanificados, totalInscritos, totalInventario,
    selectedTaller,
    isEditingPlanificado,
    selectedTallerEnroll,
    tallerInscripciones,
    tallerAsistentes,
    tallerSesiones,
    metricasTaller,
    isOpenCrear, closeCrear,
    isOpenEditar, closeEditar,
    isOpenPlanificar, closePlanificar,
    isOpenInscr, closeInscrModal,
    isOpenEnroll, closeEnrollModal,
    isOpenAsistentes, closeAsistentesModal,
    isOpenSesiones, closeSesionesModal,
    confirm, setConfirm,
    handleOpenCrear, handleCrearInventario,
    handleOpenEditar, handleEditarInventario,
    handleEliminarInventario,
    formError, setFormError, handleOpenPlanificar, handleEliminarPlanificado,
    handlePlanificarChange, handleSubmitPlanificar,
    nuevaCedula, setNuevaCedula,
    personaEncontrada,
    buscandoPersona,
    nuevaProfesion, setNuevaProfesion,
    nuevaEspecialidad, setNuevaEspecialidad,
    handleBuscarPersona,
    handleCrearInstructor,
    openEnroll, handleEnrollChange, handleSubmitInscripcion,
    openAsistentes, openSesiones,
    exportInscripcionesFn,
    handleDesinscribir,
    searchInventario, setSearchInventario,
    filteredInventario,
  } = useTalleres();

  const handleInventarioFormChange = (e: any) => {
    const { name, value } = e.target;
    setFormError("");
    setInventarioForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePlanificarEstadoChange = (value: boolean) => {
    setPlanificarForm(prev => ({ ...prev, estado: value }));
  };

  const thCls = "px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap";
  const tdCls = "px-3 py-2 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap";

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gesti&oacute;n de Talleres</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Administraci&oacute;n de talleres, planificaci&oacute;n y control de inscripciones.</p>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-tour={`tab-${tab.id}`}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          label="Talleres Activos"
          value={totalPlanificados}
          color="bg-brand-500"
        />
        <StatCard
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          label="Alumnos Inscritos"
          value={totalInscritos}
          color="bg-emerald-500"
        />
        <StatCard
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          label="Talleres en Inventario"
          value={totalInventario}
          color="bg-violet-500"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <LoadingSkeleton variant="table" rows={8} cols={6} />
        </div>
      ) : (
      <>
      {activeTab === "planificados" && (
      
      <ComponentCard title="Listado de Talleres" desc="Talleres planificados con instructor, fecha y cupos">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-start sm:items-center">
            <div className="relative w-full sm:w-56 md:w-64">
              <input type="text" placeholder="Buscar por nombre o instructor..."
                data-tour="buscador-planificados"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className={inputCls + " pl-10 text-sm"} />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
            <select value={filterInstructor} onChange={e => { setFilterInstructor(e.target.value); setCurrentPage(1); }} className={inputCls + " w-full sm:max-w-[180px]"}>
              <option value="Todos">Todos los instructores</option>
              {instructores.map((inst: any) => (
                <option key={inst.id_instructor} value={`${inst.Persona?.nombres || ""} ${inst.Persona?.apellidos || ""}`.trim()}>
                  {inst.Persona?.nombres || ""} {inst.Persona?.apellidos || ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button data-tour="pdf-planificacion" onClick={async () => { try { const res = await axiosInstance.get('/api/reportes/talleres', { responseType: 'blob' }); const url = window.URL.createObjectURL(new Blob([res.data])); const a = document.createElement('a'); a.href = url; a.download = `MAVET_Planificacion_Talleres_${new Date().toISOString().split('T')[0]}.pdf`; a.click(); window.URL.revokeObjectURL(url); toast.success('PDF de planificación descargado'); } catch { toast.error('Error al descargar planificación'); } }}
              className="bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50 font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span className="hidden sm:inline">PDF Planificación</span>
              <span className="sm:hidden">PDF</span>
            </button>
            {!isGerente && (
              <button data-tour="planificar-taller" onClick={handleOpenPlanificar}
                className="bg-brand-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">Planificar Taller</span>
                <span className="sm:hidden">Planificar</span>
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-left min-w-[600px] sm:min-w-0">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <th className={thCls}>Nombre</th>
              <th className={thCls}>Instructor</th>
              <th className={thCls}>Fecha</th>
              <th className={thCls}>Cupos</th>
              <th className={`${thCls} text-center w-44`}>Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedTalleres.length === 0 ? (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                <p className="text-sm">No se encontraron talleres planificados.</p>
              </td></tr>
            ) : paginatedTalleres.map((t) => (
              <tr key={t.id_taller} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                <td className={`${tdCls}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.estado === "Activo" || t.estado === true ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                    <span className="font-medium truncate max-w-[200px]">{t.nombre_curso}</span>
                  </div>
                </td>
                <td className={`${tdCls} text-gray-600 dark:text-gray-300 truncate max-w-[140px]`}>
                  {t.Instructor?.Persona ? `${t.Instructor.Persona.nombres || ""} ${t.Instructor.Persona.apellidos || ""}`.trim() : "-"}
                </td>
                <td className={`${tdCls} text-gray-500`}>
                  {t.fecha ? new Date(t.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : "-"}
                </td>
                <td className={`${tdCls} tabular-nums`}>
                  <span className="text-xs font-medium">{t.cupo_minimo || 0}/{t.cupo_maximo || 0}</span>
                  {t.sesiones && <span className="text-[11px] text-gray-400 ml-1.5">· {t.sesiones} ses.</span>}
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <div className="flex items-center justify-end gap-0.5">
                    <button onClick={() => openAsistentes(t)}
                      className="flex flex-col items-center p-1 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors group" title="Asistencia">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      <span className="text-[9px] leading-tight opacity-70 group-hover:opacity-100">Lista</span>
                    </button>
                    <button onClick={() => { mavetApi.exportInscripciones(t.id_taller, 'pdf'); toast.success('PDF de inscritos descargado'); }}
                      className="flex flex-col items-center p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors group" title="Lista de Inscritos">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <span className="text-[9px] leading-tight opacity-70 group-hover:opacity-100">PDF</span>
                    </button>
                    {tallerFinalizado(t) ? (
                      <span className="text-[10px] font-semibold text-gray-400 italic tracking-wide">Solo Lectura</span>
                    ) : !isGerente && (
                      <>
                        <button onClick={() => openEnroll(t)}
                          className="flex flex-col items-center p-1 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors group" title="Inscribir">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                          <span className="text-[9px] leading-tight opacity-70 group-hover:opacity-100">Insc.</span>
                        </button>
                        <button onClick={() => openSesiones(t)}
                          className="flex flex-col items-center p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors group" title="Sesiones">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                          <span className="text-[9px] leading-tight opacity-70 group-hover:opacity-100">Ses.</span>
                        </button>
                        <button onClick={() => handleOpenPlanificar(t)}
                          className="flex flex-col items-center p-1 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors group" title="Editar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          <span className="text-[9px] leading-tight opacity-70 group-hover:opacity-100">Editar</span>
                        </button>
                        <button onClick={() => handleEliminarPlanificado(t)}
                          className="flex flex-col items-center p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors group" title="Eliminar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          <span className="text-[9px] leading-tight opacity-70 group-hover:opacity-100">Elim.</span>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 order-2 sm:order-1">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 text-sm font-medium rounded-lg border transition-colors ${
                    page === currentPage
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg order-1 sm:order-2">
              P&aacute;gina {currentPage} de {totalPages}
            </span>
          </div>
        )}
      </ComponentCard>
      )}

      {activeTab === "inscripciones" && (
      <ComponentCard title="Alumnos Inscritos" desc="Distribución de inscripciones agrupadas por taller">
        {inscripcionesAgrupadas.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm font-medium text-gray-500">No hay alumnos inscritos en ning&uacute;n taller.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inscripcionesAgrupadas.map((grupo, idx) => (
              <details key={idx} className="group rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-3.5 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors list-none">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-sm font-bold text-brand-700 dark:text-brand-400">
                      {grupo.alumnos.length}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{grupo.taller?.nombre_curso || "Taller sin nombre"}</p>
                      <p className="text-xs text-gray-500">{grupo.alumnos.length} alumno{grupo.alumnos.length !== 1 ? "s" : ""} inscrito{grupo.alumnos.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="border-t border-gray-200 dark:border-gray-700 overflow-x-auto">
                  <table className="w-full text-left min-w-[500px]">
                    <thead>
                      <tr className="bg-white dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700/50">
                        <th className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 w-8">#</th>
                        <th className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Alumno</th>
                        <th className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap">C&eacute;dula</th>
                        <th className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap">Fecha</th>
                        <th className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 w-20 whitespace-nowrap">Estado</th>
                        <th className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 w-14"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 bg-white dark:bg-gray-900/20">
                      {grupo.alumnos.map((ins: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-3 py-1.5 text-xs text-gray-400 tabular-nums">{i + 1}</td>
                          <td className="px-3 py-1.5 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            {ins.Alumno ? `${ins.Alumno.nombres || ""} ${ins.Alumno.apellidos || ""}`.trim() : "-"}
                          </td>
                          <td className="px-3 py-1.5 text-sm text-gray-500 font-mono whitespace-nowrap">{ins.Alumno?.cedula || "-"}</td>
                          <td className="px-3 py-1.5 text-sm text-gray-500 whitespace-nowrap">
                            {ins.fecha_inscripcion ? new Date(ins.fecha_inscripcion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : "-"}
                          </td>
                          <td className="px-3 py-1.5 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                              <span className="w-1 h-1 rounded-full bg-green-500" />
                              {ins.estado_inscripcion || "Activo"}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleDesinscribir(ins)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                              title="Desinscribir"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>
        )}
      </ComponentCard>
      )}

      {activeTab === "inventario" && (
      <ComponentCard
        title="Inventario de Talleres"
        desc="Catálogo maestro de talleres disponibles"
        action={
          <div className="flex gap-2">
            <button onClick={async () => { try { const res = await axiosInstance.get('/api/reportes/inventario-talleres', { responseType: 'blob' }); const url = window.URL.createObjectURL(new Blob([res.data])); const a = document.createElement('a'); a.href = url; a.download = `MAVET_Inventario_Talleres_${new Date().toISOString().split('T')[0]}.pdf`; a.click(); window.URL.revokeObjectURL(url); toast.success('PDF de inventario descargado'); } catch { toast.error('Error al descargar inventario'); } }}
              className="bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50 font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span className="hidden sm:inline">PDF Inventario</span>
              <span className="sm:hidden">PDF</span>
            </button>
            {!isGerente && (
              <button onClick={handleOpenCrear}
                className="bg-brand-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors flex items-center gap-2 text-sm whitespace-nowrap justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Crear Taller
              </button>
            )}
          </div>
        }
      >
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative w-full sm:w-64">
            <input type="text" placeholder="Buscar en inventario..."
              data-tour="buscador-inventario"
              value={searchInventario}
              onChange={e => setSearchInventario(e.target.value)}
              className={inputCls + " pl-10 text-sm"} />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-left min-w-[500px] sm:min-w-0">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <th className={thCls}>Nombre</th>
              <th className={thCls}>Descripci&oacute;n</th>
              <th className={`${thCls} text-center w-20`}>Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredInventario.length === 0 ? (
              <tr><td colSpan={3} className="px-3 py-8 text-center text-gray-500">
                <p className="text-sm">
                  {searchInventario ? "No se encontraron talleres en el inventario con ese criterio." : "No hay talleres en el inventario. Cree uno con el bot&oacute;n &quot;Crear Taller&quot;."}
                </p>
              </td></tr>
            ) : filteredInventario.map((item: any) => (
              <tr key={item.id_taller || item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                <td className={`${tdCls} font-medium`}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <span className="truncate">{item.nombre}</span>
                  </div>
                </td>
                <td className={`${tdCls} text-gray-500 dark:text-gray-400 truncate max-w-[200px] sm:max-w-xs`}>{item.descripcion || "&mdash;"}</td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  {isGerente ? (
                    <span className="text-xs text-gray-400 italic font-semibold">Solo Lectura</span>
                  ) : (
                    <>
                      <button onClick={() => handleOpenEditar(item)}
                        className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded transition-colors" title="Editar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button onClick={() => handleEliminarInventario(item)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors" title="Eliminar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </ComponentCard>
      )}

      {activeTab === "instructores" && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Gestionar Instructores</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Busque una persona por cédula para registrarla como instructor.</p>
            </div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
              {instructores.length} registrado{instructores.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input type="text" value={nuevaCedula} onChange={e => { setFormError(""); setNuevaCedula(e.target.value); }}
                className={inputCls} placeholder="Ej. V-12345678" />
              <button type="button" onClick={handleBuscarPersona} disabled={buscandoPersona || !nuevaCedula.trim()}
                className="bg-brand-500 hover:bg-brand-600 text-white px-4 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50 shrink-0 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </button>
            </div>

            {buscandoPersona && (
              <p className="text-xs text-brand-600 font-medium flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
                Buscando persona...
              </p>
            )}

            {personaEncontrada && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg p-3 text-sm">
                <p className="font-medium text-green-800 dark:text-green-300">
                  {personaEncontrada.nombres} {personaEncontrada.apellidos}
                </p>
                <p className="text-green-600 dark:text-green-400 text-xs mt-0.5">Cédula: {personaEncontrada.cedula}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Profesión</label>
                <input type="text" value={nuevaProfesion} onChange={e => { setFormError(""); setNuevaProfesion(e.target.value); }}
                  className={inputCls} placeholder="Ej. Arquitecto" />
              </div>
              <div>
                <label className="block mb-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Especialidad</label>
                <input type="text" value={nuevaEspecialidad} onChange={e => { setFormError(""); setNuevaEspecialidad(e.target.value); }}
                  className={inputCls} placeholder="Ej. Historia del Arte" />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={handleCrearInstructor} disabled={isSubmitting || !personaEncontrada}
                className="flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait">
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : "Crear Instructor"}
              </button>
            </div>
          </div>

          {formError && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-900/30">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{formError}</p>
            </div>
          )}
          <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
            <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 font-medium">Nombre</th>
                    <th className="px-3 py-2 font-medium">Profesión</th>
                    <th className="px-3 py-2 font-medium">Especialidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {instructores.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-4 text-center text-gray-500 text-xs">No hay instructores registrados.</td>
                    </tr>
                  ) : (
                    instructores.map(inst => (
                      <tr key={inst.id_instructor} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-3 py-2 font-medium">{inst.Persona?.nombres} {inst.Persona?.apellidos}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400 text-xs">{inst.profesion || "—"}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400 text-xs">{inst.especialidad || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      <TallerFormModal
        isOpen={isOpenCrear}
        onClose={closeCrear}
        isEditing={false}
        formData={inventarioForm}
        isSubmitting={isSubmitting}
        formError={formError}
        onChange={handleInventarioFormChange}
        onSubmit={handleCrearInventario}
        inputCls={inputCls}
      />

      <TallerFormModal
        isOpen={isOpenEditar}
        onClose={closeEditar}
        isEditing={true}
        formData={inventarioForm}
        isSubmitting={isSubmitting}
        formError={formError}
        onChange={handleInventarioFormChange}
        onSubmit={handleEditarInventario}
        inputCls={inputCls}
      />

      <TallerDetailModal
        isOpen={isOpenPlanificar}
        onClose={closePlanificar}
        isEditing={isEditingPlanificado}
        formData={planificarForm}
        inventario={inventario}
        instructores={instructores}
        espacios={espacios}
        isSubmitting={isSubmitting}
        formError={formError}
        onChange={handlePlanificarChange}
        onEstadoChange={handlePlanificarEstadoChange}
        onSubmit={handleSubmitPlanificar}
        inputCls={inputCls}
        selectCls={selectCls}
      />

      {/* --- Instructor Management Modal --- */}
      <InscripcionModal
        isOpen={isOpenEnroll}
        onClose={closeEnrollModal}
        talleres={talleres}
        selectedTallerEnroll={selectedTallerEnroll}
        enrollForm={enrollForm}
        esMenor={esMenor}
        isSubmitting={isSubmitting}
        formError={formError}
        onChange={handleEnrollChange}
        onSubmit={handleSubmitInscripcion}
        inputCls={inputCls}
        selectCls={selectCls}
      />

      <Modal isOpen={isOpenInscr} onClose={closeInscrModal} className="max-w-4xl p-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Inscripciones</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            Taller: <span className="font-semibold text-brand-600 dark:text-brand-400">{selectedTaller?.nombre_curso || ""}</span>
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => exportInscripcionesFn('pdf')}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar PDF
            </button>
            <button onClick={() => exportInscripcionesFn('excel')}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <th className={thCls}>Alumno</th>
                  <th className={thCls}>Representante</th>
                  <th className={thCls}>Fecha</th>
                  <th className={thCls}>Estado</th>
                  <th className={`${thCls} w-14`}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tallerInscripciones.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-6 text-center text-gray-500">No hay inscripciones para este taller.</td></tr>
                ) : tallerInscripciones.map((ins, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className={`${tdCls} font-medium`}>
                      {ins.Alumno ? `${ins.Alumno.nombres || ""} ${ins.Alumno.apellidos || ""}`.trim() : "-"}
                    </td>
                    <td className={`${tdCls} text-gray-500`}>
                      {ins.Representante ? `${ins.Representante.nombres || ""} ${ins.Representante.apellidos || ""}`.trim() : "-"}
                    </td>
                    <td className={`${tdCls} text-gray-500`}>
                      {ins.fecha_inscripcion ? new Date(ins.fecha_inscripcion).toLocaleDateString('es-ES') : "-"}
                    </td>
                    <td className={`${tdCls}`}>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {ins.estado_inscripcion || "Activo"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDesinscribir(ins)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                        title="Desinscribir"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button onClick={closeInscrModal}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isOpenAsistentes} onClose={closeAsistentesModal} className="max-w-4xl p-6">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Asistentes Check-In</h3>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full dark:bg-amber-900/30 dark:text-amber-400">
              Total: {tallerAsistentes.length} {tallerAsistentes.length === 1 ? 'persona' : 'personas'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            Visitantes confirmados en recepci&oacute;n o por QR para: <span className="font-semibold text-brand-600 dark:text-brand-400">{selectedTaller?.nombre_curso || ""}</span>
          </p>

          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full text-left relative">
              <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10 shadow-sm">
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nombre y Apellido</th>
                  <th className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">C&eacute;dula</th>
                  <th className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Acompa&ntilde;antes</th>
                  <th className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Hora Ingreso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tallerAsistentes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-gray-500">
                      Nadie se ha registrado en puerta para este taller.
                    </td>
                  </tr>
                ) : (
                  tallerAsistentes.map((a, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-2 text-sm text-gray-800 dark:text-gray-200 font-medium">
                        {a.Persona ? `${a.Persona.nombres || ""} ${a.Persona.apellidos || ""}`.trim() : "Desconocido"}
                      </td>
                      <td className="px-5 py-2 text-sm text-gray-500">{a.Persona?.cedula || "-"}</td>
                      <td className="px-5 py-2 text-sm text-gray-800 dark:text-gray-200">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-brand-800 bg-brand-100 rounded-full dark:bg-brand-900/30 dark:text-brand-400">
                          +{a.cantidad_acompanantes || 0}
                        </span>
                      </td>
                      <td className="px-5 py-2 text-sm text-gray-500">
                        {new Date(a.fecha_hora_entrada).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4 mt-2 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={closeAsistentesModal}
              className="w-full sm:w-auto px-5 py-2.5 sm:py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition">
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      <SesionesTallerModal
        isOpen={isOpenSesiones}
        onClose={closeSesionesModal}
        taller={selectedTaller}
        sesiones={tallerSesiones}
        metricas={metricasTaller}
        onRefresh={(taller) => openSesiones(taller)}
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
