import { useState, useEffect, useMemo } from "react";
import { useModal } from "./useModal";
import { mavetApi } from "../services/api";
import toast from "react-hot-toast";

export const ITEMS_PER_PAGE = 10;

export const initialInventarioForm = { nombre: "", descripcion: "" };

export const initialPlanificarForm = {
  id_taller_inventario: 0,
  cedula_instructor: "",
  id_espacio: 0,
  sesiones: "",
  fecha: "",
  hora_inicio: "",
  hora_fin: "",
  horas_totales: 0,
  cupo_minimo: 0,
  cupo_maximo: 0,
  estado: true
};

export const initialEnrollForm = {
  tallerId: "",
  alumnoNombre: "",
  alumnoEdad: "",
  repNombre: "",
  repCedula: "",
  repTelefono: "",
  correo: ""
};

export function useTalleres() {
  const [talleres, setTalleres] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [instructores, setInstructores] = useState<any[]>([]);
  const [espacios, setEspacios] = useState<any[]>([]);
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);

  const { isOpen: isOpenCrear, openModal: openCrear, closeModal: closeCrear } = useModal();
  const { isOpen: isOpenEditar, openModal: openEditar, closeModal: closeEditar } = useModal();
  const { isOpen: isOpenPlanificar, openModal: openPlanificar, closeModal: closePlanificar } = useModal();
  const { isOpen: isOpenInscr, openModal: openInscrModal, closeModal: closeInscrModal } = useModal();
  const { isOpen: isOpenEnroll, openModal: openEnrollModal, closeModal: closeEnrollModal } = useModal();

  const [selectedInventario, setSelectedInventario] = useState<any>(null);
  const [selectedTaller, setSelectedTaller] = useState<any>(null);
  const [isEditingPlanificado, setIsEditingPlanificado] = useState(false);
  const [selectedTallerEnroll, setSelectedTallerEnroll] = useState<any>(null);
  const [tallerInscripciones, setTallerInscripciones] = useState<any[]>([]);
  const [tallerAsistentes, setTallerAsistentes] = useState<any[]>([]);
  const { isOpen: isOpenAsistentes, openModal: openAsistentesModal, closeModal: closeAsistentesModal } = useModal();

  const [confirm, setConfirm] = useState<{ open: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; variant?: "danger" | "warning" | "info" }>({
    open: false, title: "", message: "", onConfirm: () => {}, variant: "danger",
  });

  const [inventarioForm, setInventarioForm] = useState(initialInventarioForm);

  const [planificarForm, setPlanificarForm] = useState(initialPlanificarForm);

  const [cedulaInstructor, setCedulaInstructor] = useState("");
  const [instructorNombre, setInstructorNombre] = useState("");
  const [instructorLoading, setInstructorLoading] = useState(false);
  const [instructorError, setInstructorError] = useState("");
  const [instructorAuto, setInstructorAuto] = useState(false);
  const [instructorId, setInstructorId] = useState<number | null>(null);

  const handleCedulaInstructorChange = (value: string) => {
    setCedulaInstructor(value);
    if (instructorAuto) {
      setInstructorNombre("");
      setInstructorAuto(false);
    }
    setInstructorError("");
  };

  const [enrollForm, setEnrollForm] = useState(initialEnrollForm);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const edadNum = parseInt(enrollForm.alumnoEdad, 10);
  const esMenor = !isNaN(edadNum) && edadNum < 18;

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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invRes, tal, inst, esp, ins] = await Promise.all([
        mavetApi.getInventarioTalleres(),
        mavetApi.getTalleres(),
        mavetApi.getInstructores(),
        mavetApi.getEspaciosMuseo(),
        mavetApi.getInscripcionesTaller()
      ]);
      setInventario(invRes.data);
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
      await mavetApi.crearInventarioTaller(inventarioForm as any);
      toast.success("Taller agregado al inventario.");
      closeCrear();
      const refreshed = await mavetApi.getInventarioTalleres();
      setInventario(refreshed.data);
    } catch (error: any) {
      toast.error(error.message || "Error al crear taller.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      await mavetApi.actualizarInventarioTaller(selectedInventario.id_taller || selectedInventario.id, inventarioForm as any);
      toast.success("Taller actualizado en el inventario.");
      closeEditar();
      const refreshed = await mavetApi.getInventarioTalleres();
      setInventario(refreshed.data);
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar taller.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEliminarInventario = (item: any) => {
    setConfirm({
      open: true,
      title: "Eliminar del inventario",
      message: `¿Estás seguro de eliminar "${item.nombre}" del inventario?`,
      variant: "danger",
      confirmLabel: "Eliminar",
      onConfirm: async () => {
        setConfirm(prev => ({ ...prev, open: false }));
        try {
          await mavetApi.eliminarInventarioTaller(item.id_taller || item.id);
          toast.success("Taller eliminado del inventario.");
          const refreshed = await mavetApi.getInventarioTalleres();
          setInventario(refreshed.data);
        } catch (error: any) {
          toast.error(error.message || "Error al eliminar taller del inventario.");
        }
      },
    });
  };

  const handleOpenPlanificar = (taller?: any) => {
    if (taller) {
      setIsEditingPlanificado(true);
      setSelectedTaller(taller);
      const inst = taller.Instructor;
      const cedula = inst?.Persona?.cedula || taller.cedula_instructor || "";
      const nombre = inst?.Persona
        ? `${inst.Persona.nombres || ""} ${inst.Persona.apellidos || ""}`.trim()
        : "";
      setCedulaInstructor(cedula);
      setInstructorNombre(nombre);
      setInstructorId(inst?.id_instructor || taller.id_instructor || null);
      setInstructorAuto(!!cedula);
      setInstructorError("");
      setPlanificarForm({
        id_taller_inventario: taller.inventario_id || 0,
        cedula_instructor: cedula,
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
      setPlanificarForm({ ...initialPlanificarForm });
      setCedulaInstructor("");
      setInstructorNombre("");
      setInstructorId(null);
      setInstructorAuto(false);
      setInstructorError("");
    }
    openPlanificar();
  };

  const handleEliminarPlanificado = (taller: any) => {
    setConfirm({
      open: true,
      title: "Eliminar taller planificado",
      message: `¿Estás seguro de eliminar el taller planificado "${taller.nombre_curso}"? Esta acción no se puede deshacer.`,
      variant: "danger",
      confirmLabel: "Eliminar",
      onConfirm: async () => {
        setConfirm(prev => ({ ...prev, open: false }));
        try {
          await mavetApi.eliminarTaller(taller.id_taller);
          toast.success("Taller eliminado correctamente.");
          const refreshed = await mavetApi.getTalleres();
          setTalleres(refreshed);
        } catch (error: any) {
          toast.error(error.message || "Error al eliminar taller planificado.");
        }
      },
    });
  };

  const handlePlanificarChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numFields = ["id_taller_inventario", "id_espacio", "sesiones", "horas_totales", "cupo_minimo", "cupo_maximo"];
    setPlanificarForm(prev => ({
      ...prev,
      [name]: numFields.includes(name) ? Number(value) : value
    }));
  };

  const handleInstructorCedulaSearch = async () => {
    const cedula = cedulaInstructor.trim();
    if (!cedula) {
      setInstructorError("");
      setInstructorAuto(false);
      return;
    }
    setInstructorLoading(true);
    setInstructorError("");
    try {
      const inst = instructores.find(
        i => i.Persona?.cedula === cedula
      );
      if (inst) {
        setInstructorId(inst.id_instructor);
        const nombreCompleto = `${inst.Persona?.nombres || ""} ${inst.Persona?.apellidos || ""}`.trim();
        setInstructorNombre(nombreCompleto);
        setInstructorAuto(true);
        setInstructorError("");
      } else {
        setInstructorId(null);
        setInstructorNombre("");
        setInstructorAuto(false);
        setInstructorError("Instructor no encontrado para esa cédula.");
      }
    } catch {
      setInstructorError("Error al buscar la cédula. Intente de nuevo.");
      setInstructorAuto(false);
    } finally {
      setInstructorLoading(false);
    }
  };

  const handleSubmitPlanificar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planificarForm.id_taller_inventario) {
      toast.error("Debe seleccionar un taller del inventario.");
      return;
    }
    if (!instructorId) {
      toast.error("Debe buscar y seleccionar un instructor válido.");
      return;
    }
    setIsSubmitting(true);
    try {
      const selected = inventario.find(i => (i.id_taller || i.id) === planificarForm.id_taller_inventario);
      const payload = {
        inventario_id: planificarForm.id_taller_inventario,
        id_instructor: instructorId,
        id_espacio: planificarForm.id_espacio || null,
        nombre_curso: selected?.nombre || "",
        sesiones: planificarForm.sesiones ? Number(planificarForm.sesiones) : null,
        fecha: planificarForm.fecha || null,
        hora_inicio: planificarForm.hora_inicio || null,
        hora_fin: planificarForm.hora_fin || null,
        horas_totales: planificarForm.horas_totales || null,
        cupo_minimo: planificarForm.cupo_minimo || null,
        cupo_maximo: planificarForm.cupo_maximo || null,
        estado: planificarForm.estado ? "Activo" : "Inactivo"
      };

      if (isEditingPlanificado && selectedTaller?.id_taller) {
        await mavetApi.actualizarTaller(selectedTaller.id_taller, payload as any);
        toast.success("Taller planificado actualizado correctamente.");
      } else {
        await mavetApi.crearTaller(payload as any);
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
      const result = await mavetApi.getTodosIngresos();
      const asistentes = result.data.filter(i => String(i.id_taller) === String(taller.id_taller));
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
  const totalPages = Math.ceil(filteredTalleres.length / ITEMS_PER_PAGE);
  const paginatedTalleres = filteredTalleres.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const totalPlanificados = talleres.filter(t => t.estado === "Activo" || t.estado === true).length;
  const totalInscritos = inscripciones.length;
  const totalInventario = inventario.length;

  return {
    talleres, inventario, instructores, espacios, inscripciones,
    isLoading,
    searchTerm, setSearchTerm,
    filterInstructor, setFilterInstructor,
    currentPage, setCurrentPage,
    inventarioForm, setInventarioForm,
    planificarForm, setPlanificarForm,
    enrollForm, setEnrollForm,
    cedulaInstructor,
    instructorNombre,
    instructorLoading,
    instructorError,
    instructorAuto,
    instructorId,
    isSubmitting,
    edadNum, esMenor, inscripcionesAgrupadas,
    filteredTalleres, totalPages, paginatedTalleres,
    totalPlanificados, totalInscritos, totalInventario,
    selectedInventario, setSelectedInventario,
    selectedTaller, setSelectedTaller,
    isEditingPlanificado, setIsEditingPlanificado,
    selectedTallerEnroll, setSelectedTallerEnroll,
    tallerInscripciones, setTallerInscripciones,
    tallerAsistentes, setTallerAsistentes,
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
  };
}
