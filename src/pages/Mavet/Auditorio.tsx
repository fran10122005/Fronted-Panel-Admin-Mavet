import { useState, useRef, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
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
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { mavetApi } from "../../services/api";
import { exportarHistorialEventos } from "../../services/pdf.service";
import { EventoAuditorio } from "../../types";

const Auditorio: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<EventoAuditorio | null>(null);
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
  
  const [events, setEvents] = useState<EventoAuditorio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  
  const [filterTipo, setFilterTipo] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();
  
  const [eventoAsistentes, setEventoAsistentes] = useState<any[]>([]);
  const { isOpen: isOpenAsistentes, openModal: openAsistentesModal, closeModal: closeAsistentesModal } = useModal();

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

  useEffect(() => {
    loadEventos();
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
      const result = await mavetApi.checkVisitante(cedula);
      if (result.existe && result.visitante) {
        const p = result.visitante;
        const nombreCompleto = [p.nombres, p.apellidos].filter(Boolean).join(" ");
        setOrganizador(nombreCompleto);
        setOrganizadorAuto(true);
        setOrganizadorError("");
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

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventDate(selectInfo.startStr.split("T")[0]);
    setHoraInicio("08:00");
    setHoraFin("18:00");
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      allDay: event.allDay,
      extendedProps: {
        organizador: event.extendedProps.organizador,
        tipoEvento: event.extendedProps.tipoEvento,
      }
    });
    setEventTitle(event.title);
    setEventDate(event.startStr?.split("T")[0] || "");
    setHoraInicio((event.startStr?.split("T")[1]?.substring(0, 5)) || "08:00");
    setHoraFin((event.endStr?.split("T")[1]?.substring(0, 5)) || "18:00");
    setOrganizador(event.extendedProps.organizador || "");
    setCedulaOrganizador(event.extendedProps.cedula || "");
    setTipoEvento(event.extendedProps.tipoEvento || "Conferencia");
    openModal();
  };
  
  const handleEditFromList = (ev: EventoAuditorio) => {
    setSelectedEvent(ev);
    setEventTitle(ev.title);
    setEventDate(ev.start?.split("T")[0] || "");
    setHoraInicio((ev.start?.split("T")[1]?.substring(0, 5)) || "08:00");
    setHoraFin((ev.end?.split("T")[1]?.substring(0, 5)) || "18:00");
    setOrganizador(ev.extendedProps.organizador || "");
    setCedulaOrganizador((ev as any).extendedProps?.cedula || ""); 
    setTipoEvento(ev.extendedProps.tipoEvento || "Conferencia");
    openModal();
  };

  const handleVerAsistentes = async (ev: EventoAuditorio) => {
    setSelectedEvent(ev);
    try {
      const todosIngresos = await mavetApi.getTodosIngresos();
      const asistentes = todosIngresos.filter(i => String(i.id_taller) === String(ev.id));
      setEventoAsistentes(asistentes);
    } catch {
      setEventoAsistentes([]);
    }
    openAsistentesModal();
  };

  const handleAddOrUpdateEvent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError("");

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
      const payload = {
        id_espacio: 1,
        cedula: cedulaOrganizador,
        nombre_responsable: organizador,
        institucion: tipoEvento,
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
      console.error("Error al guardar reserva:", error);
      alert("Error al guardar la reserva");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    if (!window.confirm("¿Está seguro de eliminar esta reserva?")) return;
    try {
      setSaving(true);
      await mavetApi.eliminarReservaAuditorio(selectedEvent.id);
      setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
      closeModal();
      resetModalFields();
    } catch (error) {
      console.error("Error al eliminar reserva:", error);
      alert("Error al eliminar la reserva");
    } finally {
      setSaving(false);
    }
  };

  const resetModalFields = () => {
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
    setSelectedEvent(null);
    setFormError("");
  };

  const getColorClass = (tipo: string) => {
    switch(tipo) {
      case "Exposición": return "bg-blue-500 text-white border-blue-600";
      case "Taller": return "bg-green-500 text-white border-green-600";
      case "Reunión": return "bg-orange-500 text-white border-orange-600";
      default: return "bg-brand-500 text-white border-brand-600"; // Conferencia u otros
    }
  };

  const getCalendarColorClass = (tipo: string) => {
    switch(tipo) {
      case "Exposición": return "bg-blue-500";
      case "Taller": return "bg-green-500";
      case "Reunión": return "bg-orange-500";
      default: return "bg-brand-500"; // Conferencia u otros
    }
  };

  const renderEventContent = (eventInfo: any) => {
    const tipo = eventInfo.event.extendedProps.tipoEvento;
    const colorClass = getCalendarColorClass(tipo);
    
    return (
      <div className={`flex items-center px-2 py-1 rounded text-xs text-white ${colorClass} overflow-hidden shadow-sm hover:opacity-90 transition-opacity`}>
        <div className="font-semibold truncate w-full" title={eventInfo.event.title}>
          {eventInfo.event.title}
        </div>
      </div>
    );
  };
  
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
            Reservas de Auditorio
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestión administrativa de agenda y ocupación de espacios.
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
          
          <button
            onClick={() => { resetModalFields(); openModal(); }}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva Reserva</span>
          </button>
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
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 p-4 sm:p-6 shadow-theme-lg min-h-[500px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Cargando agenda...</p>
              </div>
            ) : (
              <div className={`calendar-container ${saving ? 'opacity-50 pointer-events-none transition-opacity' : ''}`}>
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "",
                  }}
                  events={filteredEvents}
                  selectable={true}
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  eventContent={renderEventContent}
                  height="auto"
                  locale="es"
                  buttonText={{
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana'
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-sm">
                <CalendarIcon className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Sin Reservas</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">No hay reservas que coincidan con la búsqueda.</p>
                <button onClick={() => { resetModalFields(); openModal(); }} className="mt-4 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-all">
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
                      <div className="flex gap-1.5">
                        <button onClick={() => handleEditFromList(ev)} className="p-1.5 text-gray-400 hover:text-brand-500 transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
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

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-2xl w-full mx-4">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
              {selectedEvent ? "Editar Reserva de Auditorio" : "Nueva Reserva de Auditorio"}
            </h3>
          </div>
          
          <form onSubmit={handleAddOrUpdateEvent} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Motivo / Título de la Reserva</label>
                <input
                  required
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                  placeholder="Ej. Conferencia de Historia del Arte"
                />
              </div>

              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Fecha del Evento</label>
                <input
                  required
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                />
              </div>

              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Tipo de Evento</label>
                <select
                  required
                  value={tipoEvento}
                  onChange={(e) => setTipoEvento(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                >
                  <option value="Conferencia">Conferencia</option>
                  <option value="Exposición">Exposición</option>
                  <option value="Taller">Taller / Curso</option>
                  <option value="Reunión">Reunión Interna</option>
                </select>
              </div>

              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Hora Inicio</label>
                <input
                  required
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Hora Fin</label>
                <input
                  required
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 [color-scheme:light] dark:[color-scheme:dark]"
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
                          setCedulaOrganizador(e.target.value);
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
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                        placeholder="Ej. V-12345678"
                      />
                      <button
                        type="button"
                        onClick={handleCedulaBlur}
                        disabled={organizadorLoading || !cedulaOrganizador}
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
                  disabled={saving}
                  className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Guardando..." : selectedEvent ? "Actualizar Reserva" : "Guardar Reserva"}
                </button>
              </div>
            </div>
          </form>
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
              Total: {eventoAsistentes.length} {eventoAsistentes.length === 1 ? 'persona' : 'personas'}
            </span>
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
    </div>
  );
};

export default Auditorio;
