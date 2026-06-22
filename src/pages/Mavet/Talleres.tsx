import toast from "react-hot-toast";
import React, { useState, useEffect } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { mavetApi } from "../../services/api";

const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 dark:text-white/90 dark:bg-gray-900";
const labelCls = "block mb-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";
const selectCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white/90 dark:bg-gray-900";

export default function Talleres() {
  // ─── Data ───
  const [talleres, setTalleres] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [instructores, setInstructores] = useState<any[]>([]);
  const [espacios, setEspacios] = useState<any[]>([]);
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ─── Pagination & search ───
  const [searchTerm, setSearchTerm] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ─── Modals ───
  const { isOpen: isOpenCrear, openModal: openCrear, closeModal: closeCrear } = useModal();
  const { isOpen: isOpenEditar, openModal: openEditar, closeModal: closeEditar } = useModal();
  const { isOpen: isOpenPlanificar, openModal: openPlanificar, closeModal: closePlanificar } = useModal();
  const { isOpen: isOpenInscr, openModal: openInscrModal, closeModal: closeInscrModal } = useModal();
  const { isOpen: isOpenEnroll, openModal: openEnrollModal, closeModal: closeEnrollModal } = useModal();

  // ─── Selected states ───
  const [selectedInventario, setSelectedInventario] = useState<any>(null);
  const [selectedTaller, setSelectedTaller] = useState<any>(null);
  const [selectedTallerEnroll, setSelectedTallerEnroll] = useState<any>(null);
  const [tallerInscripciones, setTallerInscripciones] = useState<any[]>([]);
  const [tallerAsistentes, setTallerAsistentes] = useState<any[]>([]);
  const { isOpen: isOpenAsistentes, openModal: openAsistentesModal, closeModal: closeAsistentesModal } = useModal();

  // ─── Forms ───
  const [inventarioForm, setInventarioForm] = useState({ nombre: "", descripcion: "" });

  const [planificarForm, setPlanificarForm] = useState({
    id_taller_inventario: 0,
    id_instructor: 0,
    id_espacio: 0,
    sesiones: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    horas_totales: 0,
    cupo_minimo: 0,
    cupo_maximo: 0,
    estado: true
  });

  const [enrollForm, setEnrollForm] = useState({
    tallerId: "",
    alumnoNombre: "",
    alumnoEdad: "",
    repNombre: "",
    repCedula: "",
    repTelefono: "",
    correo: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const edadNum = parseInt(enrollForm.alumnoEdad, 10);
  const esMenor = !isNaN(edadNum) && edadNum < 18;

  // ─── Data Fetching ───
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [inv, tal, inst, esp, ins] = await Promise.all([
        mavetApi.getInventarioTalleres(),
        mavetApi.getTalleres(),
        mavetApi.getInstructores(),
        mavetApi.getEspaciosMuseo(),
        mavetApi.getInscripcionesTaller()
      ]);
      setInventario(inv);
      setTalleres(tal);
      setInstructores(inst);
      setEspacios(esp);
      setInscripciones(ins);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCrear = () => {
    setInventarioForm({ nombre: "", descripcion: "" });
    openCrear();
  };

  const handleCrearInventario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventarioForm.nombre.trim()) {
      toast.error("El nombre del taller es obligatorio.");
      return;
    }
    setIsSubmitting(true);
    try {
      await mavetApi.crearInventarioTaller(inventarioForm);
      toast.success("Taller agregado al inventario.");
      closeCrear();
      const refreshed = await mavetApi.getInventarioTalleres();
      setInventario(refreshed);
    } catch (error: any) {
      toast.error(error.message || "Error al crear taller.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Inventario: Editar ───
  const handleOpenEditar = (item: any) => {
    setSelectedInventario(item);
    setInventarioForm({ nombre: item.nombre || "", descripcion: item.descripcion || "" });
    openEditar();
  };

  const handleEditarInventario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventarioForm.nombre.trim()) {
      toast.error("El nombre del taller es obligatorio.");
      return;
    }
    setIsSubmitting(true);
    try {
      await mavetApi.actualizarInventarioTaller(selectedInventario.id_taller || selectedInventario.id, inventarioForm);
      toast.success("Taller actualizado en el inventario.");
      closeEditar();
      const refreshed = await mavetApi.getInventarioTalleres();
      setInventario(refreshed);
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar taller.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Inventario: Ocultar ───
  const handleOcultarInventario = async (item: any) => {
    if (!window.confirm(`¿Ocultar "${item.nombre}" del inventario?`)) return;
    try {
      await mavetApi.ocultarInventarioTaller(item.id_taller || item.id);
      toast.success("Taller ocultado del inventario.");
      const refreshed = await mavetApi.getInventarioTalleres();
      setInventario(refreshed);
    } catch (error: any) {
      toast.error(error.message || "Error al ocultar taller.");
    }
  };

  // ─── Planificar Taller ───
  const handleOpenPlanificar = () => {
    setPlanificarForm({
      id_taller_inventario: 0, id_instructor: 0, id_espacio: 0, sesiones: "",
      fecha: "", hora_inicio: "", hora_fin: "", horas_totales: 0,
      cupo_minimo: 0, cupo_maximo: 0, estado: true
    });
    openPlanificar();
  };

  const handlePlanificarChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numFields = ["id_taller_inventario", "id_instructor", "id_espacio", "sesiones", "horas_totales", "cupo_minimo", "cupo_maximo"];
    setPlanificarForm(prev => ({
      ...prev,
      [name]: numFields.includes(name) ? Number(value) : value
    }));
  };

  const handleSubmitPlanificar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planificarForm.id_taller_inventario) {
      toast.error("Debe seleccionar un taller del inventario.");
      return;
    }
    setIsSubmitting(true);
    try {
      const selected = inventario.find(i => (i.id_taller || i.id) === planificarForm.id_taller_inventario);
      const payload = {
        ...planificarForm,
        nombre_curso: selected?.nombre || ""
      };
      await mavetApi.crearTaller(payload);
      toast.success("Taller planificado correctamente.");
      closePlanificar();
      const [talleresData, inscripcionesData] = await Promise.all([
        mavetApi.getTalleres(),
        mavetApi.getInscripcionesTaller()
      ]);
      setTalleres(talleresData);
      setInscripciones(inscripcionesData);
    } catch (error: any) {
      toast.error(error.message || "Error al planificar taller.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Inscripciones ───
  const openEnroll = (taller: any) => {
    setSelectedTallerEnroll(taller);
    setEnrollForm(prev => ({ ...prev, tallerId: taller.id_taller }));
    openEnrollModal();
  };

  const handleEnrollChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEnrollForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitInscripcion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (esMenor && (!enrollForm.repNombre || !enrollForm.repCedula)) {
      toast.error("Los menores de edad requieren nombre y cédula del representante.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = {
        tallerId: enrollForm.tallerId,
        alumno: { nombre: enrollForm.alumnoNombre, edad: enrollForm.alumnoEdad }
      };
      if (esMenor) {
        payload.representante = {
          nombre: enrollForm.repNombre,
          cedula: enrollForm.repCedula,
          telefono: enrollForm.repTelefono
        };
      }
      await mavetApi.inscribirTaller(payload);
      toast.success("Alumno inscrito correctamente.");
      setEnrollForm(prev => ({ ...prev, alumnoNombre: "", alumnoEdad: "", repNombre: "", repCedula: "", repTelefono: "" }));
      const refreshed = await mavetApi.getInscripcionesTaller();
      setInscripciones(refreshed);
    } catch (error: any) {
      toast.error(error.message || "Error al inscribir al alumno.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEnrolments = async (taller: any) => {
    setSelectedTaller(taller);
    try {
      const data = await mavetApi.getInscripcionesPorTaller(taller.id_taller);
      setTallerInscripciones(data);
    } catch {
      setTallerInscripciones([]);
    }
    openInscrModal();
  };

  const openAsistentes = async (taller: any) => {
    setSelectedTaller(taller);
    try {
      const todosIngresos = await mavetApi.getTodosIngresos();
      const asistentes = todosIngresos.filter(i => String(i.id_taller) === String(taller.id_taller));
      setTallerAsistentes(asistentes);
    } catch {
      setTallerAsistentes([]);
    }
    openAsistentesModal();
  };

  const exportInscripcionesFn = async (format: 'pdf' | 'excel') => {
    if (!selectedTaller) return;
    try {
      await mavetApi.exportInscripciones(selectedTaller.id_taller, format);
      toast.success(`Inscripciones exportadas en formato ${format.toUpperCase()}`);
    } catch {
      toast.error("Error al exportar inscripciones.");
    }
  };

  // ─── Filters & Pagination ───
  const filteredTalleres = talleres.filter(t => {
    const term = searchTerm.toLowerCase();
    const instructorName = t.Instructor?.Persona ? `${t.Instructor.Persona.nombres || ""} ${t.Instructor.Persona.apellidos || ""}`.trim() : "";
    
    const matchesSearch = 
      t.nombre_curso?.toLowerCase().includes(term) ||
      t.Instructor?.Persona?.nombres?.toLowerCase().includes(term) ||
      t.Instructor?.Persona?.apellidos?.toLowerCase().includes(term);
      
    const matchesInstructor = filterInstructor === "Todos" || instructorName === filterInstructor;
    
    return matchesSearch && matchesInstructor;
  });
  const totalPages = Math.ceil(filteredTalleres.length / itemsPerPage);
  const paginatedTalleres = filteredTalleres.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const thCls = "px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400";
  const tdCls = "px-5 py-3.5 text-sm text-gray-800 dark:text-gray-200";

  return (
    <div className="space-y-6 relative">
      {/* Alert */}
      

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Talleres</h1>
          <p className="text-sm text-gray-500">Inventario de talleres y planificación de programas.</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          INVENTARIO DE TALLERES
         ══════════════════════════════════════════ */}
      <ComponentCard title="Inventario de Talleres" desc="Catálogo maestro de talleres disponibles">
        <div className="flex justify-end mb-4">
          <button onClick={handleOpenCrear}
            className="bg-brand-500 text-white font-semibold py-2 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Crear Taller
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className={thCls}>Nombre</th>
                <th className={thCls}>Descripción</th>
                <th className={`${thCls} text-center w-32`}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr><td colSpan={3} className="px-5 py-10 text-center text-gray-500">Cargando...</td></tr>
              ) : inventario.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-10 text-center text-gray-500">
                  <p className="text-sm font-medium">No hay talleres en el inventario.</p>
                  <p className="text-xs text-gray-400 mt-1">Cree un nuevo taller usando el botón "Crear Taller".</p>
                </td></tr>
              ) : inventario.map((item: any) => (
                <tr key={item.id_taller || item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className={`${tdCls} font-semibold`}>{item.nombre}</td>
                  <td className={`${tdCls} text-gray-500 dark:text-gray-400 max-w-xs truncate`}>{item.descripcion || "—"}</td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenEditar(item)}
                        className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
                        title="Editar">
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button onClick={() => handleOcultarInventario(item)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Ocultar">
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ComponentCard>

      {/* ══════════════════════════════════════════
          LISTADO DE TALLERES
         ══════════════════════════════════════════ */}
      <ComponentCard title="Listado de Talleres" desc="Talleres planificados con instructor, fecha y cupos">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-start sm:items-center">
            <div className="relative w-full sm:w-64">
              <input type="text" placeholder="Buscar por nombre o instructor..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className={inputCls + " pl-10"} />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Instructor:</span>
              <select value={filterInstructor} onChange={e => { setFilterInstructor(e.target.value); setCurrentPage(1); }} className={inputCls + " max-w-[200px]"}>
                <option value="Todos">Todos</option>
                {instructores.map(inst => (
                  <option key={inst.id_instructor} value={`${inst.Persona?.nombres || ""} ${inst.Persona?.apellidos || ""}`.trim()}>
                    {inst.Persona?.nombres || ""} {inst.Persona?.apellidos || ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={handleOpenPlanificar}
            className="bg-brand-500 text-white font-semibold py-2 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors flex items-center gap-2 text-sm whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Planificar Taller
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className={thCls}>Código</th>
                <th className={thCls}>Nombre</th>
                <th className={thCls}>Instructor</th>
                <th className={thCls}>Fecha</th>
                <th className={thCls}>Cupos</th>
                <th className={thCls}>Sesiones</th>
                <th className={`${thCls} text-center`}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedTalleres.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-500">
                  <p className="text-sm font-medium">No se encontraron talleres.</p>
                </td></tr>
              ) : paginatedTalleres.map((t) => (
                <tr key={t.id_taller} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className={`${tdCls} font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold`}>{t.id_taller}</td>
                  <td className={`${tdCls} font-semibold`}>{t.nombre_curso}</td>
                  <td className={`${tdCls} text-gray-600 dark:text-gray-300`}>
                    {t.Instructor?.Persona ? `${t.Instructor.Persona.nombres || ""} ${t.Instructor.Persona.apellidos || ""}`.trim() : "-"}
                  </td>
                  <td className={`${tdCls} text-gray-500`}>
                    {t.fecha ? new Date(t.fecha).toLocaleDateString('es-ES') : "-"}
                  </td>
                  <td className={`${tdCls}`}>
                    <span className="text-xs font-medium">{t.cupo_minimo || 0} / {t.cupo_maximo || 0}</span>
                  </td>
                  <td className={`${tdCls} text-gray-500`}>{t.sesiones || "-"}</td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEnrolments(t)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30 px-2.5 py-1 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Inscritos
                      </button>
                      <button onClick={() => openAsistentes(t)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 px-2.5 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Asistentes
                      </button>
                      <button onClick={() => openEnroll(t)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/30 px-2.5 py-1 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Inscribir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Anterior
              </button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Siguiente
              </button>
            </div>
          </div>
        )}
      </ComponentCard>

      {/* ══════════════════════════════════════════
          ÚLTIMOS ALUMNOS INSCRITOS
         ══════════════════════════════════════════ */}
      <ComponentCard title="Últimos 10 Alumnos Inscritos">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className={thCls}>Nombre</th>
                <th className={thCls}>Cédula</th>
                <th className={thCls}>Taller</th>
                <th className={thCls}>Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {[...inscripciones]
                .sort((a, b) => new Date(b.fecha_inscripcion).getTime() - new Date(a.fecha_inscripcion).getTime())
                .slice(0, 10)
                .map((ins, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className={`${tdCls} font-medium`}>
                      {ins.Alumno ? `${ins.Alumno.nombres || ""} ${ins.Alumno.apellidos || ""}`.trim() : "-"}
                    </td>
                    <td className={`${tdCls} text-gray-500`}>{ins.Alumno?.cedula || "-"}</td>
                    <td className={`${tdCls}`}>{ins.Taller?.nombre_curso || "-"}</td>
                    <td className={`${tdCls} text-gray-500`}>
                      {ins.fecha_inscripcion ? new Date(ins.fecha_inscripcion).toLocaleDateString('es-ES') : "-"}
                    </td>
                  </tr>
                ))}
              {inscripciones.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-500">No hay inscripciones registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </ComponentCard>

      {/* ══════════════════════════════════════════
          MODAL: Crear Taller (Inventario)
         ══════════════════════════════════════════ */}
      <Modal isOpen={isOpenCrear} onClose={closeCrear} className="max-w-md p-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Crear Taller</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Agregue un taller al inventario maestro.</p>
          <form onSubmit={handleCrearInventario} className="space-y-4">
            <div>
              <label className={labelCls}>Nombre del Taller <span className="text-red-500">*</span></label>
              <input type="text" value={inventarioForm.nombre}
                onChange={e => setInventarioForm(prev => ({ ...prev, nombre: e.target.value }))}
                className={inputCls} placeholder="Ej. Pintura al Óleo" required />
            </div>
            <div>
              <label className={labelCls}>Descripción</label>
              <textarea rows={3} value={inventarioForm.descripcion}
                onChange={e => setInventarioForm(prev => ({ ...prev, descripcion: e.target.value }))}
                className={inputCls + " resize-none"} placeholder="Breve descripción del taller..." />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button type="button" onClick={closeCrear} disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting}
                className="flex items-center justify-center min-w-[130px] px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait">
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : "Guardar Taller"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════
          MODAL: Editar Taller (Inventario)
         ══════════════════════════════════════════ */}
      <Modal isOpen={isOpenEditar} onClose={closeEditar} className="max-w-md p-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Editar Taller</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Modifique los datos del taller en el inventario.</p>
          <form onSubmit={handleEditarInventario} className="space-y-4">
            <div>
              <label className={labelCls}>Nombre del Taller <span className="text-red-500">*</span></label>
              <input type="text" value={inventarioForm.nombre}
                onChange={e => setInventarioForm(prev => ({ ...prev, nombre: e.target.value }))}
                className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Descripción</label>
              <textarea rows={3} value={inventarioForm.descripcion}
                onChange={e => setInventarioForm(prev => ({ ...prev, descripcion: e.target.value }))}
                className={inputCls + " resize-none"} />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button type="button" onClick={closeEditar} disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting}
                className="flex items-center justify-center min-w-[130px] px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait">
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : "Actualizar"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════
          MODAL: Planificar Taller (Listado)
         ══════════════════════════════════════════ */}
      <Modal isOpen={isOpenPlanificar} onClose={closePlanificar} className="max-w-[580px] p-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Planificar Taller</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Programe una edición del taller con fecha, instructor y cupos.</p>
          <form onSubmit={handleSubmitPlanificar} className="space-y-4">
            <div>
              <label className={labelCls}>Taller <span className="text-red-500">*</span></label>
              <select name="id_taller_inventario" value={planificarForm.id_taller_inventario}
                onChange={handlePlanificarChange} className={selectCls} required>
                <option value={0}>Seleccione un taller del inventario...</option>
                {inventario.map((i: any) => (
                  <option key={i.id_taller || i.id} value={i.id_taller || i.id}>{i.nombre}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Instructor</label>
                <select name="id_instructor" value={planificarForm.id_instructor}
                  onChange={handlePlanificarChange} className={selectCls}>
                  <option value={0}>Seleccione...</option>
                  {instructores.map(i => (
                    <option key={i.id_instructor} value={i.id_instructor}>
                      {i.Persona ? `${i.Persona.nombres} ${i.Persona.apellidos}` : `Instructor #${i.id_instructor}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Espacio / Sala</label>
                <select name="id_espacio" value={planificarForm.id_espacio}
                  onChange={handlePlanificarChange} className={selectCls}>
                  <option value={0}>Seleccione...</option>
                  {espacios.map(e => (
                    <option key={e.id_espacio} value={e.id_espacio}>{e.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Sesiones</label>
                <input type="number" name="sesiones" value={planificarForm.sesiones}
                  onChange={handlePlanificarChange} className={inputCls} min={1} />
              </div>
              <div>
                <label className={labelCls}>Cupo Mínimo</label>
                <input type="number" name="cupo_minimo" value={planificarForm.cupo_minimo}
                  onChange={handlePlanificarChange} className={inputCls} min={0} />
              </div>
              <div>
                <label className={labelCls}>Cupo Máximo</label>
                <input type="number" name="cupo_maximo" value={planificarForm.cupo_maximo}
                  onChange={handlePlanificarChange} className={inputCls} min={1} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Fecha del Taller</label>
              <input type="date" name="fecha" value={planificarForm.fecha}
                onChange={handlePlanificarChange} className={inputCls} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Hora Inicio</label>
                <input type="time" name="hora_inicio" value={planificarForm.hora_inicio}
                  onChange={handlePlanificarChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Hora Fin</label>
                <input type="time" name="hora_fin" value={planificarForm.hora_fin}
                  onChange={handlePlanificarChange} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Horas Totales</label>
                <input type="number" name="horas_totales" value={planificarForm.horas_totales}
                  onChange={handlePlanificarChange} className={inputCls} min={0} />
              </div>
              <div>
                <label className={labelCls}>Estado</label>
                <select name="estado" value={planificarForm.estado ? "true" : "false"}
                  onChange={e => setPlanificarForm(prev => ({ ...prev, estado: e.target.value === "true" }))}
                  className={selectCls}>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button type="button" onClick={closePlanificar} disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting}
                className="flex items-center justify-center min-w-[150px] px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait">
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : "Planificar Taller"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════
          MODAL: Inscribir Alumno
         ══════════════════════════════════════════ */}
      <Modal isOpen={isOpenEnroll} onClose={closeEnrollModal} className="max-w-2xl p-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Inscribir Alumno</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            Taller: <span className="font-semibold text-brand-600 dark:text-brand-400">{selectedTallerEnroll?.nombre_curso || ""}</span>
          </p>
          <form onSubmit={handleSubmitInscripcion} className="space-y-4">
            <div>
              <label className={labelCls}>Taller o Curso</label>
              <select name="tallerId" value={enrollForm.tallerId} onChange={handleEnrollChange} className={selectCls} required>
                {talleres.map(t => <option key={t.id_taller} value={t.id_taller}>{t.nombre_curso}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nombre del Alumno <span className="text-red-500">*</span></label>
                <input type="text" name="alumnoNombre" value={enrollForm.alumnoNombre} onChange={handleEnrollChange}
                  className={inputCls} required disabled={isSubmitting} placeholder="Ej. Carlos Mendoza" />
              </div>
              <div>
                <label className={labelCls}>Edad <span className="text-red-500">*</span></label>
                <input type="number" name="alumnoEdad" value={enrollForm.alumnoEdad} onChange={handleEnrollChange}
                  className={inputCls} required disabled={isSubmitting} placeholder="Ej. 12" />
                {enrollForm.alumnoEdad && !esMenor && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">Mayor de edad — no requiere representante.</p>
                )}
                {esMenor && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Menor de edad — se requieren datos del representante.</p>
                )}
              </div>
            </div>
            {esMenor && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-amber-50/50 dark:bg-amber-500/5 rounded-lg border border-amber-200 dark:border-amber-500/20">
                <div>
                  <label className={labelCls}>Nombre del Representante</label>
                  <input type="text" name="repNombre" value={enrollForm.repNombre} onChange={handleEnrollChange}
                    className={inputCls} required disabled={isSubmitting} placeholder="Ej. Ana Mendoza" />
                </div>
                <div>
                  <label className={labelCls}>Cédula</label>
                  <input type="text" name="repCedula" value={enrollForm.repCedula} onChange={handleEnrollChange}
                    className={inputCls} required disabled={isSubmitting} placeholder="V-12345678" />
                </div>
                <div>
                  <label className={labelCls}>Teléfono</label>
                  <input type="text" name="repTelefono" value={enrollForm.repTelefono} onChange={handleEnrollChange}
                    className={inputCls} disabled={isSubmitting} placeholder="0414-1234567" />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button type="button" onClick={closeEnrollModal} disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting}
                className="flex items-center justify-center min-w-[150px] px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition disabled:opacity-70 disabled:cursor-wait">
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : "Inscribir Alumno"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════
          MODAL: Ver Inscripciones
         ══════════════════════════════════════════ */}
      <Modal isOpen={isOpenInscr} onClose={closeInscrModal} className="max-w-4xl p-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Inscripciones</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            Taller: <span className="font-semibold text-brand-600 dark:text-brand-400">{selectedTaller?.nombre_curso || ""}</span>
          </p>
          <div className="flex gap-2 mb-4">
            <button onClick={() => exportInscripcionesFn('pdf')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar PDF
            </button>
            <button onClick={() => exportInscripcionesFn('excel')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-500">No hay inscripciones para este taller.</td></tr>
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
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════
          MODAL: Ver Asistentes (Recepción / QR)
         ══════════════════════════════════════════ */}
      <Modal isOpen={isOpenAsistentes} onClose={closeAsistentesModal} className="max-w-4xl p-6">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Asistentes Check-In</h3>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full dark:bg-amber-900/30 dark:text-amber-400">
              Total: {tallerAsistentes.length} {tallerAsistentes.length === 1 ? 'persona' : 'personas'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            Visitantes confirmados en recepción o por QR para: <span className="font-semibold text-brand-600 dark:text-brand-400">{selectedTaller?.nombre_curso || ""}</span>
          </p>
          
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full text-left relative">
              <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10 shadow-sm">
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nombre y Apellido</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Cédula</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Acompañantes</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Hora Ingreso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tallerAsistentes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-gray-500">
                      Nadie se ha registrado en puerta para este taller.
                    </td>
                  </tr>
                ) : (
                  tallerAsistentes.map((a, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-gray-800 dark:text-gray-200 font-medium">
                        {a.Persona ? `${a.Persona.nombres || ""} ${a.Persona.apellidos || ""}`.trim() : "Desconocido"}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{a.Persona?.cedula || "-"}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-800 dark:text-gray-200">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-brand-800 bg-brand-100 rounded-full dark:bg-brand-900/30 dark:text-brand-400">
                          +{a.cantidad_acompanantes || 0}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">
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
              className="px-5 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition">
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
