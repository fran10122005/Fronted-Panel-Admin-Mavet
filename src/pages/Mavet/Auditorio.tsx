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
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { Modal } from "../../components/ui/modal";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import { useModal } from "../../hooks/useModal";
import { mavetApi } from "../../services/api";
import { exportarHistorialEventos } from "../../services/pdf.service";
import { EventoAuditorio } from "../../types";
import { validateRequired } from "../../utils/validation";
import { useAuth } from "../../context/AuthContext";
import Salas from "./Salas";
import { generateNextCode } from "../../utils/codeGenerator";

const formatCedula = (input: string): string => {
  if (!input) return "";
  
  // Keep only digits
  let digits = input.replace(/\D/g, "");
  if (digits.length > 8) {
    digits = digits.slice(0, 8);
  }
  
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const Auditorio: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.Role?.nombre_rol || user?.rol || "Administrador";
  const isGerente = userRole === "Gerente";

  const [selectedEvent, setSelectedEvent] = useState<EventoAuditorio | null>(null);
  const [isPastEvent, setIsPastEvent] = useState(false);
  
  const [codigoReserva, setCodigoReserva] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFin, setHoraFin] = useState("18:00");
  const [organizador, setOrganizador] = useState("");
  const [cedulaOrganizador, setCedulaOrganizador] = useState("");
  const [organizadorLoading, setOrganizadorLoading] = useState(false);
  const [organizadorError, setOrganizadorError] = useState("");
  const [organizadorAuto, setOrganizadorAuto] = useState(false);
  const [tipoEvento, setTipoEvento] = useState("Conferencia");
  const [customTipoEvento, setCustomTipoEvento] = useState("");
  
  const [events, setEvents] = useState<EventoAuditorio[]>([]);
  const [espacios, setEspacios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  
  const [filterTipo, setFilterTipo] = useState("Todos");
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
      horaInicio !== "" &&
      horaFin !== "" &&
      horaInicio < horaFin
    );
  }, [eventTitle, tipoEvento, customTipoEvento, eventDate, cedulaOrganizador, organizador, horaInicio, horaFin]);
  
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

  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const matchTipo = filterTipo === "Todos" || ev.extendedProps.tipoEvento === filterTipo;
      const matchSearch = searchTerm === "" || 
        ev.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (ev.extendedProps.organizador || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchTipo && matchSearch;
    });
  }, [events, filterTipo, searchTerm]);

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
      
      // Fallback search formats if not found on the first try
      if (!result.existe) {
        const cleanDigits = cedula.replace(/\D/g, "");
        
        // Format 1: V-XX.XXX.XXX
        const vDotted = `V-${cedula}`;
        // Format 2: Just clean digits (e.g. 31619791)
        const cleanVal = cleanDigits;
        // Format 3: V-XXXXXXXX (clean digits with V-)
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
              // Ignore failure for individual format try
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
    resetModalFields();

    const nextCode = generateNextCode(
      events.map(e => e.codigo_reserva),
      "RES",
      3
    );
    setCodigoReserva(nextCode);

    setEventDate(dateStr);
    setHoraInicio("08:00");
    setHoraFin("18:00");
    setIsPastEvent(false);
    openModal();
  };

  const handleEventClick = (event: CalendarGridEvent) => {
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay ?? false,
      extendedProps: {
        organizador: event.extendedProps?.organizador || "",
        tipoEvento: event.extendedProps?.tipoEvento || "",
        cedula: event.extendedProps?.cedula
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
    // Bloquear edición si la fecha ya pasó
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const evDate = new Date((event.start?.split("T")[0] || "") + "T00:00:00");
    setIsPastEvent(evDate < today);
    openModal();
  };
  
  const handleEditFromList = (ev: EventoAuditorio) => {
    setSelectedEvent(ev);
    setEventTitle(ev.title);
    setEventDate(ev.start?.split("T")[0] || "");
    setHoraInicio((ev.start?.split("T")[1]?.substring(0, 5)) || "08:00");
    setHoraFin((ev.end?.split("T")[1]?.substring(0, 5)) || "18:00");
    setOrganizador(ev.extendedProps.organizador || "");
    setCedulaOrganizador(ev.extendedProps?.cedula || ""); 
    setTipoEvento(ev.extendedProps.tipoEvento || "Conferencia");
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const evDate = new Date((ev.start?.split("T")[0] || "") + "T00:00:00");
    setIsPastEvent(evDate < today);
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

    if (!cedulaOrganizador || !organizador) {
      setFormError("Debe buscar y seleccionar un organizador válido.");
      return;
    }

    if (horaInicio >= horaFin) {
      setFormError("La hora de inicio debe ser anterior a la hora de finalización.");
      return;
    }

    // Verificación de superposición de horarios (overlap)
    const isOverlapping = events.some(ev => {
      // Ignorar el evento actual si estamos editando
      if (selectedEvent && ev.id === selectedEvent.id) return false;
      
      const evDate = ev.start?.split("T")[0];
      if (evDate !== eventDate) return false;

      const evStart = ev.start?.split("T")[1]?.substring(0, 5);
      const evEnd = ev.end?.split("T")[1]?.substring(0, 5);
      
      if (evStart && evEnd) {
         return horaInicio < evEnd && horaFin > evStart;
      }
      return false;
    });

    if (isOverlapping) {
      setFormError("Ya existe una reserva en el auditorio para este horario. Por favor, elija otro bloque de horas.");
      return;
    }

    try {
      setSaving(true);
      const tipoFinal = tipoEvento === "other" ? customTipoEvento.trim() : tipoEvento;
      const espacioId = espacios.length > 0 ? espacios[0].id_espacio : 1;
      const payload = {
        codigo_reserva: codigoReserva,
        id_espacio: espacioId,
        cedula: cedulaOrganizador,
        nombre_responsable: organizador,
        institucion: tipoFinal,
        fecha_uso: eventDate,
        hora_inicio: horaInicio + ":00",
        hora_fin: horaFin + ":00",
        motivo: eventTitle,
        estado: "Aprobada"
      };

      if (selectedEvent) {
        await mavetApi.actualizarReservaAuditorio(selectedEvent.id, payload);
      } else {
        await mavetApi.registrarReservaAuditorio(payload);
      }
      
      const data = await mavetApi.getEventos();
      setEvents(data);
      closeModal();
      resetModalFields();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error al guardar la reserva";
      toast.error(msg);
    } finally {
      setSaving(false);
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
    setHoraInicio("08:00");
    setHoraFin("18:00");
    setOrganizador("");
    setCedulaOrganizador("");
    setOrganizadorLoading(false);
    setOrganizadorError("");
    setOrganizadorAuto(false);
    setTipoEvento("Conferencia");
    setCustomTipoEvento("");
    setSelectedEvent(null);
    setFormError("");
    setIsPastEvent(false);
  };

  const getColorClass = (tipo: string) => {
    switch(tipo) {
      case "Exposición": return "bg-blue-500 text-white border-blue-600";
      case "Taller": return "bg-green-500 text-white border-green-600";
      case "Reunión": return "bg-orange-500 text-white border-orange-600";
      default: return "bg-purple-500 text-white border-purple-600";
    }
  };

  const colorMap: Record<string, string> = {
    Conferencia: "bg-brand-500",
    Exposición: "bg-blue-500",
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
          {/* Filtros */}
          <div className="flex gap-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Buscar evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-48 sm:w-64 rounded-xl border border-gray-200 bg-white text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="py-2 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="Todos">Todos los tipos</option>
              <option value="Conferencia">Conferencia</option>
              <option value="Exposición">Exposición</option>
              <option value="Taller">Taller / Curso</option>
              <option value="Reunión">Reunión Interna</option>
            </select>
          </div>

          <button 
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
              onClick={() => {
                resetModalFields();
                const nextCode = generateNextCode(
                  events.map(e => e.codigo_reserva),
                  "RES",
                  3
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
        {/* Leyenda solo en vista de calendario */}
        {viewMode === "calendar" && (
          <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-theme-xs text-sm w-full">
            <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Leyenda:</span>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-500"></div><span className="text-gray-600 dark:text-gray-400">Conferencia</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-gray-600 dark:text-gray-400">Exposición</span></div>
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-16">
                <LoadingSkeleton variant="table" rows={8} cols={6} />
              </div>
            ) : events.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-sm">
                <CalendarIcon className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Sin Reservas</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">No hay reservas que coincidan con la búsqueda.</p>
                <button onClick={() => {
                  resetModalFields();
                  const nextCode = generateNextCode(
                    events.map(e => e.codigo_reserva),
                    "RES",
                    3
                  );
                  setCodigoReserva(nextCode);
                  openModal();
                }} className="mt-4 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-all">
                  Crear primera reserva
                </button>
              </div>
            ) : (
              filteredEvents.map(ev => {
                const badgeClass = getColorClass(ev.extendedProps.tipoEvento || "Conferencia");
                return (
                  <div key={ev.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 transition-all hover:shadow-theme-md hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border ${badgeClass}`}>
                        {ev.extendedProps.tipoEvento || "Conferencia"}
                      </div>
                      {!isGerente && (() => {
                        const d = new Date((ev.start?.split("T")[0] || "") + "T00:00:00");
                        const t = new Date(); t.setHours(0, 0, 0, 0);
                        return d >= t;
                      })() && (
                        <div className="flex gap-1.5">
                          <button onClick={() => handleEditFromList(ev)} className="p-1.5 text-gray-400 hover:text-brand-500 transition-colors" title="Editar evento">
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-1">{ev.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                      Organizado por: <span className="font-semibold text-gray-700 dark:text-gray-300">{ev.extendedProps.organizador}</span>
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
                        <span>{formatDateForList(ev.start)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span>{getTimeFromISO(ev.start)} - {getTimeFromISO(ev.end)}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 mb-3">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate">Auditorio Principal</span>
                      </div>
                      <div className="col-span-2">
                        <button onClick={() => handleVerAsistentes(ev)} className="w-full inline-flex justify-center items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors">
                          <AlertCircle className="w-4 h-4" />
                          Ver Asistentes (Check-In)
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      <div className="mt-8">
        <Salas />
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-2xl w-full mx-4">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
              {selectedEvent ? (isPastEvent ? "Ver Reserva (Solo Lectura)" : "Editar Reserva de Auditorio") : "Nueva Reserva de Auditorio"}
            </h3>
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
                  min={new Date().toISOString().split("T")[0]}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  disabled={isGerente || isPastEvent}
                  className="show-date-picker w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 disabled:opacity-50"
                />
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
                    <option value="Exposición">Exposición</option>
                    <option value="Taller">Taller / Curso</option>
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 [color-scheme:light] dark:[color-scheme:dark] disabled:opacity-50"
                />
              </div>

              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Hora Fin</label>
                <input
                  required
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  disabled={isGerente || isPastEvent}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 [color-scheme:light] dark:[color-scheme:dark] disabled:opacity-50"
                />
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
                        disabled={isGerente || organizadorLoading || !cedulaOrganizador}
                        className="bg-brand-500 hover:bg-brand-600 text-white px-4 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
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
                </div>
              </div>
            </div>

            {formError && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-xl border border-red-200 dark:border-red-900/30">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{formError}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
              {isGerente || isPastEvent ? (
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
                        className="text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 dark:border-red-900/50 dark:hover:bg-red-600 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                        title="Eliminar evento"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Eliminar</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !isFormValid}
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
      </Modal>

      {/* ══════════════════════════════════════════
          MODAL: Ver Asistentes (Recepción / QR)
         ══════════════════════════════════════════ */}
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
