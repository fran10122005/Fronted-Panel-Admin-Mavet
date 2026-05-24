import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { mavetApi } from "../../services/api";
import { EventoAuditorio } from "../../types";

const Auditorio: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<EventoAuditorio | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [organizador, setOrganizador] = useState("");
  const [tipoEvento, setTipoEvento] = useState("Conferencia");
  
  const [events, setEvents] = useState<EventoAuditorio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const data = await mavetApi.getEventos();
        setEvents(data);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventos();
  }, []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
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
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventEndDate(event.end?.toISOString().split("T")[0] || "");
    setOrganizador(event.extendedProps.organizador || "");
    setTipoEvento(event.extendedProps.tipoEvento || "Conferencia");
    openModal();
  };

  const handleAddOrUpdateEvent = () => {
    if (selectedEvent) {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                title: eventTitle,
                start: eventStartDate,
                end: eventEndDate,
                extendedProps: { organizador, tipoEvento },
              }
            : event
        )
      );
    } else {
      const newEvent: EventoAuditorio = {
        id: Date.now().toString(),
        title: eventTitle,
        start: eventStartDate,
        end: eventEndDate,
        allDay: true,
        extendedProps: { organizador, tipoEvento },
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
    closeModal();
    resetModalFields();
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== selectedEvent.id));
      closeModal();
      resetModalFields();
    }
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setOrganizador("");
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
        <button onClick={openModal} className="bg-brand-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-brand-600 transition-colors">
          + Registrar Reserva
        </button>
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
            <div className="calendar-container">
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
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] p-6">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedEvent ? "Editar Reserva" : "Nueva Reserva"}
            </h3>
            {selectedEvent && (
              <button 
                onClick={handleDeleteEvent}
                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors"
                title="Eliminar evento"
              >
                Eliminar
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Título del Evento</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Ej. Conferencia de Arte"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Inicio</label>
                <input
                  type="date"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Fin</label>
                <input
                  type="date"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Organizador</label>
              <input
                type="text"
                value={organizador}
                onChange={(e) => setOrganizador(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Nombre o Institución"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Evento</label>
              <select
                value={tipoEvento}
                onChange={(e) => setTipoEvento(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Conferencia">Conferencia</option>
                <option value="Exposición">Exposición</option>
                <option value="Taller">Taller / Curso</option>
                <option value="Reunión">Reunión Interna</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddOrUpdateEvent}
              className="px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition-colors"
            >
              {selectedEvent ? "Actualizar Registro" : "Guardar Reserva"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Auditorio;
