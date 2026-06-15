import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
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
  
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

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

  const handleAddOrUpdateEvent = async () => {
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
  };

  const getColorPorTipo = (tipo: string) => {
    switch(tipo) {
      case "Exposición": return "bg-blue-500";
      case "Taller": return "bg-green-500";
      case "Reunión": return "bg-orange-500";
      default: return "bg-brand-500"; // Conferencia u otros
    }
  };

  const renderEventContent = (eventInfo: any) => {
    const tipo = eventInfo.event.extendedProps.tipoEvento;
    const colorClass = getColorPorTipo(tipo);
    
    return (
      <div className={`flex items-center px-2 py-1 rounded text-xs text-white ${colorClass} overflow-hidden shadow-sm`}>
        <div className="font-semibold truncate w-full" title={eventInfo.event.title}>
          {eventInfo.event.title}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reservas de Auditorio</h1>
          <p className="text-sm text-gray-500">Gestión administrativa de agenda y ocupación de espacios.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              if (events.length === 0) return;
              exportarHistorialEventos(events);
            }}
            className="bg-white text-gray-700 border border-gray-300 font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Exportar Historial PDF
          </button>
          <button onClick={openModal} className="bg-brand-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors">
            + Registrar Reserva
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Leyenda */}
        <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm text-sm w-full">
          <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Leyenda:</span>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-500"></div><span className="text-gray-600 dark:text-gray-400">Conferencia</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-gray-600 dark:text-gray-400">Exposición</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-gray-600 dark:text-gray-400">Taller</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span className="text-gray-600 dark:text-gray-400">Reunión</span></div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 p-4 sm:p-6 shadow-sm min-h-[500px]">
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
                  right: "dayGridMonth,timeGridWeek",
                }}
                events={events}
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
      </div>

      {/* Modal de Formulario Administrativo */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[420px] p-5">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {selectedEvent ? "Editar Reserva" : "Nueva Reserva"}
            </h3>
            {selectedEvent && (
              <button 
                onClick={handleDeleteEvent}
                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors"
                title="Eliminar evento"
              >
                Eliminar
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Título del Evento</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                placeholder="Ej. Conferencia de Arte"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha del Evento</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hora Inicio</label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hora Fin</label>
                <input
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cédula del Organizador</label>
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
                  onBlur={handleCedulaBlur}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  placeholder="Ej. V-12345678"
                />
                {organizadorLoading && <p className="text-[11px] text-gray-500 mt-0.5">Buscando persona...</p>}
                {organizadorError && <p className="text-[11px] text-red-500 mt-0.5">{organizadorError}</p>}
              </div>
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre Organizador</label>
                <input
                  type="text"
                  value={organizador}
                  onChange={(e) => {
                    setOrganizador(e.target.value);
                    setOrganizadorAuto(false);
                  }}
                  readOnly={organizadorAuto}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Se busca con cédula"
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">Ingrese la cédula y salga del campo para buscar los datos automáticamente.</p>

            <div>
              <label className="block mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo de Evento</label>
              <select
                value={tipoEvento}
                onChange={(e) => setTipoEvento(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
              >
                <option value="Conferencia">Conferencia</option>
                <option value="Exposición">Exposición</option>
                <option value="Taller">Taller / Curso</option>
                <option value="Reunión">Reunión Interna</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={closeModal}
              className="px-4 py-1.5 text-xs font-semibold text-gray-655 dark:text-gray-450 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddOrUpdateEvent}
              disabled={saving}
              className="flex items-center justify-center min-w-[130px] px-4 py-1.5 text-xs font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando..." : selectedEvent ? "Actualizar Registro" : "Guardar Reserva"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Auditorio;
