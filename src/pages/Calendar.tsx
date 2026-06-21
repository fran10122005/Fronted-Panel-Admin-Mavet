import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  MapPin,
  Clock,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  List,
  Grid,
} from "lucide-react";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";

// Museum-specific types
type EventStatus = 'Primary' | 'Success' | 'Danger' | 'Warning';

interface MuseumEvent {
  id: string;
  title: string;
  type: string; // Taller, Exposición, etc.
  description: string;
  venue: string; // Sala 1, Auditorio, etc.
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: EventStatus;
}

const statusColors: Record<EventStatus, string> = {
  Primary: "bg-brand-500 text-white border-brand-600",
  Success: "bg-green-500 text-white border-green-600",
  Warning: "bg-yellow-500 text-white border-yellow-600",
  Danger: "bg-red-500 text-white border-red-600",
};

const statusLabels: Record<EventStatus, string> = {
  Primary: "Exposición",
  Success: "Taller",
  Warning: "Visita Guiada",
  Danger: "Especial",
};

const eventTypes = ["Exposición", "Taller", "Visita Guiada", "Conferencia", "Especial"];
const venuesList = ["Galería 1", "Galería 2", "Auditorio", "Patio Central", "Sala Audiovisual"];

const daysOfWeek = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<MuseumEvent[]>([]);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal state
  const { isOpen, openModal, closeModal } = useModal();
  const [editingEvent, setEditingEvent] = useState<MuseumEvent | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    description: "",
    venue: "",
    start_date: "",
    end_date: "",
    time: "",
    status: "Primary" as EventStatus
  });

  useEffect(() => {
    // Datos ficticios iniciales
    setEvents([
      {
        id: "1",
        title: "Exposición de Arte Local",
        type: "Exposición",
        description: "Muestra de artistas andinos contemporáneos.",
        venue: "Galería 1",
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
        time: "10:00",
        status: "Primary",
      },
      {
        id: "2",
        title: "Taller de Pintura al Óleo",
        type: "Taller",
        description: "Clases prácticas para principiantes.",
        venue: "Sala Audiovisual",
        start_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        end_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        time: "15:00",
        status: "Success",
      },
      {
        id: "3",
        title: "Visita Guiada Escolar",
        type: "Visita Guiada",
        description: "Recorrido para escuela primaria.",
        venue: "Patio Central",
        start_date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        end_date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        time: "09:30",
        status: "Warning",
      },
    ]);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      type: "",
      description: "",
      venue: "",
      start_date: "",
      end_date: "",
      time: "",
      status: "Primary",
    });
    openModal();
  };

  const handleOpenEdit = (event: MuseumEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      type: event.type,
      description: event.description,
      venue: event.venue,
      start_date: event.start_date,
      end_date: event.end_date,
      time: event.time,
      status: event.status,
    });
    openModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      setEvents(events.map(ev => ev.id === editingEvent.id ? { ...formData, id: ev.id } as MuseumEvent : ev));
    } else {
      setEvents([...events, { ...formData, id: Date.now().toString() } as MuseumEvent]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este evento?")) {
      setEvents(events.filter(ev => ev.id !== id));
    }
  };

  // Calendar logic
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    if (day < 1 || day > daysInMonth) return null;
    return day;
  });

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const d = new Date(e.start_date + "T00:00:00");
      return d.getFullYear() === currentDate.getFullYear() &&
             d.getMonth() === currentDate.getMonth() &&
             d.getDate() === day;
    });
  };

  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData("eventId", eventId);
  };

  const handleDrop = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData("eventId");
    if (!eventId || !day) return;

    const newDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    setEvents(events.map(ev => {
      if (ev.id === eventId) {
        // Calculate length difference
        const oldStart = new Date(ev.start_date + "T00:00:00").getTime();
        const oldEnd = new Date(ev.end_date + "T00:00:00").getTime();
        const diff = oldEnd - oldStart;
        
        const newStartObj = new Date(newDateStr + "T00:00:00");
        const newEndObj = new Date(newStartObj.getTime() + diff);
        const newEndStr = `${newEndObj.getFullYear()}-${String(newEndObj.getMonth() + 1).padStart(2, '0')}-${String(newEndObj.getDate()).padStart(2, '0')}`;
        
        return { ...ev, start_date: newDateStr, end_date: newEndStr };
      }
      return ev;
    }));
  };

  return (
    <>
      <PageMeta
        title="Calendario | MAVET Panel"
        description="Gestión de exposiciones y eventos del museo"
      />
      
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
              Gestión de Eventos y Exposiciones
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Administra el calendario de actividades del museo.
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="flex rounded-xl bg-white p-1 border border-gray-200 dark:border-gray-800 dark:bg-gray-900 shadow-theme-xs">
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
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
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
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
              onClick={handleOpenCreate}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Nuevo Evento
            </button>
          </div>
        </div>

        {/* View Content */}
        {viewMode === "calendar" ? (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 capitalize">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors shadow-theme-xs"
                >
                  Hoy
                </button>
                <button
                  onClick={prevMonth}
                  className="flex items-center justify-center rounded-lg border border-gray-200 bg-white h-8 w-8 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors shadow-theme-xs"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="flex items-center justify-center rounded-lg border border-gray-200 bg-white h-8 w-8 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors shadow-theme-xs"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {daysOfWeek.map(day => (
                  <div key={day} className="text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  const dayEvents = day ? getEventsForDay(day) : [];
                  const isToday = day === new Date().getDate() && 
                                 currentDate.getMonth() === new Date().getMonth() && 
                                 currentDate.getFullYear() === new Date().getFullYear();
                  
                  return (
                    <div
                      key={index}
                      onDragOver={e => { if (day) e.preventDefault(); }}
                      onDrop={e => { if (day) handleDrop(e, day); }}
                      onClick={() => {
                        if (day) {
                          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          handleOpenCreate();
                          setFormData(prev => ({ ...prev, start_date: dateStr, end_date: dateStr }));
                        }
                      }}
                      className={`min-h-[120px] rounded-xl border p-2 transition-all ${
                        day 
                          ? "border-gray-100 bg-white hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-700 cursor-pointer shadow-theme-xs hover:shadow-theme-md" 
                          : "border-transparent bg-transparent"
                      } ${isToday ? "ring-2 ring-brand-500 bg-brand-50/30 dark:bg-brand-900/10" : ""}`}
                    >
                      {day && (
                        <>
                          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            isToday ? "bg-brand-500 text-white" : "text-gray-700 dark:text-gray-300"
                          }`}>
                            {day}
                          </span>
                          <div className="mt-2 space-y-1.5 max-h-[90px] overflow-y-auto pr-1 custom-scrollbar">
                            {dayEvents.map(ev => (
                              <div
                                key={ev.id}
                                draggable
                                onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, ev.id); }}
                                onClick={(e) => { e.stopPropagation(); handleOpenEdit(ev); }}
                                className={`cursor-grab active:cursor-grabbing truncate rounded-md px-2 py-1 text-[11px] font-semibold border shadow-sm transition-transform hover:scale-[1.02] ${statusColors[ev.status]}`}
                                title={ev.title}
                              >
                                {ev.time} - {ev.title}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 p-4 px-6 flex flex-wrap gap-4">
              {Object.entries(statusColors).map(([status, classes]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full border ${classes.split(' ')[0]} ${classes.split(' ')[2]}`} />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{statusLabels[status as EventStatus]}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {events.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-sm">
                <CalendarIcon className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Sin Eventos</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">No hay actividades registradas en el calendario.</p>
                <button onClick={handleOpenCreate} className="mt-4 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-all">
                  Crear primera actividad
                </button>
              </div>
            ) : (
              events.map(ev => {
                const dateObj = new Date(ev.start_date + "T00:00:00");
                return (
                  <div key={ev.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 transition-all hover:shadow-theme-md hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border ${statusColors[ev.status]}`}>
                        {ev.type}
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => handleOpenEdit(ev)} className="p-1.5 text-gray-400 hover:text-brand-500 transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(ev.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-1">{ev.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">{ev.description || "Sin descripción"}</p>
                    
                    <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
                        <span>{dateObj.getDate()} {monthNames[dateObj.getMonth()].substring(0,3)} {dateObj.getFullYear()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span>{ev.time}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate">{ev.venue || "Lugar por definir"}</span>
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
              {editingEvent ? "Editar Evento" : "Nuevo Evento del Museo"}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre del Evento</label>
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                  placeholder="Ej. Exposición de Arte..."
                />
              </div>
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</label>
                <select
                  required
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                >
                  <option value="">Seleccione el tipo</option>
                  {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descripción Breve</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 resize-none"
                  placeholder="Detalles sobre el evento..."
                />
              </div>

              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sala / Ubicación</label>
                <select
                  required
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                >
                  <option value="">Seleccione el espacio</option>
                  {venuesList.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nivel de Importancia</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                >
                  <option value="Primary">Normal (Azul)</option>
                  <option value="Success">Destacado (Verde)</option>
                  <option value="Warning">Atención (Amarillo)</option>
                  <option value="Danger">Urgente/Especial (Rojo)</option>
                </select>
              </div>

              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha de Inicio</label>
                <input
                  required
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
              
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha de Fin</label>
                <input
                  required
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hora</label>
                <input
                  required
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-all hover:scale-105 active:scale-95"
              >
                {editingEvent ? "Guardar Cambios" : "Crear Evento"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default Calendar;
