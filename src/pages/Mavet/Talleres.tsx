import toast from "react-hot-toast";
import React, { useState, useEffect, useMemo } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { mavetApi } from "../../services/api";

const inputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 dark:text-white/90 dark:bg-gray-900";
const labelCls = "block mb-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";
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
  const [isEditingPlanificado, setIsEditingPlanificado] = useState(false);
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

  // ─── Group inscripciones by taller ───
  const inscripcionesAgrupadas = useMemo(() => {
    const map = new Map<number, { taller: any; alumnos: any[] }>();
    inscripciones.forEach((ins: any) => {
      const id = ins.Taller?.id_taller || ins.id_taller;
      if (!map.has(id)) {
        map.set(id, { taller: ins.Taller, alumnos: [] });
      }
      map.get(id)!.alumnos.push(ins);
    });
    return Array.from(map.values()).sort((a, b) => b.alumnos.length - a.alumnos.length);
  }, [inscripciones]);

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

  // ─── Inventario: Eliminar ───
  const handleEliminarInventario = async (item: any) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${item.nombre}" del inventario?`)) return;
    try {
      await mavetApi.eliminarInventarioTaller(item.id_taller || item.id);
      toast.success("Taller eliminado del inventario.");
      const refreshed = await mavetApi.getInventarioTalleres();
      setInventario(refreshed);
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar taller del inventario.");
    }
  };

  // ─── Planificar Taller ───
  const handleOpenPlanificar = (taller?: any) => {
    if (taller) {
      setIsEditingPlanificado(true);
      setSelectedTaller(taller);
      setPlanificarForm({
        id_taller_inventario: taller.inventario_id || 0,
        id_instructor: taller.id_instructor || 0,
        id_espacio: taller.id_espacio || 0,
        sesiones: taller.sesiones || "",
        fecha: taller.fecha || "",
        hora_inicio: taller.hora_inicio || "",
        hora_fin: taller.hora_fin || "",
        horas_totales: taller.horas_totales || 0,
        cupo_minimo: taller.cupo_minimo || 0,
        cupo_maximo: taller.cupo_maximo || 0,
        estado: taller.estado === "Activo" || taller.estado === true
      });
    } else {
      setIsEditingPlanificado(false);
      setSelectedTaller(null);
      setPlanificarForm({
        id_taller_inventario: 0, id_instructor: 0, id_espacio: 0, sesiones: "",
        fecha: "", hora_inicio: "", hora_fin: "", horas_totales: 0,
        cupo_minimo: 0, cupo_maximo: 0, estado: true
      });
    }
    openPlanificar();
  };

  const handleEliminarPlanificado = async (taller: any) => {
    if (window.confirm(`¿Estás seguro de eliminar el taller planificado "${taller.nombre_curso}"? Esta acción no se puede deshacer.`)) {
      try {
        await mavetApi.eliminarTaller(taller.id_taller);
        toast.success("Taller eliminado correctamente.");
        const refreshed = await mavetApi.getTalleres();
        setTalleres(refreshed);
      } catch (error: any) {
        toast.error(error.message || "Error al eliminar taller planificado.");
      }
    }
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
      
      if (isEditingPlanificado && selectedTaller) {
        await mavetApi.actualizarTaller(selectedTaller.id_taller, payload);
        toast.success("Taller planificado actualizado correctamente.");
      } else {
        await mavetApi.crearTaller(payload);
        toast.success("Taller planificado correctamente.");
      }
      
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

  const thCls = "px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap";
  const tdCls = "px-3 py-2 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap";

  // ─── Totals for stat cards ───
  const totalPlanificados = talleres.filter(t => t.estado === "Activo" || t.estado === true).length;
  const totalInscritos = inscripciones.length;
  const totalInventario = inventario.length;

  return (
    <div className="space-y-6">

      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Talleres</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Administración de talleres, planificación y control de inscripciones.</p>
      </div>

      {/* ─── Summary Stats ─── */}
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
                {instructores.map((inst: any) => (
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
        <table className="w-full text-left">
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
                    <button onClick={() => {
                      const menu = document.getElementById(`actions-${t.id_taller}`);
                      if (menu) { menu.classList.toggle('hidden'); menu.classList.toggle('flex'); }
                    }}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                      </svg>
                    </button>
                    <div id={`actions-${t.id_taller}`} className="hidden absolute right-0 top-full z-20 mt-1 min-w-[140px] flex-col rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg py-1">
                      <button onClick={() => { document.getElementById(`actions-${t.id_taller}`)?.classList.add('hidden'); openEnrolments(t); }}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                        <svg className="w-3.5 h-3.5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Inscritos
                      </button>
                      <button onClick={() => { document.getElementById(`actions-${t.id_taller}`)?.classList.add('hidden'); openAsistentes(t); }}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                        <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        Asistentes
                      </button>
                      <button onClick={() => { document.getElementById(`actions-${t.id_taller}`)?.classList.add('hidden'); openEnroll(t); }}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                        <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Inscribir
                      </button>
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                      <button onClick={() => { document.getElementById(`actions-${t.id_taller}`)?.classList.add('hidden'); handleOpenPlanificar(t); }}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        Editar
                      </button>
                      <button onClick={() => { document.getElementById(`actions-${t.id_taller}`)?.classList.add('hidden'); handleEliminarPlanificado(t); }}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-left">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
          ALUMNOS INSCRITOS POR TALLER
         ══════════════════════════════════════════ */}
      <ComponentCard title="Alumnos Inscritos por Taller" desc="Distribución de inscripciones agrupadas por taller">
        {inscripcionesAgrupadas.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm font-medium text-gray-500">No hay alumnos inscritos en ningún taller.</p>
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
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700/50">
                        <th className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 w-8">#</th>
                        <th className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Alumno</th>
                        <th className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Cédula</th>
                        <th className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Fecha</th>
                        <th className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 w-20">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 bg-white dark:bg-gray-900/20">
                      {grupo.alumnos.map((ins: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-3 py-1.5 text-xs text-gray-400 tabular-nums">{i + 1}</td>
                          <td className="px-3 py-1.5 text-sm text-gray-800 dark:text-gray-200">
                            {ins.Alumno ? `${ins.Alumno.nombres || ""} ${ins.Alumno.apellidos || ""}`.trim() : "-"}
                          </td>
                          <td className="px-3 py-1.5 text-sm text-gray-500 font-mono">{ins.Alumno?.cedula || "-"}</td>
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

      {/* ══════════════════════════════════════════
          INVENTARIO DE TALLERES
         ══════════════════════════════════════════ */}
      <ComponentCard 
        title="Inventario de Talleres" 
        desc="Catálogo maestro de talleres disponibles"
        action={
          <button onClick={handleOpenCrear}
            className="bg-brand-500 text-white font-semibold py-2 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors flex items-center gap-2 text-sm whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Crear Taller
          </button>
        }
      >
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <th className={thCls}>Nombre</th>
              <th className={thCls}>Descripción</th>
              <th className={`${thCls} text-center w-20`}>Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr><td colSpan={3} className="px-3 py-6 text-center text-gray-500 text-sm">Cargando...</td></tr>
            ) : inventario.length === 0 ? (
              <tr><td colSpan={3} className="px-3 py-8 text-center text-gray-500">
                <p className="text-sm">No hay talleres en el inventario. Cree uno con el botón "Crear Taller".</p>
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
                <td className={`${tdCls} text-gray-500 dark:text-gray-400 truncate max-w-xs`}>{item.descripcion || "—"}</td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <button onClick={() => handleOpenEditar(item)}
                    className="p-1 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded transition-colors" title="Editar">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button onClick={() => handleEliminarInventario(item)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors" title="Eliminar">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {isEditingPlanificado ? "Editar Taller Planificado" : "Planificar Taller"}
          </h3>
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
                  <th className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nombre y Apellido</th>
                  <th className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Cédula</th>
                  <th className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Acompañantes</th>
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
              className="px-5 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition">
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
