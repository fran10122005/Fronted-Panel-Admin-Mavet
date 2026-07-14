import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CalendarGridEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  extendedProps?: {
    organizador?: string;
    tipoEvento?: string;
    cedula?: string;
  };
}

interface CalendarGridProps {
  events: CalendarGridEvent[];
  onDateSelect: (dateStr: string) => void;
  onEventClick: (event: CalendarGridEvent) => void;
  getEventColor?: (tipo: string) => string;
  isLoading?: boolean;
}

const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const getFirstDayOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const defaultGetColor = (tipo?: string) => {
  switch (tipo) {
    case "Taller": return "bg-green-500";
    case "Reunión": return "bg-orange-500";
    default: return "bg-brand-500";
  }
};

const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

export default function CalendarGrid({ events, onDateSelect, onEventClick, getEventColor = defaultGetColor, isLoading }: CalendarGridProps) {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const calendarDays = useMemo(() => {
    return Array.from({ length: 42 }, (_, i) => {
      const day = i - firstDay + 1;
      if (day < 1 || day > daysInMonth) return null;
      return day;
    });
  }, [firstDay, daysInMonth]);

  const getEventsForDay = (day: number) => {
    return events.filter((e) => {
      const d = new Date(e.start);
      if (isNaN(d.getTime())) return false;
      return d.getFullYear() === currentDate.getFullYear() &&
             d.getMonth() === currentDate.getMonth() &&
             d.getDate() === day;
    });
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white/90">
          <span className="capitalize">{monthNames[currentDate.getMonth()]}</span> {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-1.5">
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Hoy
          </button>
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-2 sm:p-4">
        <div className="grid grid-cols-7 mb-1 sm:mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="min-h-[60px] sm:min-h-[100px] rounded-xl border border-transparent bg-transparent" />;
            }

            const dayEvents = getEventsForDay(day);
            const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isToday = isSameDay(dayDate, today);
            const isPast = dayDate < todayDateOnly;

            return (
              <div
                key={day}
                onClick={() => onDateSelect(
                  `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                )}
                title={isPast ? "No se pueden crear reservas en fechas pasadas" : undefined}
                className={`min-h-[60px] sm:min-h-[100px] rounded-xl border p-1 sm:p-2 transition-all duration-200 overflow-hidden 
                  ${isPast ? "cursor-not-allowed opacity-60 bg-gray-50 dark:bg-gray-800/30" : "cursor-pointer"}
                  ${isToday
                    ? "border-brand-500/50 bg-brand-50/60 dark:bg-brand-900/15 dark:border-brand-500/40 ring-1 ring-brand-500/30"
                    : isPast 
                      ? "border-gray-100 dark:border-gray-800"
                      : "border-gray-100 dark:border-gray-700/60 hover:border-gray-200 dark:hover:border-gray-600 bg-white dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
              >
                <span className={`flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-full text-[10px] sm:text-sm font-bold
                  ${isToday ? "bg-brand-500 text-white" : "text-gray-600 dark:text-gray-300"}`}
                >
                  {day}
                </span>
                <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1 max-h-[28px] sm:max-h-[56px] overflow-y-auto">
                  {dayEvents.slice(0, 3).map((event) => {
                    const tipo = event.extendedProps?.tipoEvento;
                    const colorClass = getEventColor(tipo || "");
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className={`truncate rounded px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] leading-tight font-semibold text-white ${colorClass} shadow-sm hover:opacity-80 transition-opacity cursor-pointer`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500 font-medium px-1">
                      +{dayEvents.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
