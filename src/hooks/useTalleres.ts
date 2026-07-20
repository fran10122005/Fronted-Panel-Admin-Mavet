import { useState, useEffect, useMemo } from "react";
import { useModal } from "./useModal";
import { mavetApi } from "../services/api";
import toast from "react-hot-toast";
import { useTalleresInscripciones } from "./useTalleresInscripciones";
import { useTalleresInstructor } from "./useTalleresInstructor";

const ITEMS_PER_PAGE = 10;

function autoInactivarVencidos(talleres: any[]): any[] {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return talleres.map(t => {
    if (t.fecha_fin) {
      const fin = new Date(t.fecha_fin + "T23:59:59");
      if (fin < hoy && (t.estado === "Activo" || t.estado === true)) {
        return { ...t, estado: "Inactivo" };
      }
    }
    return t;
  });
}

async function persistirAutoInactivacion(talleres: any[]): Promise<void> {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencidos = talleres.filter(t => {
    if (!t.fecha_fin) return false;
    const fin = new Date(t.fecha_fin + "T23:59:59");
    return fin < hoy && (t.estado === "Activo" || t.estado === true);
  });
  if (vencidos.length === 0) return;
  await Promise.allSettled(
    vencidos.map(t =>
      mavetApi.actualizarTaller(t.id_taller, { estado: "Inactivo" } as any)
    )
  );
}

function autoInactivarInscripcionesVencidas(inscripciones: any[], talleres: any[]): any[] {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return inscripciones.map(ins => {
    const taller = talleres.find(t => String(t.id_taller) === String(ins.id_taller));
    if (taller?.fecha_fin) {
      const fin = new Date(taller.fecha_fin + "T23:59:59");
      if (fin < hoy && ins.estado_inscripcion === "Inscrito") {
        return { ...ins, estado_inscripcion: "Inactivo" };
      }
    }
    return ins;
  });
}

async function persistirAutoInactivacionInscripciones(inscripciones: any[], talleres: any[]): Promise<void> {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencidas = inscripciones.filter(ins => {
    const taller = talleres.find(t => String(t.id_taller) === String(ins.id_taller));
    if (!taller?.fecha_fin) return false;
    const fin = new Date(taller.fecha_fin + "T23:59:59");
    return fin < hoy && ins.estado_inscripcion === "Inscrito";
  });
  if (vencidas.length === 0) return;
  await Promise.allSettled(
    vencidas.map(ins =>
      mavetApi.actualizarInscripcion(ins.id_inscripcion, { estado_inscripcion: "Inactivo" })
    )
  );
}

const initialInventarioForm = { nombre: "", descripcion: "" };

