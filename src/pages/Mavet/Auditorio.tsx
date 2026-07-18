import { useState, useEffect, useMemo } from "react";
import CalendarGrid, { CalendarGridEvent } from "../../components/CalendarGrid";
import { 
  Plus, 
  List, 
  Grid, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Pencil, 
  Trash2,
  Download,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { Modal } from "../../components/ui/modal";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import { useModal } from "../../hooks/useModal";
import { mavetApi } from "../../services/api";
import { exportarHistorialEventos, exportarComprobanteReserva } from "../../services/pdf.service";
import { EventoAuditorio } from "../../types";
import { validateRequired } from "../../utils/validation";
import { formatCedula, normalizeCedula } from "../../utils/formatters";
import { useAuth, getUserRole } from "../../context/AuthContext";
import Salas from "./Salas";
import { generateNextCode } from "../../utils/codeGenerator";

const Auditorio: React.FC = () => {
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
  const [tipoEvento, setTipoEvento] = useState("Conferencia");
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
  
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const { isOpen, openModal, closeModal } = useModal();

  const isFormValid = useMemo(() => {
    const tipoOk = tipoEvento === "other" ? customTipoEvento.trim() !== "" : tipoEvento !== "";
    return (
      eventTitle.trim() !== "" &&
      tipoOk &&
      eventDate !== "" &&
      cedulaOrganizador.trim() !== "" &&
      organizador.trim() !== "" &&
      correoElectronico.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoElectronico) &&
      horaInicio !== "" &&
      horaFin !== "" &&
      horaInicio < horaFin &&
      Object.values(fieldErrors).every(e => !e)
    );
  }, [eventTitle, tipoEvento, customTipoEvento, eventDate, cedulaOrganizador, organizador, correoElectronico, horaInicio, horaFin, fieldErrors]);
  
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
  };

  useEffect(() => {
    loadEventos();
    loadEspacios();
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
      const matchAprobacion = filterAprobacion === "todas" || ev.extendedProps.estatus_aprobacion === filterAprobacion;
      const matchSearch = searchTerm === "" || 
        ev.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (ev.extendedProps.organizador || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.extendedProps.numero_expediente || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchTipo && matchAprobacion && matchSearch;
    }).sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
  }, [events, filterTipo, filterAprobacion, searchTerm]);

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
        if (p.cedula) {
          setCedulaOrganizador(p.cedula);
        }
      } else {
        setOrganizador("");
        setOrganizadorAuto(false);
        setOrganizadorError("Persona no encontrada. Debe registrar su ingreso como visitante primero.");
      }
    } catch {
      setOrganizadorError("Error al buscar la cédula. Intente de nuevo.");
      setOrganizadorAuto(false);
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

  const handleEventClick = (event: CalendarGridEvent) => {
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
    setCodigoReserva((event as any).codigo_reserva || event.id || "");
    setEventTitle(event.title);
    setEventDate(event.start?.split("T")[0] || "");
    setHoraInicio((event.start?.split("T")[1]?.substring(0, 5)) || "08:00");
    setHoraFin((event.end?.split("T")[1]?.substring(0, 5)) || "18:00");
    setOrganizador(event.extendedProps?.organizador || "");
    setCedulaOrganizador(event.extendedProps?.cedula || "");
    setTipoEvento(event.extendedProps?.tipoEvento || "Conferencia");
    setCorreoElectronico((event.extendedProps as any)?.correo_electronico || "");
    setRecursosSolicitados((event.extendedProps as any)?.recursos_solicitados || []);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const evDate = new Date((event.start?.split("T")[0] || "") + "T00:00:00");
    setIsPastEvent(evDate < today || event.extendedProps?.estado === 'Realizada');
    setIsDateLocked(true); 
    openModal();
  };
  
  const handleEditFromList = (ev: EventoAuditorio) => {
    setSelectedEvent(ev);
    setEventTitle(ev.title);
    setCodigoReserva(ev.codigo_reserva || "");
    setEventDate(ev.start?.split("T")[0] || "");
    setHoraInicio((ev.start?.split("T")[1]?.substring(0, 5)) || "08:00");
    setHoraFin((ev.end?.split("T")[1]?.substring(0, 5)) || "18:00");
    setOrganizador(ev.extendedProps.organizador || "");
    setCedulaOrganizador(ev.extendedProps?.cedula || ""); 
    setTipoEvento(ev.extendedProps.tipoEvento || "Conferencia");
    setCorreoElectronico(ev.extendedProps?.correo_electronico || "");
    setRecursosSolicitados(ev.extendedProps?.recursos_solicitados || []);
    
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

    const tipoError = validateRequired(tipoEvento, "El tipo de evento");
    if (tipoError) { setFormError(tipoError); return; }

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

    if (!cedulaOrganizador || !organizador) {
      setFormError("Debe buscar y seleccionar un organizador válido.");
      return;
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
      const tipoFinal = tipoEvento === "other" ? customTipoEvento.trim() : tipoEvento;
      const espacioId = espacios.length > 0 ? espacios[0].id_espacio : 1;
      const payload = {
        codigo_reserva: codigoReserva,
        id_espacio: espacioId,
        cedula: normalizeCedula(cedulaOrganizador),
        nombre_responsable: organizador,
        institucion: tipoFinal,
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
            tipoEvento: tipoFinal,
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
    setTipoEvento("Conferencia");
    setCustomTipoEvento("");
    
    const nextCode = generateNextCode(
      events.map(e => e.codigo_reserva),
      "RES",
      5
    );
    setCodigoReserva(nextCode);
    
    setSelectedEvent(null);
    setFormError("");
    setFieldErrors({});
    setIsPastEvent(false);
    setIsDateLocked(false);
    setCorreoElectronico("");
    setRecursosSolicitados([]);
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

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Auditorio y Espacios
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestión de agenda del auditorio e inventario de espacios del museo.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </span>
              <input
                data-tour="buscador-eventos"
                type="text"
                placeholder="Buscar evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-48 sm:w-64 rounded-xl border border-gray-200 bg-white text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <select
              data-tour="filtro-tipo"
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="py-2 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="Todos">Todos los tipos</option>
              <option value="Conferencia">Conferencia</option>
              <option value="Reunión">Reunión Interna</option>
            </select>
            <select
              value={filterAprobacion}
              onChange={(e) => setFilterAprobacion(e.target.value)}
              className="py-2 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="todas">Todas las aprobaciones</option>
              <option value="pendiente">Pendiente de aprobación</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>

          <button 
            data-tour="exportar-pdf"
            onClick={() => {
              if (events.length === 0) return;
              exportarHistorialEventos(events);
            }}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 font-medium py-2 px-4 rounded-xl shadow-theme-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            <Download className="h-4 w-4 text-red-500" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>
          
          <div className="flex rounded-xl bg-white p-1 border border-gray-200 dark:border-gray-800 dark:bg-gray-900 shadow-theme-xs">
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                viewMode === "calendar"
                  ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Grid className="h-4 w-4" />
              <span className="hidden sm:inline">Mes</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>
          
          {!isGerente && (
            <button
              data-tour="nueva-reserva"
              onClick={() => {
                resetModalFields();
                const nextCode = generateNextCode(
                  events.map(e => e.codigo_reserva),
                  "RES",
                  5
                );
                setCodigoReserva(nextCode);
                openModal();
              }}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva Reserva</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {viewMode === "calendar" && (
          <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-theme-xs text-sm w-full">
            <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Leyenda:</span>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-500"></div><span className="text-gray-600 dark:text-gray-400">Conferencia</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-gray-600 dark:text-gray-400">Taller</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span className="text-gray-600 dark:text-gray-400">Reunión</span></div>
          </div>
        )}

        {viewMode === "calendar" ? (
          <div className={saving ? 'opacity-50 pointer-events-none transition-opacity' : ''}>
            <CalendarGrid
              events={filteredEvents}
              onDateSelect={handleDateSelect}
              onEventClick={handleEventClick}
              getEventColor={getCalendarColor}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div>
            {isLoading ? (
              <LoadingSkeleton variant="table" rows={8} cols={6} />
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-sm">
                <CalendarIcon className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Sin Reservas</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">No hay reservas que coincidan con la búsqueda.</p>
                <button onClick={() => {
                  resetModalFields();
                  const nextCode = generateNextCode(
                    events.map(e => e.codigo_reserva),
                    "RES",
                    5
                  );
                  setCodigoReserva(nextCode);
                  openModal();
                }} className="mt-4 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-all">
                  Crear primera reserva
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredEvents.map(ev => {
                  const d = new Date((ev.start?.split("T")[0] || "") + "T00:00:00");
                  const t = new Date(); t.setHours(0, 0, 0, 0);
                  const evIsPast = d < t || ev.extendedProps?.estado === 'Realizada';
                  return (
                    <div key={ev.id} className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-sm hover:shadow-theme-md transition-all duration-200 flex flex-col">
                      <div className="flex items-start justify-between px-4 pt-3.5 pb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getColorClass(ev.extendedProps.tipoEvento || "Conferencia")}`}>
                          {ev.extendedProps.tipoEvento || "Conferencia"}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                          evIsPast
                            ? 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                            : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50'
                        }`}>
                          {evIsPast ? 'Realizada' : 'Pendiente'}
                        </span>
                      </div>

                      <div className="px-4 py-1.5">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 leading-snug line-clamp-2">
                          {ev.title}
                        </h4>
                      </div>

                      <div className="px-4 pb-2 space-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <span>👤</span>
                          <span className="truncate">{ev.extendedProps?.organizador || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>📅</span>
                          <span>{formatDateForList(ev.start)}</span>
                          <span className="mx-1">·</span>
                          <span>⏰</span>
                          <span>{getTimeFromISO(ev.start)} - {getTimeFromISO(ev.end)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-brand-600 dark:text-brand-400">
                          <span>📁</span>
                          <span className="truncate">{ev.extendedProps?.numero_expediente || "—"}</span>
                        </div>
                      </div>

                      <div className="mt-auto px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1 flex-wrap">
                        <button
                          onClick={async () => {
                            const { exportarComprobanteReserva } = await import("../../services/pdf.service");
                            exportarComprobanteReserva(ev);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors"
                          title="Descargar comprobante"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Comprobante
                        </button>
                        <button
                          onClick={() => handleVerAsistentes(ev)}
                          className="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                          title="Ver asistentes"
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                        </button>
                        {!isGerente && (
                          <button
                            onClick={() => !evIsPast && handleEditFromList(ev)}
                            disabled={evIsPast}
                            className={`p-1.5 rounded-lg transition-colors ml-auto ${evIsPast ? 'text-gray-300 cursor-not-allowed opacity-50 dark:text-gray-600' : 'text-gray-400 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            title={evIsPast ? "No se puede editar evento histórico" : "Editar"}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8">
        <Salas />
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-2xl w-full mx-4">
        { (isGerente || isPastEvent) && selectedEvent ? (
          <div className="p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-6 pr-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white drop-shadow-sm font-serif">
                  {eventTitle || 'Reserva de Espacio'}
                </h2>
                <p className="text-brand-500 dark:text-brand-400 font-semibold text-xs mt-1">
                  • {organizador || 'Sin organizador'} {cedulaOrganizador ? `(${cedulaOrganizador})` : ''}
                </p>
              </div>
              <button 
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Cerrar"
              >
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm my-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-xl">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Estado de la Reserva</span>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Condición Actual</span>
                </div>
              </div>
              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                selectedEvent.extendedProps?.estado === 'Realizada' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/40' :
                'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800/40'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                {selectedEvent.extendedProps?.estado || 'Pendiente'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Código de Reserva</span>
                  <span className="text-xs font-semibold text-gray-850 dark:text-gray-200">{codigoReserva || '—'}</span>
                </div>
              </div>
              {selectedEvent?.numero_expediente && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">N° Expediente</span>
                    <span className="text-xs font-semibold font-mono text-brand-600 dark:text-brand-400">{selectedEvent.numero_expediente}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Fecha del Evento</span>
                  <span className="text-xs font-semibold text-gray-850 dark:text-gray-200">{eventDate || '—'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Horario</span>
                  <span className="text-xs font-semibold text-gray-850 dark:text-gray-200">{horaInicio} - {horaFin}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Espacio</span>
                  <span className="text-xs font-semibold text-gray-850 dark:text-gray-200">{espacios.length > 0 ? espacios[0].nombre_espacio : '—'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tipo de Evento</span>
                  <span className="text-xs font-semibold text-gray-850 dark:text-gray-200">{tipoEvento || '—'}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={async () => {
                  if (!selectedEvent) return;
                  const { exportarComprobanteReserva } = await import("../../services/pdf.service");
                  exportarComprobanteReserva(selectedEvent);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Comprobante
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors shadow-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
          <div className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-4 pr-8">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
              {selectedEvent ? (isPastEvent ? "Ver Reserva (Solo Lectura)" : "Editar Reserva de Auditorio") : "Nueva Reserva de Auditorio"}
            </h3>
            {selectedEvent && (
              <div className="mt-2 flex">
                <span className={`px-3 py-1 inline-flex rounded-full text-xs font-bold border ${
                  selectedEvent.extendedProps?.estado === 'Realizada' 
                    ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50' 
                    : 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50'
                }`}>
                  {selectedEvent.extendedProps?.estado || 'Pendiente'}
                </span>
              </div>
            )}
          </div>
          {isPastEvent && (
            <div className="mb-4 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 p-3 rounded-lg border border-amber-200 dark:border-amber-900/30 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>Esta reserva corresponde a una fecha pasada y no puede ser modificada. Solo se permite su visualización.</span>
            </div>
          )}
          
          <form onSubmit={handleAddOrUpdateEvent} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Código de Reserva</label>
                <input
                  type="text"
                  value={codigoReserva}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm font-mono text-gray-500 focus:outline-none cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Motivo / Título de la Reserva *</label>
                <input
                  required
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  disabled={isGerente || isPastEvent}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 disabled:opacity-50"
                  placeholder="Ej. Conferencia de Historia del Arte"
                />
              </div>

              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Fecha del Evento</label>
                <input
                  required
                  type="date"
                  min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0]}
                  max={maxDateStr}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  disabled={isGerente || isPastEvent || isDateLocked}
                  className="show-date-picker w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {fieldErrors.eventDate && (
                  <div className="flex items-start gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2.5 rounded-lg border border-red-200 dark:border-red-900/30">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-medium">{fieldErrors.eventDate}</p>
                  </div>
                )}
              </div>

              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Tipo de Evento</label>
                {tipoEvento === "other" ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={customTipoEvento}
                      onChange={(e) => setCustomTipoEvento(e.target.value)}
                      placeholder="Especifique el tipo de evento..."
                      disabled={isGerente || isPastEvent}
                      className="w-full rounded-lg border border-brand-500 dark:border-brand-400 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => { setTipoEvento("Conferencia"); setCustomTipoEvento(""); }}
                      className="text-[11px] text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
                    >
                      &larr; Volver a seleccionar tipo
                    </button>
                  </div>
                ) : (
                  <select
                    required
                    value={tipoEvento}
                    onChange={(e) => setTipoEvento(e.target.value)}
                    disabled={isGerente || isPastEvent}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 disabled:opacity-50"
                  >
                    <option value="Conferencia">Conferencia</option>
                    <option value="Reunión">Reunión Interna</option>
                    <option value="other">Otros (especificar)...</option>
                  </select>
                )}
              </div>

              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Hora Inicio</label>
                <input
                  required
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  disabled={isGerente || isPastEvent}
                  min="09:00"
                  max="16:00"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 [color-scheme:light] dark:[color-scheme:dark] disabled:opacity-50"
                />
                {fieldErrors.horaInicio && (
                  <div className="flex items-start gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2.5 rounded-lg border border-red-200 dark:border-red-900/30">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-medium">{fieldErrors.horaInicio}</p>
                  </div>
                )}
              </div>

              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Hora Fin</label>
                <input
                  required
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  disabled={isGerente || isPastEvent}
                  min="09:00"
                  max="16:00"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 [color-scheme:light] dark:[color-scheme:dark] disabled:opacity-50"
                />
                {fieldErrors.horaFin && (
                  <div className="flex items-start gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2.5 rounded-lg border border-red-200 dark:border-red-900/30">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-medium">{fieldErrors.horaFin}</p>
                  </div>
                )}
              </div>

              <div className="col-span-2 border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Recursos Solicitados</h4>
                <div className="flex flex-wrap gap-3">
                  {["Sillas", "Mesas", "Cortinas", "Sonido", "Proyector", "Micrófono"].map((recurso) => (
                    <label key={recurso} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={recursosSolicitados.includes(recurso)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRecursosSolicitados([...recursosSolicitados, recurso]);
                          } else {
                            setRecursosSolicitados(recursosSolicitados.filter(r => r !== recurso));
                          }
                        }}
                        disabled={isGerente || isPastEvent}
                        className="accent-brand-600 w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{recurso}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="col-span-2 border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Datos del Organizador</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Cédula del Organizador</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cedulaOrganizador}
                        onChange={(e) => {
                          setCedulaOrganizador(formatCedula(e.target.value));
                          if (organizadorAuto) {
                            setOrganizador("");
                            setOrganizadorAuto(false);
                          }
                          setOrganizadorError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCedulaBlur();
                          }
                        }}
                        disabled={isGerente || isPastEvent}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 disabled:opacity-50"
                        placeholder="Ej. 31.619.791"
                      />
                      <button
                        type="button"
                        onClick={handleCedulaBlur}
                        disabled={isGerente || organizadorLoading || !cedulaOrganizador || isPastEvent}
                        className="bg-brand-500 hover:bg-brand-600 text-white px-4 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Search className="w-5 h-5" />
                        <span className="hidden sm:inline">Buscar</span>
                      </button>
                    </div>
                    {organizadorLoading && (
                      <p className="text-sm text-brand-600 font-medium flex items-center gap-2 mt-2">
                        <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span> 
                        Buscando persona en la base de datos...
                      </p>
                    )}
                    {organizadorError && (
                      <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 p-3 rounded-lg mt-2 border border-red-100 dark:border-red-900/30">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{organizadorError}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Nombre Completo</label>
                    <input
                      required
                      type="text"
                      value={organizador}
                      onChange={(e) => {
                        setOrganizador(e.target.value);
                        setOrganizadorAuto(false);
                      }}
                      readOnly={organizadorAuto}
                      disabled={isGerente || isPastEvent}
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-500 disabled:opacity-60"
                      placeholder="Se autocompleta con cédula"
                    />
                  </div>

                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Correo Electrónico *</label>
                    <input
                      required
                      type="email"
                      value={correoElectronico}
                      onChange={(e) => setCorreoElectronico(e.target.value)}
                      disabled={isGerente || isPastEvent}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 disabled:opacity-50"
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {formError && !isPastEvent && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-xl border border-red-200 dark:border-red-900/30">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{formError}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
              {isGerente ? (
                <div className="flex items-center justify-end w-full">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    {selectedEvent && (
                      <button 
                        onClick={handleDeleteEvent}
                        disabled={isPastEvent}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                          isPastEvent 
                            ? 'text-gray-400 bg-gray-100 border-transparent cursor-not-allowed opacity-60 dark:bg-gray-800 dark:text-gray-500' 
                            : 'text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 dark:border-red-900/50 dark:hover:bg-red-600'
                        }`}
                        title={isPastEvent ? "No se puede eliminar evento histórico" : "Eliminar evento"}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Eliminar</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedEvent && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!selectedEvent) return;
                          const { exportarComprobanteReserva } = await import("../../services/pdf.service");
                          exportarComprobanteReserva(selectedEvent);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Descargar PDF</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !isFormValid || isPastEvent || !!formError}
                      title={isPastEvent ? "No se puede editar evento histórico" : ""}
                      className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "Guardando..." : selectedEvent ? "Actualizar Reserva" : "Guardar Reserva"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </form>
          </div>
        )}
      </Modal>

      <Modal isOpen={isOpenAsistentes} onClose={closeAsistentesModal} className="max-w-4xl" showCloseButton={false}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Asistentes Check-In</h3>
            <div className="flex items-center gap-3 shrink-0">
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full dark:bg-amber-900/30 dark:text-amber-400">
                Total: {eventoAsistentes.length} {eventoAsistentes.length === 1 ? 'persona' : 'personas'}
              </span>
              <button onClick={closeAsistentesModal} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            Visitantes confirmados en recepción o por QR para el evento: <span className="font-semibold text-brand-600 dark:text-brand-400">{selectedEvent?.title || ""}</span>
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
                {eventoAsistentes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-gray-500">
                      Nadie se ha registrado en puerta para este evento.
                    </td>
                  </tr>
                ) : (
                  eventoAsistentes.map((a, idx) => (
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
};

export default Auditorio;
