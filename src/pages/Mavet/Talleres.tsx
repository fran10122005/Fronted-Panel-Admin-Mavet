import { useTalleres } from "../../hooks/useTalleres";
import ComponentCard from "../../components/common/ComponentCard";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { Modal } from "../../components/ui/modal";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import TallerFormModal from "./talleres/TallerFormModal";
import TallerDetailModal from "./talleres/TallerDetailModal";
import InscripcionModal from "./talleres/InscripcionModal";

const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 dark:text-white/90 dark:bg-gray-900";
const selectCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white/90 dark:bg-gray-900";

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 px-5 py-4 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function Talleres() {
  const {
    talleres, inventario, instructores, espacios,
    isLoading,
    searchTerm, setSearchTerm,
    filterInstructor, setFilterInstructor,
    currentPage, setCurrentPage,
    inventarioForm, setInventarioForm,
    planificarForm, setPlanificarForm,
    enrollForm,
    cedulaInstructor,
    instructorNombre, instructorLoading, instructorError, instructorAuto,
    isSubmitting,
    esMenor, inscripcionesAgrupadas,
    totalPages, paginatedTalleres,
    totalPlanificados, totalInscritos, totalInventario,
    selectedTaller,
    isEditingPlanificado,
    selectedTallerEnroll,
    tallerInscripciones,
    tallerAsistentes,
    isOpenCrear, closeCrear,
    isOpenEditar, closeEditar,
    isOpenPlanificar, closePlanificar,
    isOpenInscr, closeInscrModal,
    isOpenEnroll, closeEnrollModal,
    isOpenAsistentes, closeAsistentesModal,
    confirm, setConfirm,
    handleOpenCrear, handleCrearInventario,
    handleOpenEditar, handleEditarInventario,
    handleEliminarInventario,
    handleOpenPlanificar, handleEliminarPlanificado,
    handlePlanificarChange, handleSubmitPlanificar,
    handleInstructorCedulaSearch, handleCedulaInstructorChange,
    openEnroll, handleEnrollChange, handleSubmitInscripcion,
    openEnrolments, openAsistentes,
    exportInscripcionesFn,
  } = useTalleres();

  const handleInventarioFormChange = (e: any) => {
    const { name, value } = e.target;
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      <ComponentCard title="Listado de Talleres" desc="Talleres planificados con instructor, fecha y cupos">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-start sm:items-center">
            <div className="relative w-full sm:w-56 md:w-64">
              <input type="text" placeholder="Buscar por nombre o instructor..."
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
          <button onClick={handleOpenPlanificar}
            className="bg-brand-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap w-full sm:w-auto">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Planificar Taller
          </button>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-left min-w-[600px] sm:min-w-0">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <th className={thCls}>Nombre</th>
              <th className={thCls}>Instructor</th>
              <th className={thCls}>Fecha</th>
              <th className={thCls}>Cupos</th>
              <th className={`${thCls} text-center w-14`}></th>
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
                <td className="px-3 py-2 text-center">
                  <div className="relative inline-block">
                    <button onClick={(e) => {
                      e.stopPropagation();
                      const menu = document.getElementById(`actions-${t.id_taller}`);
                      if (!menu) return;
                      const isOpen = !menu.classList.contains('hidden');
                      document.querySelectorAll('[id^="actions-"]').forEach(el => {
                        el.classList.add('hidden'); el.classList.remove('flex');
                        (el as HTMLElement).style.position = '';
                        (el as HTMLElement).style.top = '';
                        (el as HTMLElement).style.right = '';
                      });
                      if (!isOpen) {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        menu.style.position = 'fixed';
                        menu.style.top = `${rect.bottom + 4}px`;
                        menu.style.right = `${window.innerWidth - rect.right}px`;
                        menu.classList.remove('hidden');
                        menu.classList.add('flex');
                        const closeHandler = (ev: MouseEvent) => {
                          if (!menu.contains(ev.target as Node) && ev.target !== e.currentTarget) {
                            menu.classList.add('hidden'); menu.classList.remove('flex');
                            menu.style.position = ''; menu.style.top = ''; menu.style.right = '';
                            document.removeEventListener('click', closeHandler);
                          }
                        };
                        setTimeout(() => document.addEventListener('click', closeHandler), 0);
                      }
                    }}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                      </svg>
                    </button>
                    <div id={`actions-${t.id_taller}`} className="hidden z-50 min-w-[160px] flex-col rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg py-1">
                      <button onClick={(e) => { e.stopPropagation(); document.getElementById(`actions-${t.id_taller}`)?.classList.add('hidden'); openEnrolments(t); }}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                        <svg className="w-3.5 h-3.5 text-brand-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Inscritos
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); document.getElementById(`actions-${t.id_taller}`)?.classList.add('hidden'); openAsistentes(t); }}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                        <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        Asistentes
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); document.getElementById(`actions-${t.id_taller}`)?.classList.add('hidden'); openEnroll(t); }}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                        <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Inscribir
                      </button>
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                      <button onClick={(e) => { e.stopPropagation(); document.getElementById(`actions-${t.id_taller}`)?.classList.add('hidden'); handleOpenPlanificar(t); }}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        Editar
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); document.getElementById(`actions-${t.id_taller}`)?.classList.add('hidden'); handleEliminarPlanificado(t); }}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-left">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
              P&aacute;gina {currentPage} de {totalPages}
            </span>
            <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="flex-1 sm:flex-none px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Anterior
              </button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex-1 sm:flex-none px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Siguiente
              </button>
            </div>
          </div>
        )}
      </ComponentCard>

      <ComponentCard title="Alumnos Inscritos por Taller" desc="Distribución de inscripciones agrupadas por taller">
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

      <ComponentCard
        title="Inventario de Talleres"
        desc="Catálogo maestro de talleres disponibles"
        action={
          <button onClick={handleOpenCrear}
            className="bg-brand-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors flex items-center gap-2 text-sm whitespace-nowrap w-full sm:w-auto justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Crear Taller
          </button>
        }
      >
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
            {inventario.length === 0 ? (
              <tr><td colSpan={3} className="px-3 py-8 text-center text-gray-500">
                <p className="text-sm">No hay talleres en el inventario. Cree uno con el bot&oacute;n &quot;Crear Taller&quot;.</p>
              </td></tr>
            ) : inventario.map((item: any) => (
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </ComponentCard>
      </>
      )}

      <TallerFormModal
        isOpen={isOpenCrear}
        onClose={closeCrear}
        isEditing={false}
        formData={inventarioForm}
        isSubmitting={isSubmitting}
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
        espacios={espacios}
        isSubmitting={isSubmitting}
        onChange={handlePlanificarChange}
        onEstadoChange={handlePlanificarEstadoChange}
        onSubmit={handleSubmitPlanificar}
        inputCls={inputCls}
        selectCls={selectCls}
        cedulaInstructor={cedulaInstructor}
        instructorNombre={instructorNombre}
        instructorLoading={instructorLoading}
        instructorError={instructorError}
        instructorAuto={instructorAuto}
        onCedulaChange={handleCedulaInstructorChange}
        onCedulaSearch={handleInstructorCedulaSearch}
      />

      <InscripcionModal
        isOpen={isOpenEnroll}
        onClose={closeEnrollModal}
        talleres={talleres}
        selectedTallerEnroll={selectedTallerEnroll}
        enrollForm={enrollForm}
        esMenor={esMenor}
        isSubmitting={isSubmitting}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tallerInscripciones.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-500">No hay inscripciones para este taller.</td></tr>
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
