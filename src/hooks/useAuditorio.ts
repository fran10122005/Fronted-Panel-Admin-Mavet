import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useModal } from "./useModal";
import { mavetApi } from "../services/api";
import { exportarHistorialEventos, exportarComprobanteReserva } from "../services/pdf.service";
import { EventoAuditorio } from "../types";
import { validateRequired } from "../utils/validation";
import { normalizeCedula } from "../utils/formatters";
import { useAuth, getUserRole } from "../context/AuthContext";
import { generateNextCode } from "../utils/codeGenerator";

export default function useAuditorio() {
  const { user } = useAuth();
  const userRole = getUserRole(user);
  const isGerente = userRole === "Gerente";
  const canApprove = userRole === "Administrador" || userRole === "admin" || userRole === "Coordinador" || userRole === "Gerente";

  const [selectedEvent, setSelectedEvent] = useState<EventoAuditorio | null>(null);
  const [isPastEvent, setIsPastEvent] = useState(false);
  const [isDateLocked, setIsDateLocked] = useState(false);

  const [codigoReserva, setCodigoReserva] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("16:00");
  const [organizador, setOrganizador] = useState("");
  const [cedulaOrganizador, setCedulaOrganizador] = useState("");
  const [organizadorLoading, setOrganizadorLoading] = useState(false);
  const [organizadorError, setOrganizadorError] = useState("");
  const [organizadorAuto, setOrganizadorAuto] = useState(false);
  const [organizadorNombres, setOrganizadorNombres] = useState("");
  const [organizadorApellidos, setOrganizadorApellidos] = useState("");
  const [organizadorTelefono, setOrganizadorTelefono] = useState("");
  const [organizadorFechaNac, setOrganizadorFechaNac] = useState("");
  const [showNuevaPersonaFields, setShowNuevaPersonaFields] = useState(false);
  const [motivosList, setMotivosList] = useState<any[]>([]);
  const [tiposEventoList, setTiposEventoList] = useState<any[]>([]);
  const [tipoEvento, setTipoEvento] = useState("");
  const [customTipoEvento, setCustomTipoEvento] = useState("");
  const [correoElectronico, setCorreoElectronico] = useState("");
  const [recursosSolicitados, setRecursosSolicitados] = useState<string[]>([]);
  const [events, setEvents] = useState<EventoAuditorio[]>([]);
  const [espacios, setEspacios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const maxDateStr = useMemo(() => {
    const today = new Date();
    const d = new Date(today.getFullYear(), today.getMonth() + 2, 1);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const targetDay = Math.min(today.getDate(), lastDay);
    const maxDate = new Date(d.getFullYear(), d.getMonth(), targetDay);
    const offset = maxDate.getTimezoneOffset();
    return new Date(maxDate.getTime() - offset * 60000).toISOString().split("T")[0];
  }, []);

  const [filterTipo, setFilterTipo] = useState("Todos");
  const [filterAprobacion, setFilterAprobacion] = useState("todas");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const { isOpen, openModal, closeModal } = useModal();

  const isFormValid = useMemo(() => {
    const tipoOk = tipoEvento === "other" ? customTipoEvento.trim() !== "" : tipoEvento !== "";
    const organizadorOk = showNuevaPersonaFields
      ? (organizadorNombres.trim() !== "" && organizadorApellidos.trim() !== "")
      : (organizador.trim() !== "");
    return (
      eventTitle.trim() !== "" &&
      tipoOk &&
      eventDate !== "" &&
      cedulaOrganizador.trim() !== "" &&
      organizadorOk &&
      correoElectronico.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoElectronico) &&
      horaInicio !== "" &&
      horaFin !== "" &&
      horaInicio < horaFin &&
      Object.values(fieldErrors).every(e => !e)
    );
  }, [eventTitle, tipoEvento, customTipoEvento, eventDate, cedulaOrganizador, organizador, organizadorNombres, organizadorApellidos, showNuevaPersonaFields, correoElectronico, horaInicio, horaFin, fieldErrors]);

  const [eventoAsistentes, setEventoAsistentes] = useState<any[]>([]);
  const { isOpen: isOpenAsistentes, openModal: openAsistentesModal, closeModal: closeAsistentesModal } = useModal();

  const [confirm, setConfirm] = useState<{ open: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; variant?: "danger" | "warning" | "info" }>({
    open: false, title: "", message: "", onConfirm: () => {}, variant: "danger",
  });

  const loadEventos = async () => {
    try {
      const data = await mavetApi.getEventos();
      setEvents(data);
    } catch (error) {
      console.error("Error al cargar eventos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEspacios = async () => {
    const data = await mavetApi.getEspaciosMuseo();
    setEspacios(data);
    try {
      const mots = await mavetApi.obtenerMotivos();
      setMotivosList(mots);
    } catch (error) {
      console.error("Error al cargar motivos:", error);
    }
  };

  const resetModalFields = () => {
    setCodigoReserva("");
    setEventTitle("");
    setEventDate("");
    setHoraInicio("09:00");
    setHoraFin("16:00");
    setOrganizador("");
    setCedulaOrganizador("");
    setOrganizadorLoading(false);
    setOrganizadorError("");
    setOrganizadorAuto(false);
    setOrganizadorNombres("");
    setOrganizadorApellidos("");
    setOrganizadorTelefono("");
    setOrganizadorFechaNac("");
    setShowNuevaPersonaFields(false);
    setTipoEvento(tiposEventoList.length > 0 ? tiposEventoList[0].id_tipo_evento : "");
    setCustomTipoEvento("");
    const nextCode = generateNextCode(events.map(e => e.codigo_reserva), "RES", 5);
    setCodigoReserva(nextCode);
    setSelectedEvent(null);
    setFormError("");
    setFieldErrors({});
    setIsPastEvent(false);
    setIsDateLocked(false);
    setCorreoElectronico("");
    setRecursosSolicitados([]);
  };

  const loadTiposEvento = async () => {
    try {
      const data = await mavetApi.getTiposEvento();
      setTiposEventoList(data);
      if (data.length > 0 && !tipoEvento) {
        setTipoEvento(data[0].id_tipo_evento);
      }
    } catch (error) {
      console.error("Error al cargar tipos de evento:", error);
    }
  };

  useEffect(() => {
    loadEventos();
    loadEspacios();
    loadTiposEvento();
  }, []);

  useEffect(() => {
    if (!isOpen || !eventDate || !horaInicio || !horaFin) return;
    if (horaInicio >= horaFin) return;

    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localTodayStr = new Date(today.getTime() - tzOffset).toISOString().split("T")[0];

    const yearParts = eventDate.split("-");
    const year = yearParts.length > 0 ? parseInt(yearParts[0]) : 0;
    if (yearParts.length !== 3 || year < 2000 || year > 2100) {
      setFormError("El formato de la fecha debe ser DD/MM/AAAA con un año válido.");
      return;
    }

    if (eventDate < localTodayStr) {
      setFormError("El valor debe ser igual o posterior a la fecha actual.");
      return;
    }

    const isToday = eventDate === localTodayStr;

    if (isToday) {
      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();
      const [startH, startM] = horaInicio.split(":").map(Number);

      if (startH < currentHour || (startH === currentHour && startM < currentMinute)) {
        setFormError("No se pueden reservar horarios que ya han pasado en el día de hoy. Por favor, selecciona una hora futura.");
        return;
      }
    }

    let overlappingEventStart = "";
    let overlappingEventEnd = "";

    const isOverlapping = events.some(ev => {
      if (selectedEvent && ev.id === selectedEvent.id) return false;
      const startParts = ev.start?.split("T") || [];
      const evDate = startParts[0];

      if (evDate !== eventDate) return false;

      const evStart = startParts[startParts.length - 1]?.substring(0, 5);
      const endParts = ev.end?.split("T") || [];
      const evEnd = endParts[endParts.length - 1]?.substring(0, 5);

      if (evStart && evEnd) {
         if (horaInicio < evEnd && horaFin > evStart) {
             overlappingEventStart = evStart;
             overlappingEventEnd = evEnd;
             return true;
         }
      }
      return false;
    });

    if (isOverlapping) {
      const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        const [hoursStr, minutes] = timeStr.split(':');
        let hours = parseInt(hoursStr, 10);
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12 || 12;
        return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
      };

      const startFmt = formatTime(overlappingEventStart);
      const endFmt = formatTime(overlappingEventEnd);
      setFormError(`El Horario de ${startFmt} a ${endFmt} no esta disponible, Por favor, elige otra hora para tu reserva.`);
    } else {
      setFormError((prev) =>
        prev.includes("no esta disponible") ||
        prev.includes("ya han pasado en el d") ||
        prev.includes("posterior a la fecha actual") ||
        prev.includes("formato de la fecha debe ser")
        ? "" : prev
      );
    }
  }, [eventDate, horaInicio, horaFin, events, selectedEvent, isOpen]);

  useEffect(() => {
    const errors: Record<string, string> = {};

    if (eventDate) {
      const selectedDate = new Date(eventDate + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.eventDate = "La fecha debe ser igual o posterior a la fecha actual.";
      } else {
        const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, 1);
        const lastDay = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0).getDate();
        maxDate.setDate(Math.min(today.getDate(), lastDay));
        if (selectedDate > maxDate) {
          errors.eventDate = "La fecha no puede superar los 2 meses desde el día actual.";
        }
      }
    }

    if (horaInicio) {
      const [h, m] = horaInicio.split(":").map(Number);
      if (h < 9 || h > 16 || (h === 16 && m > 0)) {
        errors.horaInicio = "La hora de inicio debe estar entre las 09:00 AM y las 04:00 PM.";
      }
    }

    if (horaFin) {
      const [h, m] = horaFin.split(":").map(Number);
      if (h < 9 || h > 16 || (h === 16 && m > 0)) {
        errors.horaFin = "La hora de fin debe estar entre las 09:00 AM y las 04:00 PM.";
      } else if (horaInicio && horaFin) {
        const [hI, mI] = horaInicio.split(":").map(Number);
        const [hF, mF] = horaFin.split(":").map(Number);
        if (hF * 60 + mF <= hI * 60 + mI) {
          errors.horaFin = "La hora de fin debe ser posterior a la hora de inicio.";
        }
      }
    }

    setFieldErrors(errors);
  }, [eventDate, horaInicio, horaFin]);

  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const matchTipo = filterTipo === "Todos" || ev.extendedProps.tipoEvento === filterTipo;
      const matchAprobacion = filterAprobacion === "todas" || ev.extendedProps.estado === filterAprobacion;
      const matchSearch = searchTerm === "" ||
        ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.extendedProps.organizador || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.extendedProps.numero_expediente || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchTipo && matchAprobacion && matchSearch;
    }).sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
  }, [events, filterTipo, filterAprobacion, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterTipo, filterAprobacion, searchTerm]);

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);

  const handleCedulaBlur = async () => {
    const cedula = cedulaOrganizador.trim();
    if (!cedula) {
      setOrganizadorError("");
      setOrganizadorAuto(false);
      return;
    }
    setOrganizadorLoading(true);
    setOrganizadorError("");
    try {
      let result = await mavetApi.checkVisitante(cedula);

      if (!result.existe) {
        const cleanDigits = cedula.replace(/\D/g, "");
        const vDotted = `V-${cedula}`;
        const cleanVal = cleanDigits;
        const vClean = `V-${cleanDigits}`;

        const formatsToTry = [vDotted, cleanVal, vClean];

        for (const fmt of formatsToTry) {
          if (fmt && fmt !== cedula) {
            try {
              const res = await mavetApi.checkVisitante(fmt);
              if (res.existe && res.visitante) {
                result = res;
                break;
              }
            } catch {
            }
          }
        }
      }

      if (result.existe && result.visitante) {
        const p = result.visitante;
        const nombreCompleto = [p.nombres, p.apellidos].filter(Boolean).join(" ");
        setOrganizador(nombreCompleto);
        setOrganizadorAuto(true);
        setOrganizadorError("");
        setShowNuevaPersonaFields(false);
        if (p.cedula) {
          setCedulaOrganizador(p.cedula);
        }
      } else {
        setOrganizador("");
        setOrganizadorAuto(false);
        setShowNuevaPersonaFields(true);
        setOrganizadorNombres("");
        setOrganizadorApellidos("");
        setOrganizadorTelefono("");
        setOrganizadorFechaNac("");
        setOrganizadorError("");
      }
    } catch {
      setOrganizadorError("Error al buscar la cédula. Intente de nuevo.");
      setOrganizadorAuto(false);
      setShowNuevaPersonaFields(false);
    } finally {
      setOrganizadorLoading(false);
    }
  };

  const handleDateSelect = (dateStr: string) => {
    if (isGerente) return;

    const selectedDate = new Date(`${dateStr}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.warning("No se puede crear una nueva reserva en fechas pasadas.");
      return;
    }

    const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, 1);
    const lastDay = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0).getDate();
    maxDate.setDate(Math.min(today.getDate(), lastDay));
    if (selectedDate > maxDate) {
      toast.warning("Las reservas solo están permitidas hasta 2 meses desde la fecha actual.");
      return;
    }

    resetModalFields();

    const nextCode = generateNextCode(
      events.map(e => e.codigo_reserva),
      "RES",
      5
    );
    setCodigoReserva(nextCode);

    setEventDate(dateStr);
    setHoraInicio("09:00");
    setHoraFin("16:00");
    setIsPastEvent(false);
    setIsDateLocked(true);
    openModal();
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay ?? false,
      codigo_reserva: (event as any).codigo_reserva || "",
      numero_expediente: (event as any).numero_expediente || "",
      extendedProps: {
        organizador: event.extendedProps?.organizador || "",
        tipoEvento: event.extendedProps?.tipoEvento || "",
        cedula: event.extendedProps?.cedula,
        estado: event.extendedProps?.estado || "Pendiente",
        estatus_aprobacion: (event.extendedProps as any)?.estatus_aprobacion || "pendiente",
        numero_expediente: (event.extendedProps as any)?.numero_expediente || "",
        motivo_rechazo: (event.extendedProps as any)?.motivo_rechazo || "",
        aprobado_por_nombre: (event.extendedProps as any)?.aprobado_por_nombre || "",
        correo_electronico: (event.extendedProps as any)?.correo_electronico || "",
        recursos_solicitados: (event.extendedProps as any)?.recursos_solicitados || [],
      }
    });
    populateFormFromEvent(event);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const evDate = new Date((event.start?.split("T")[0] || "") + "T00:00:00");
    setIsPastEvent(evDate < today || event.extendedProps?.estado === 'Realizada');
    setIsDateLocked(true);
    openModal();
  };

  const populateFormFromEvent = (event: any) => {
    setCodigoReserva((event as any).codigo_reserva || event.id || "");
    setEventTitle(event.title);
    setEventDate(event.start?.split("T")[0] || "");
    setHoraInicio((event.start?.split("T")[1]?.substring(0, 5)) || "08:00");
    setHoraFin((event.end?.split("T")[1]?.substring(0, 5)) || "18:00");
    setOrganizador(event.extendedProps?.organizador || "");
    setCedulaOrganizador(event.extendedProps?.cedula || "");
    const tipoGuardado = event.extendedProps?.tipoEvento || "Conferencia";
    if (tipoGuardado !== "Conferencia" && tipoGuardado !== "Reunión") {
      setTipoEvento("other");
      setCustomTipoEvento(tipoGuardado);
    } else {
      setTipoEvento(tipoGuardado);
      setCustomTipoEvento("");
    }
    setCorreoElectronico((event.extendedProps as any)?.correo_electronico || "");
    setRecursosSolicitados((event.extendedProps as any)?.recursos_solicitados || []);
  };

  const handleEditFromList = (ev: EventoAuditorio) => {
    setSelectedEvent(ev);
    populateFormFromEvent(ev);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const evDate = new Date((ev.start?.split("T")[0] || "") + "T00:00:00");
    setIsPastEvent(evDate < today || ev.extendedProps?.estado === 'Realizada');
    openModal();
  };

  const handleVerAsistentes = async (ev: EventoAuditorio) => {
    setSelectedEvent(ev);
    try {
      const idSolicitud = ev.id;
      const result = await mavetApi.getTodosIngresos(1, 500, undefined, idSolicitud);
      setEventoAsistentes(result.data);
    } catch {
      setEventoAsistentes([]);
    }
    openAsistentesModal();
  };

  const handleAddOrUpdateEvent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError("");

    const titleError = validateRequired(eventTitle, "El título de la reserva");
    if (titleError) { setFormError(titleError); return; }

    if (tipoEvento === "other" && !customTipoEvento.trim()) {
      setFormError("Especifica el tipo de evento personalizado");
      return;
    }
    if (tipoEvento !== "other") {
      const tipoError = validateRequired(tipoEvento, "El tipo de evento");
      if (tipoError) { setFormError(tipoError); return; }
    }

    if (!eventDate) {
      setFormError("La fecha del evento es obligatoria.");
      return;
    }
    const selectedDate = new Date(eventDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setFormError("La fecha del evento debe ser hoy o una fecha futura.");
      return;
    }

    if (selectedDate.getTime() === today.getTime()) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const [startHour, startMinute] = horaInicio.split(":").map(Number);

      if (startHour < currentHour || (startHour === currentHour && startMinute < currentMinute)) {
        setFormError("No puedes hacer reservas en horas que ya han pasado el día de hoy.");
        return;
      }
    }

    const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, 1);
    const lastDay = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0).getDate();
    maxDate.setDate(Math.min(today.getDate(), lastDay));
    if (selectedDate > maxDate) {
      setFormError("Las reservas solo están permitidas hasta 2 meses desde la fecha actual.");
      return;
    }

    if (showNuevaPersonaFields) {
      if (!organizadorNombres.trim() || !organizadorApellidos.trim()) {
        setFormError("El nombre y apellido del organizador son obligatorios.");
        return;
      }
    } else {
      if (!cedulaOrganizador || !organizador) {
        setFormError("Debe buscar y seleccionar un organizador válido.");
        return;
      }
    }

    if (horaInicio >= horaFin) {
      setFormError("La hora de inicio debe ser anterior a la hora de finalización.");
      return;
    }

    if (horaInicio) {
      const [h, m] = horaInicio.split(':').map(Number);
      if (h < 9 || h > 16 || (h === 16 && m > 0)) {
        setFormError("La hora de inicio debe estar entre las 09:00 AM y las 04:00 PM.");
        return;
      }
    }
    if (horaFin) {
      const [h, m] = horaFin.split(':').map(Number);
      if (h < 9 || h > 16 || (h === 16 && m > 0)) {
        setFormError("La hora de fin debe estar entre las 09:00 AM y las 04:00 PM.");
        return;
      }
    }

    if (formError.includes("no esta disponible") || formError.includes("ya han pasado en el día de hoy")) {
      return;
    }

    try {
      setSaving(true);
      let nombreResponsableFinal = organizador;
      if (showNuevaPersonaFields) {
        const motivoEv = motivosList.find(
          (m: any) => m.nombre?.toLowerCase().includes("evento") || m.descripcion?.toLowerCase().includes("evento")
        ) || motivosList[0];
        const motivoId = motivoEv ? motivoEv.id_motivo : "MVI-00001";

        const regPayload = {
          cedula: normalizeCedula(cedulaOrganizador),
          nombres: organizadorNombres.trim(),
          apellidos: organizadorApellidos.trim(),
          telefono: organizadorTelefono.trim() || undefined,
          fecha_de_nac: organizadorFechaNac || undefined,
          id_motivo: motivoId,
          cantidad_acompanantes: 0,
          consentimiento_datos: true,
        };
        await mavetApi.registrarIngreso(regPayload);
        nombreResponsableFinal = `${organizadorNombres.trim()} ${organizadorApellidos.trim()}`;
      }

      const isCustomTipo = tipoEvento === "other";
      const tipoFinalId = isCustomTipo ? undefined : tipoEvento;
      const customTipoStr = isCustomTipo ? customTipoEvento.trim() : undefined;
      const tipoNombre = isCustomTipo ? customTipoStr : (tiposEventoList.find(t => t.id_tipo_evento === tipoEvento)?.nombre || "Evento");
      
      const espacioId = espacios.length > 0 ? espacios[0].id_espacio : 1;
      const payload = {
        codigo_reserva: codigoReserva,
        id_espacio: espacioId,
        cedula: normalizeCedula(cedulaOrganizador),
        nombre_responsable: nombreResponsableFinal,
        institucion: tipoNombre,
        id_tipo_evento: tipoFinalId,
        nuevo_tipo_evento: customTipoStr,
        fecha_uso: eventDate,
        hora_inicio: horaInicio + ":00",
        hora_fin: horaFin + ":00",
        motivo: eventTitle,
        correo_electronico: correoElectronico,
        recursos_solicitados: recursosSolicitados,
      };

      if (selectedEvent) {
        await mavetApi.actualizarReservaAuditorio(selectedEvent.id, payload);
        toast.success("Reserva actualizada exitosamente");
      } else {
        const response = await mavetApi.registrarReservaAuditorio(payload);
        toast.success("Reserva creada exitosamente");
        const evToExport = {
          id: response.data?.id || response.data?.data?.id_solicitud || "nuevo",
          title: eventTitle,
          start: `${eventDate}T${horaInicio}:00`,
          end: `${eventDate}T${horaFin}:00`,
          codigo_reserva: codigoReserva,
          extendedProps: {
            organizador: organizador,
            cedula: cedulaOrganizador,
            tipoEvento: tipoNombre,
            recursos_solicitados: recursosSolicitados,
            correo_electronico: correoElectronico,
            numero_expediente: response.data?.numero_expediente || "",
          }
        } as EventoAuditorio;
        exportarComprobanteReserva(evToExport);
      }

      const data = await mavetApi.getEventos();
      setEvents(data);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error al guardar la reserva";
      toast.error(msg);
    } finally {
      setSaving(false);
      closeModal();
      resetModalFields();
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    setConfirm({
      open: true,
      title: "Eliminar reserva",
      message: "¿Está seguro de eliminar esta reserva?",
      variant: "danger",
      confirmLabel: "Eliminar",
      onConfirm: async () => {
        setConfirm(prev => ({ ...prev, open: false }));
        try {
          setSaving(true);
          await mavetApi.eliminarReservaAuditorio(selectedEvent.id);
          setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
          closeModal();
          resetModalFields();
        } catch (error) {
          console.error("Error al eliminar reserva:", error);
          toast.error("Error al eliminar la reserva");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleNewReserva = () => {
    resetModalFields();
    const nextCode = generateNextCode(
      events.map(e => e.codigo_reserva),
      "RES",
      5
    );
    setCodigoReserva(nextCode);
    openModal();
  };

  const getColorClass = (tipo: string) => {
    switch(tipo) {
      case "Taller": return "bg-green-500 text-white border-green-600";
      case "Reunión": return "bg-orange-500 text-white border-orange-600";
      default: return "bg-brand-500 text-white border-brand-600";
    }
  };

  const colorMap: Record<string, string> = {
    Conferencia: "bg-brand-500",
    Taller: "bg-green-500",
    "Reunión": "bg-orange-500",
  };

  const getCalendarColor = (tipo: string) => colorMap[tipo] || "bg-purple-500";

  const tipoEventosDisponibles = useMemo(() => {
    const customSet = new Set<string>();
    events.forEach((ev) => {
      const t = ev.extendedProps?.tipoEvento;
      if (t && t !== "Conferencia" && t !== "Reunión") customSet.add(t);
    });
    return Array.from(customSet).sort();
  }, [events]);

  const formatDateForList = (dateString: string) => {
    if (!dateString) return "";
    const dateObj = new Date(dateString);
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  };

  const getTimeFromISO = (isoString: string) => {
    if (!isoString) return "";
    return isoString.split("T")[1]?.substring(0, 5) || "";
  };

  return {
    userRole, isGerente, canApprove,
    selectedEvent, setSelectedEvent,
    isPastEvent, setIsPastEvent,
    isDateLocked, setIsDateLocked,
    codigoReserva, setCodigoReserva,
    eventTitle, setEventTitle,
    eventDate, setEventDate,
    horaInicio, setHoraInicio,
    horaFin, setHoraFin,
    organizador, setOrganizador,
    cedulaOrganizador, setCedulaOrganizador,
    organizadorLoading,
    organizadorError, setOrganizadorError,
    organizadorAuto,
    organizadorNombres, setOrganizadorNombres,
    organizadorApellidos, setOrganizadorApellidos,
    organizadorTelefono, setOrganizadorTelefono,
    organizadorFechaNac, setOrganizadorFechaNac,
    showNuevaPersonaFields,
    motivosList,
    tiposEventoList,
    tipoEvento, setTipoEvento,
    customTipoEvento, setCustomTipoEvento,
    correoElectronico, setCorreoElectronico,
    recursosSolicitados, setRecursosSolicitados,
    events, setEvents,
    espacios,
    isLoading,
    saving,
    formError, setFormError,
    fieldErrors, setFieldErrors,
    maxDateStr,
    filterTipo, setFilterTipo,
    filterAprobacion, setFilterAprobacion,
    searchTerm, setSearchTerm,
    currentPage, setCurrentPage,
    ITEMS_PER_PAGE,
    viewMode, setViewMode,
    isOpen, openModal, closeModal,
    isFormValid,
    eventoAsistentes,
    isOpenAsistentes, openAsistentesModal, closeAsistentesModal,
    confirm, setConfirm,
    loadEventos, loadEspacios,
    filteredEvents,
    paginatedEvents,
    totalPages,
    handleCedulaBlur,
    handleDateSelect,
    handleEventClick,
    handleEditFromList,
    handleVerAsistentes,
    handleAddOrUpdateEvent,
    handleDeleteEvent,
    resetModalFields,
    handleNewReserva,
    getColorClass,
    getCalendarColor,
    formatDateForList,
    getTimeFromISO,
  };
}