const initialPlanificarForm = {
  id_taller_inventario: "",
  selectedInstructorId: "",
  id_espacio: "",
  sesiones: "",
  fecha: "",
  fecha_fin: "",
  hora_inicio: "",
  hora_fin: "",
  horas_totales: "" as number | string,
  cupo_minimo: "" as number | string,
  cupo_maximo: "" as number | string,
  estado: true,
  documentoPlan: null as File | null,
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
  const [verHistorial, setVerHistorial] = useState(false);
  const [verHistorialInsc, setVerHistorialInsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInventario, setSearchInventario] = useState("");

  const { isOpen: isOpenCrear, openModal: openCrear, closeModal: closeCrear } = useModal();
  const { isOpen: isOpenEditar, openModal: openEditar, closeModal: closeEditar } = useModal();
  const { isOpen: isOpenPlanificar, openModal: openPlanificar, closeModal: closePlanificar } = useModal();
  const [selectedInventario, setSelectedInventario] = useState<any>(null);
  const [selectedTaller, setSelectedTaller] = useState<any>(null);
  const [isEditingPlanificado, setIsEditingPlanificado] = useState(false);
  const [tallerAsistentes, setTallerAsistentes] = useState<any[]>([]);

  const { isOpen: isOpenAsistentes, openModal: openAsistentesModal, closeModal: closeAsistentesModal } = useModal();

  const [confirm, setConfirm] = useState<{ open: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; variant?: "danger" | "warning" | "info" }>({
    open: false, title: "", message: "", onConfirm: () => {}, variant: "danger",
  });

  const [inventarioForm, setInventarioForm] = useState(initialInventarioForm);
  const [planificarForm, setPlanificarForm] = useState(initialPlanificarForm);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});


  const [isSubmitting, setIsSubmitting] = useState(false);

  const instructor = useTalleresInstructor(
    instructores, setInstructores, setIsSubmitting, setConfirm,
    (id) => setPlanificarForm((prev: any) => ({ ...prev, selectedInstructorId: id })),
    setFormError,
  );

  const insc = useTalleresInscripciones(setInscripciones, setConfirm, selectedTaller, setFormError);

  const edadNum = insc.edadNum;
  const esMenor = insc.esMenor;

  const inscripcionesAgrupadas = useMemo(() => {
    const map = new Map<number, { taller: any; alumnos: any[] }>();
    const inscFiltradas = verHistorialInsc
      ? inscripciones.filter(ins => ins.estado_inscripcion !== "Inscrito" && ins.estado_inscripcion !== "Activo")
      : inscripciones.filter(ins => ins.estado_inscripcion === "Inscrito" || ins.estado_inscripcion === "Activo");
    inscFiltradas.forEach((ins: any) => {
      const id = ins.Taller?.id_taller || ins.id_taller;
      if (!map.has(id)) {
        map.set(id, { taller: ins.Taller, alumnos: [] });
      }
      map.get(id)!.alumnos.push(ins);
    });
    return Array.from(map.values()).sort((a, b) => b.alumnos.length - a.alumnos.length);
  }, [inscripciones, verHistorialInsc]);

  const statsInscripciones = useMemo(() => {
    const activas = inscripciones.filter(ins => ins.estado_inscripcion === "Inscrito" || ins.estado_inscripcion === "Activo").length;
    const historial = inscripciones.filter(ins => ins.estado_inscripcion !== "Inscrito" && ins.estado_inscripcion !== "Activo").length;
    return { activas, historial };
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
      const talleresAuto = autoInactivarVencidos(tal);
      setTalleres(talleresAuto);
      const inscripcionesAuto = autoInactivarInscripcionesVencidas(ins, talleresAuto);
      setInstructores(inst);
      setEspacios(esp.filter((e: any) => {
        const n = (e.nombre_espacio || e.nombre || "").toLowerCase();
        return !n.includes("boveda") && !n.includes("bóveda");
      }));
      setInscripciones(inscripcionesAuto);
      persistirAutoInactivacion(tal);
      persistirAutoInactivacionInscripciones(inscripcionesAuto, talleresAuto);
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
    setFormError("");
    setInventarioForm({ nombre: "", descripcion: "" });
    openCrear();
  };

  const handleCrearInventario = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!inventarioForm.nombre.trim()) {
      setFormError("El nombre del taller es obligatorio.");
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
    setFormError("");
    setSelectedInventario(item);
    setInventarioForm({ nombre: item.nombre || "", descripcion: item.descripcion || "" });
    openEditar();
  };

  const handleEditarInventario = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!inventarioForm.nombre.trim()) {
      setFormError("El nombre del taller es obligatorio.");
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
    setFormError("");
    setFieldErrors({});
    if (taller) {
      setIsEditingPlanificado(true);
      setSelectedTaller(taller);
      setPlanificarForm({
        id_taller_inventario: taller.inventario_id || "",
        selectedInstructorId: taller.id_instructor || "",
        id_espacio: taller.id_espacio || "",
        sesiones: taller.sesiones || "",
        fecha: taller.fecha || "",
        fecha_fin: taller.fecha_fin || "",
        hora_inicio: taller.hora_inicio || "",
        hora_fin: taller.hora_fin || "",
        horas_totales: taller.horas_totales ?? "",
        cupo_minimo: taller.cupo_minimo ?? "",
        cupo_maximo: taller.cupo_maximo ?? "",
        estado: taller.estado === "Activo" || taller.estado === true,
        documentoPlan: null,
      });
    } else {
      setIsEditingPlanificado(false);
      setSelectedTaller(null);
      setPlanificarForm({ ...initialPlanificarForm });
    }
    openPlanificar();
  };

  const handleDocumentoPlanChange = (file: File | null) => {
    setFormError("");
    setFieldErrors(prev => ({ ...prev, documentoPlan: "" }));
    setPlanificarForm(prev => ({ ...prev, documentoPlan: file }));
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
          setTalleres(autoInactivarVencidos(refreshed));
          persistirAutoInactivacion(refreshed);
        } catch (error: any) {
          toast.error(error.message || "Error al eliminar taller planificado.");
        }
      },
    });
  };

  const handlePlanificarChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormError("");
    const { name, value } = e.target;
    const numFields = ["sesiones", "cupo_minimo", "cupo_maximo"];

    // Limpiar error del campo que se está modificando
    setFieldErrors(prev => ({ ...prev, [name]: "" }));

    setPlanificarForm(prev => {
      const updated = {
        ...prev,
        // Para campos numéricos, guardar vacío si el valor es vacío, número si tiene valor
        [name]: numFields.includes(name) ? (value === "" ? "" : Number(value)) : value
      };

      // Calcular horas_totales automáticamente al cambiar hora_inicio, hora_fin o sesiones
      const horaInicio = name === "hora_inicio" ? value : prev.hora_inicio;
      const horaFin = name === "hora_fin" ? value : prev.hora_fin;
      const sesionesVal = name === "sesiones" ? value : String(prev.sesiones);
      const sesiones = Number(sesionesVal);

      if (horaInicio && horaFin && sesiones > 0) {
        const [hI, mI] = horaInicio.split(":").map(Number);
        const [hF, mF] = horaFin.split(":").map(Number);
        const inicioMin = hI * 60 + mI;
        const finMin = hF * 60 + mF;
        if (finMin > inicioMin) {
          const diffHoras = (finMin - inicioMin) / 60;
          updated.horas_totales = diffHoras * sesiones;
          // Limpiar el error de horas si ya es válido
          setFieldErrors(fe => ({ ...fe, hora_inicio: "", hora_fin: "" }));
        } else {
          updated.horas_totales = "";
          // Mostrar error de hora en tiempo real
          if ((name === "hora_inicio" || name === "hora_fin") && horaInicio && horaFin) {
            const diffMin = finMin - inicioMin;
            if (diffMin <= 0) {
              setFieldErrors(fe => ({ ...fe, hora_fin: "La hora de fin debe ser posterior a la hora de inicio" }));
            } else if (diffMin < 20) {
              setFieldErrors(fe => ({ ...fe, hora_fin: "La duración mínima es 20 minutos" }));
            }
          }
        }
      } else if (!horaInicio || !horaFin || sesiones <= 0) {
        // Si falta algún dato, limpiar horas_totales
        if (["hora_inicio", "hora_fin", "sesiones"].includes(name)) {
          updated.horas_totales = "";
        }
      }

      // Validación en tiempo real de cupos
      const cupoMin = name === "cupo_minimo" ? Number(value) : Number(prev.cupo_minimo);
      const cupoMax = name === "cupo_maximo" ? Number(value) : Number(prev.cupo_maximo);
      if (value !== "" && prev.cupo_minimo !== "" && prev.cupo_maximo !== "") {
        if (cupoMin > 0 && cupoMax > 0 && cupoMin > cupoMax) {
          setFieldErrors(fe => ({ ...fe, cupo_maximo: "El cupo máximo debe ser mayor o igual al cupo mínimo" }));
        } else if ((name === "cupo_minimo" || name === "cupo_maximo") && cupoMin <= cupoMax) {
          setFieldErrors(fe => ({ ...fe, cupo_maximo: "" }));
        }
      }

      // Validación en tiempo real de fechas
      const fechaInicio = name === "fecha" ? value : prev.fecha;
      const fechaFin = name === "fecha_fin" ? value : prev.fecha_fin;
      if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
        setFieldErrors(fe => ({ ...fe, fecha_fin: "La fecha de fin debe ser igual o posterior a la fecha de inicio" }));
      } else if ((name === "fecha" || name === "fecha_fin") && fechaInicio && fechaFin && fechaInicio <= fechaFin) {
        setFieldErrors(fe => ({ ...fe, fecha_fin: "" }));
      }

      // Validación en tiempo real de sesiones
      if (name === "sesiones" && value !== "" && Number(value) < 1) {
        setFieldErrors(fe => ({ ...fe, sesiones: "El número de sesiones debe ser al menos 1" }));
      } else if (name === "sesiones") {
        setFieldErrors(fe => ({ ...fe, sesiones: "" }));
      }

      // Sincronizar fecha_fin con fecha solo si cambió sesiones o fecha
      if (name === "sesiones" || name === "fecha") {
        const currentSesiones = name === "sesiones" ? value : prev.sesiones;
        const currentFecha = name === "fecha" ? value : prev.fecha;
        const sesionesNum = currentSesiones === "" ? 0 : Number(currentSesiones);
        if (sesionesNum <= 1) {
          updated.fecha_fin = currentFecha;
        }
      }

      return updated;
    });
  };

  const handleSubmitPlanificar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!planificarForm.documentoPlan && !isEditingPlanificado) {
      setFormError("Debe adjuntar el documento del plan programático.");
      return;
    }
    if (!planificarForm.id_taller_inventario) {
      setFormError("Debe seleccionar un taller del inventario.");
      return;
    }
    if (!planificarForm.selectedInstructorId) {
      setFormError("Debe seleccionar un instructor.");
      return;
    }
    if (!planificarForm.fecha) {
      setFormError("La fecha del taller es obligatoria.");
      return;
    }
    if (planificarForm.sesiones && Number(planificarForm.sesiones) > 20) {
      setFormError("El máximo de sesiones permitidas es 20.");
      return;
    }
    if (planificarForm.cupo_minimo && Number(planificarForm.cupo_minimo) < 2) {
      setFormError("El cupo mínimo debe ser al menos 2.");
      return;
    }
    if (planificarForm.cupo_maximo && Number(planificarForm.cupo_maximo) > 30) {
      setFormError("El cupo máximo no puede exceder de 30.");
      return;
    }
    if (planificarForm.cupo_maximo && Number(planificarForm.cupo_maximo) < 1) {
      setFormError("El cupo máximo debe ser mayor a 0.");
      return;
    }
    if (planificarForm.cupo_minimo && planificarForm.cupo_maximo && Number(planificarForm.cupo_minimo) > Number(planificarForm.cupo_maximo)) {
      setFormError('El cupo mínimo no puede ser mayor al cupo máximo');
      setIsSubmitting(false);
      return;
    }
    if (planificarForm.fecha) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [year, month, day] = planificarForm.fecha.split("-").map(Number);
      const inputDate = new Date(year, month - 1, day);
      if (inputDate < today) {
        setFormError("La fecha del taller no puede ser anterior al día actual.");
        setIsSubmitting(false);
        return;
      }
    }
    if (planificarForm.fecha && planificarForm.fecha_fin && planificarForm.fecha > planificarForm.fecha_fin) {
      setFormError('La fecha de inicio debe ser anterior o igual a la fecha de fin');
      setIsSubmitting(false);
      return;
    }
    if (planificarForm.hora_inicio) {
      const [h, m] = planificarForm.hora_inicio.split(':').map(Number);
      if (h < 9 || h > 17 || (h === 17 && m > 0)) {
        setFormError("La hora de inicio debe estar entre las 09:00 AM y las 05:00 PM.");
        setIsSubmitting(false);
        return;
      }
    }
    if (planificarForm.hora_fin) {
      const [h, m] = planificarForm.hora_fin.split(':').map(Number);
      if (h < 9 || h > 17 || (h === 17 && m > 0)) {
        setFormError("La hora de fin debe estar entre las 09:00 AM y las 05:00 PM.");
        setIsSubmitting(false);
        return;
      }
    }
    if (planificarForm.hora_inicio && planificarForm.hora_fin) {
      const [hI, mI] = planificarForm.hora_inicio.split(':').map(Number);
      const [hF, mF] = planificarForm.hora_fin.split(':').map(Number);
      const diffMin = hF * 60 + mF - (hI * 60 + mI);
      if (diffMin < 20) {
        setFormError('La hora de fin debe ser al menos 20 minutos después de la hora de inicio');
        setIsSubmitting(false);
        return;
      }
    }
    setFormError("");
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const selected = inventario.find(i => (i.id_taller || i.id) === planificarForm.id_taller_inventario);
      const rawPayload: any = {
        inventario_id: planificarForm.id_taller_inventario || undefined,
        id_instructor: planificarForm.selectedInstructorId || undefined,
        id_espacio: planificarForm.id_espacio || undefined,
        nombre_curso: selected?.nombre || "",
        sesiones: planificarForm.sesiones ? String(Number(planificarForm.sesiones)) : undefined,
        fecha: planificarForm.fecha || undefined,
        fecha_fin: planificarForm.fecha_fin || undefined,
        hora_inicio: planificarForm.hora_inicio || undefined,
        hora_fin: planificarForm.hora_fin || undefined,
        horas_totales: planificarForm.horas_totales ? String(Number(planificarForm.horas_totales)) : undefined,
        cupo_minimo: planificarForm.cupo_minimo ? String(Number(planificarForm.cupo_minimo)) : undefined,
        cupo_maximo: planificarForm.cupo_maximo ? String(Number(planificarForm.cupo_maximo)) : undefined,
        estado: planificarForm.estado ? 'Activo' : 'Inactivo'
      };
      // Remove undefined keys so they don't reach Zod
      const payload: any = Object.fromEntries(
        Object.entries(rawPayload).filter(([, v]) => v !== undefined)
      );

      if (isEditingPlanificado && selectedTaller?.id_taller) {
        await mavetApi.actualizarTaller(selectedTaller.id_taller, payload);
        if (planificarForm.documentoPlan) {
          await mavetApi.subirDocumentoPlan(selectedTaller.id_taller, planificarForm.documentoPlan);
        }
        toast.success("Taller planificado actualizado correctamente.");
      } else {
        const response = await mavetApi.crearTaller(payload);
        const newId = response.data?.id_taller || response.data?.id;
        
        if (planificarForm.documentoPlan && newId) {
          await mavetApi.subirDocumentoPlan(newId, planificarForm.documentoPlan);
        } else if (planificarForm.documentoPlan && !newId) {
          toast.error("El taller se creó, pero el servidor no devolvió el ID para subir el PDF.");
        }
        toast.success("Taller planificado correctamente.");
      }

      closePlanificar();
      const [talleresData, inscripcionesData] = await Promise.all([
        mavetApi.getTalleres(),
        mavetApi.getInscripcionesTaller()
      ]);
      const talleresAuto = autoInactivarVencidos(talleresData);
      const inscripcionesAuto = autoInactivarInscripcionesVencidas(inscripcionesData, talleresAuto);
      setTalleres(talleresAuto);
      setInscripciones(inscripcionesAuto);
      persistirAutoInactivacion(talleresData);
      persistirAutoInactivacionInscripciones(inscripcionesAuto, talleresAuto);
    } catch (error: any) {
      setFormError(error.message || "Error al planificar taller.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const openAsistentes = async (taller: any) => {
    setSelectedTaller(taller);
    try {
      const result = await mavetApi.getTodosIngresos();
      const asistentes = result.data.filter((i: any) => String(i.id_taller) === String(taller.id_taller));
      setTallerAsistentes(asistentes);
    } catch {
      setTallerAsistentes([]);
    }
    openAsistentesModal();
  };

  const filteredTalleres = talleres.filter(t => {
    const term = searchTerm.toLowerCase();
    const instructorName = t.Instructor?.Persona ? `${t.Instructor.Persona.nombres || ""} ${t.Instructor.Persona.apellidos || ""}`.trim() : "";

    const matchesSearch =
      t.nombre_curso?.toLowerCase().includes(term) ||
      t.Instructor?.Persona?.nombres?.toLowerCase().includes(term) ||
      t.Instructor?.Persona?.apellidos?.toLowerCase().includes(term);

    const matchesInstructor = filterInstructor === "Todos" || instructorName === filterInstructor;
    const matchesEstado = verHistorial
      ? (t.estado === "Inactivo" || t.estado === false)
      : (t.estado === "Activo" || t.estado === true);

    return matchesSearch && matchesInstructor && matchesEstado;
  });
  const totalPages = Math.ceil(filteredTalleres.length / ITEMS_PER_PAGE);
  const paginatedTalleres = filteredTalleres.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const totalPlanificados = talleres.filter(t => t.estado === "Activo" || t.estado === true).length;
  const totalInscritos = inscripciones.length;
  const totalInventario = inventario.length;

  const filteredInventario = inventario.filter(item => {
    const term = searchInventario.toLowerCase();
    return (
      item.nombre?.toLowerCase().includes(term) ||
      item.descripcion?.toLowerCase().includes(term)
    );
  });

  return {
    talleres, inventario, instructores, espacios, inscripciones,
    isLoading,
    searchTerm, setSearchTerm,
    searchInventario, setSearchInventario,
    filterInstructor, setFilterInstructor,
    currentPage, setCurrentPage,
    inventarioForm, setInventarioForm,
    planificarForm, setPlanificarForm,
    isSubmitting,
    inscripcionesAgrupadas,
    filteredTalleres, totalPages, paginatedTalleres,
    totalPlanificados, totalInscritos, totalInventario,
    verHistorial, setVerHistorial,
    verHistorialInsc, setVerHistorialInsc,
    statsInscripciones,
    filteredInventario,
    selectedInventario, setSelectedInventario,
    selectedTaller, setSelectedTaller,
    isEditingPlanificado, setIsEditingPlanificado,
    tallerAsistentes, setTallerAsistentes,
    isOpenCrear, closeCrear,
    isOpenEditar, closeEditar,
    isOpenPlanificar, closePlanificar,
    isOpenAsistentes, closeAsistentesModal,
    confirm, setConfirm,
    formError, setFormError,
    fieldErrors,
    handleOpenCrear, handleCrearInventario,
    handleOpenEditar, handleEditarInventario,
    handleEliminarInventario,
    handleOpenPlanificar, handleEliminarPlanificado,
    handlePlanificarChange, handleSubmitPlanificar,
    handleDocumentoPlanChange,
    // Compossed hooks
    ...instructor,
    ...insc,
    openAsistentes,
  };
}
