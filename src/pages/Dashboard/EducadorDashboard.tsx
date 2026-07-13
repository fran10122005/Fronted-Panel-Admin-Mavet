import { useState, useEffect } from "react";
import { mavetApi } from "../../services/api";
import { Link } from "react-router";
import Skeleton from "../../components/ui/Skeleton";
import PageMeta from "../../components/common/PageMeta";

export default function EducadorDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mavetApi.getDashboardStats().then((data: any) => {
      if (data) setStats(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <>
      <PageMeta title="Dashboard MAVET | Educación" description="Panel de educación, talleres y eventos del MAVET" />
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panel de Educación</h1>
          <p className="text-sm text-gray-500">Gestión de talleres, eventos y uso del auditorio.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25 group">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl dark:from-rose-500/10 dark:to-rose-500/5 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-rose-100/50 dark:border-rose-500/10">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-200/50 dark:border-rose-500/20">Activos</span>
            </div>
            <div>
              <span className="text-[11px] md:text-sm font-semibold text-gray-500 dark:text-gray-400">Eventos Programados</span>
              <h4 className="mt-0.5 md:mt-1 font-extrabold text-gray-900 text-lg md:text-3xl dark:text-white tracking-tight drop-shadow-sm">
                {isLoading ? <Skeleton className="h-5 md:h-9 w-10 md:w-16" /> : stats?.totalEventosActivos || 0}
              </h4>
            </div>
          </div>

          <Link to="/talleres" className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-center items-center gap-2 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25 group cursor-pointer">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-50 to-green-100 rounded-xl dark:from-green-500/10 dark:to-green-500/5 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-green-100/50 dark:border-green-500/10">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Gestionar Talleres</span>
          </Link>

          <Link to="/auditorio" className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-center items-center gap-2 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25 group cursor-pointer">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl dark:from-blue-500/10 dark:to-blue-500/5 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-blue-100/50 dark:border-blue-500/10">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ver Auditorio</span>
          </Link>

          <Link to="/educacion" className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-center items-center gap-2 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25 group cursor-pointer">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl dark:from-purple-500/10 dark:to-purple-500/5 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-purple-100/50 dark:border-purple-500/10">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Educación</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 dark:text-white text-lg">Próximos Eventos</h3>
            <Link to="/auditorio" className="text-sm text-brand-500 hover:text-brand-600 font-medium">Ver todos</Link>
          </div>
          <div className="p-0 divide-y divide-gray-100 dark:divide-gray-800 animate-fadeIn">
            {isLoading ? (
              <div className="p-5 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats?.proximosEventos?.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No hay eventos próximos.</p>
                <Link to="/auditorio" className="mt-2 text-sm text-brand-600 hover:underline">Programar uno nuevo</Link>
              </div>
            ) : stats?.proximosEventos?.map((evento: any, idx: number) => {
              const dateObj = new Date(evento.fecha_uso || evento.fecha_solicitada);
              const month = dateObj.toLocaleString('es-ES', { month: 'short' }).toUpperCase();
              const day = dateObj.getDate().toString().padStart(2, '0');
              return (
                <div key={evento.id_solicitud || idx} className="p-5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-500/10 dark:to-rose-500/5 flex flex-col items-center justify-center flex-shrink-0 border border-rose-100 dark:border-rose-500/20">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 leading-none">{month}</span>
                    <span className="text-lg font-black text-rose-700 dark:text-rose-300 leading-none mt-0.5">{day}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-base truncate">{evento.motivo || evento.motivo_uso || "Evento MAVET"}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {evento.hora_inicio || "Por definir"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
