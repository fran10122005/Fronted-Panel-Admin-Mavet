import { useState, useEffect } from "react";
import { mavetApi } from "../../services/api";
import { Link } from "react-router";
import Skeleton from "../../components/ui/Skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import PageMeta from "../../components/common/PageMeta";

export default function GerenteDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [topVisitantes, setTopVisitantes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    Promise.all([
      mavetApi.getDashboardStats(),
      mavetApi.getTopVisitantes(now.getMonth() + 1, now.getFullYear())
    ]).then(([data, top]: any) => {
      if (data) setStats(data);
      setTopVisitantes((top || []).slice(0, 3));
      setIsLoading(false);
    });
  }, []);

  const currentMonthName = new Date().toLocaleString('es-ES', { month: 'long' });
  const chartData = stats?.visitantesDiarios || [];

  const sparklineDataObras = [{ val: 10 }, { val: 15 }, { val: 12 }, { val: 20 }, { val: 18 }, { val: 25 }, { val: 30 }];
  const sparklineDataLibros = [{ val: 5 }, { val: 8 }, { val: 15 }, { val: 12 }, { val: 22 }, { val: 18 }, { val: 24 }];
  const sparklineDataVisitantes = [{ val: 2 }, { val: 10 }, { val: 8 }, { val: 15 }, { val: 25 }, { val: 20 }, { val: 35 }];
  const sparklineDataEventos = [{ val: 1 }, { val: 2 }, { val: 1 }, { val: 4 }, { val: 3 }, { val: 5 }, { val: 6 }];

  return (
    <>
      <PageMeta title="Dashboard MAVET | Gerente" description="Panel de administración general del MAVET" />
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 data-tour="page-heading" className="text-2xl font-bold text-gray-900 dark:text-white">Panel de Gerencia</h1>
          <p className="text-sm text-gray-500">Resumen general del estado de la institución.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <div className="relative overflow-hidden z-0 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25 group">
            <div className="absolute bottom-0 left-0 right-0 h-10 md:h-16 opacity-[0.12] dark:opacity-[0.05] z-[-1] pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineDataObras}>
                  <Area type="monotone" dataKey="val" stroke="#10b981" fill="#10b981" strokeWidth={2} isAnimationActive={true} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl dark:from-brand-500/10 dark:to-brand-500/5 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-brand-100/50 dark:border-brand-500/10">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-500/10 px-2.5 py-1 rounded-md border border-green-200/50 dark:border-green-500/20">Total</span>
            </div>
            <div>
              <span className="text-[11px] md:text-sm font-semibold text-gray-500 dark:text-gray-400">Obras en Bóveda</span>
              <h4 className="mt-0.5 md:mt-1 font-extrabold text-gray-900 text-lg md:text-3xl dark:text-white tracking-tight drop-shadow-sm">
                {isLoading ? <Skeleton className="h-5 md:h-9 w-10 md:w-16 mt-0.5 md:mt-1" /> : stats?.totalObras || 0}
              </h4>
            </div>
          </div>

          <div className="relative overflow-hidden z-0 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25 group">
            <div className="absolute bottom-0 left-0 right-0 h-10 md:h-16 opacity-[0.12] dark:opacity-[0.05] z-[-1] pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineDataLibros}>
                  <Area type="monotone" dataKey="val" stroke="#4f46e5" fill="#4f46e5" strokeWidth={2} isAnimationActive={true} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl dark:from-indigo-500/10 dark:to-indigo-500/5 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-indigo-100/50 dark:border-indigo-500/10">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-indigo-700 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-200/50 dark:border-indigo-500/20">Catálogo</span>
            </div>
            <div>
              <span className="text-[11px] md:text-sm font-semibold text-gray-500 dark:text-gray-400">Títulos en Biblioteca</span>
              <h4 className="mt-0.5 md:mt-1 font-extrabold text-gray-900 text-lg md:text-3xl dark:text-white tracking-tight drop-shadow-sm">
                {isLoading ? <Skeleton className="h-5 md:h-9 w-10 md:w-16 mt-0.5 md:mt-1" /> : stats?.totalLibros || 0}
              </h4>
            </div>
          </div>

          <div className="relative overflow-hidden z-0 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25 group">
            <div className="absolute bottom-0 left-0 right-0 h-10 md:h-16 opacity-[0.12] dark:opacity-[0.05] z-[-1] pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineDataVisitantes}>
                  <Area type="monotone" dataKey="val" stroke="#f59e0b" fill="#f59e0b" strokeWidth={2} isAnimationActive={true} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl dark:from-amber-500/10 dark:to-amber-500/5 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-amber-100/50 dark:border-amber-500/10">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-200/50 dark:border-amber-500/20">Este mes</span>
            </div>
            <div>
              <span className="text-[11px] md:text-sm font-semibold text-gray-500 dark:text-gray-400">Visitantes Registrados</span>
              <h4 className="mt-0.5 md:mt-1 font-extrabold text-gray-900 text-lg md:text-3xl dark:text-white tracking-tight drop-shadow-sm">
                {isLoading ? <Skeleton className="h-5 md:h-9 w-10 md:w-16 mt-0.5 md:mt-1" /> : stats?.visitantesMes || 0}
              </h4>
            </div>
          </div>

          <div className="relative overflow-hidden z-0 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25 group">
            <div className="absolute bottom-0 left-0 right-0 h-10 md:h-16 opacity-[0.12] dark:opacity-[0.05] z-[-1] pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineDataEventos}>
                  <Area type="monotone" dataKey="val" stroke="#e11d48" fill="#e11d48" strokeWidth={2} isAnimationActive={true} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl dark:from-rose-500/10 dark:to-rose-500/5 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-rose-100/50 dark:border-rose-500/10">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-200/50 dark:border-rose-500/20">Activos</span>
            </div>
            <div>
              <span className="text-[11px] md:text-sm font-semibold text-gray-500 dark:text-gray-400">Eventos Programados</span>
              <h4 className="mt-0.5 md:mt-1 font-extrabold text-gray-900 text-lg md:text-3xl dark:text-white tracking-tight drop-shadow-sm">
                {isLoading ? <Skeleton className="h-5 md:h-9 w-10 md:w-16 mt-0.5 md:mt-1" /> : stats?.totalEventosActivos || 0}
              </h4>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-4 md:gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 dark:text-white text-lg">Próximos Eventos</h3>
              <Link to="/auditorio" className="text-sm text-brand-500 hover:text-brand-600 font-medium">Ver Auditorio</Link>
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
                  <Link to="/auditorio" className="mt-2 text-sm text-brand-600 hover:underline">Registrar uno nuevo</Link>
                </div>
              ) : stats?.proximosEventos?.map((evento: any, idx: number) => {
                const dateObj = new Date(evento.fecha_uso || evento.fecha_solicitada);
                const month = dateObj.toLocaleString('es-ES', { month: 'short' }).toUpperCase();
                const day = dateObj.getDate().toString().padStart(2, '0');
                return (
                  <div key={evento.id_solicitud || idx} className="p-5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-500/10 dark:to-brand-500/5 flex flex-col items-center justify-center flex-shrink-0 border border-brand-100 dark:border-brand-500/20">
                      <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 leading-none">{month}</span>
                      <span className="text-lg font-black text-brand-700 dark:text-brand-300 leading-none mt-0.5">{day}</span>
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

          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 dark:text-white text-lg">Visitantes Frecuentes</h3>
              <span className="text-xs text-gray-400 font-medium">Top 3 del mes</span>
            </div>
            <div className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <div className="p-5 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                      <Skeleton className="w-8 h-8 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : topVisitantes.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sin registros de visitantes aún.</p>
                  <Link to="/recepcion" className="mt-2 text-sm text-brand-600 hover:underline">Registrar Visita</Link>
                </div>
              ) : topVisitantes.map((v: any, idx: number) => (
                <div key={v.cedula || idx} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 ${
                    idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 ring-2 ring-amber-300/50 dark:ring-amber-600/40' :
                    idx === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300 ring-2 ring-gray-300/50 dark:ring-gray-600/40' :
                    'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 ring-2 ring-orange-200/50 dark:ring-orange-600/30'
                  }`}>{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{v.nombre || "Visitante"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{v.cedula}</p>
                  </div>
                  <div className="text-right shrink-0 bg-gray-50 dark:bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                    <p className="font-bold text-gray-800 dark:text-gray-200 text-base leading-none">{v.totalVisitas}</p>
                    <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider mt-1">visitas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 dark:text-white text-lg">Últimas Obras Registradas</h3>
              <Link to="/inventario-obras" className="text-sm text-brand-500 hover:text-brand-600 font-medium">Ir a Bóveda</Link>
            </div>
            <div className="p-5 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-3 font-medium uppercase">Código</th>
                    <th className="pb-3 font-medium uppercase">Título</th>
                    <th className="pb-3 font-medium uppercase text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-100 dark:divide-gray-800">
                  {isLoading ? (
                    [1, 2, 3].map(i => (
                      <tr key={i}>
                        <td className="py-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="py-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="py-4"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></td>
                      </tr>
                    ))
                  ) : stats?.ultimasObras?.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-gray-500">
                        <p className="text-sm">No hay obras registradas en Bóveda.</p>
                      </td>
                    </tr>
                  ) : stats?.ultimasObras?.map((obra: any) => {
                    const isRestauracion = obra.EstadoObra?.nombre_estado === 'Restauración';
                    const isExcelente = obra.EstadoObra?.nombre_estado === 'Excelente';
                    return (
                      <tr key={obra.id_obra} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3.5 font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold">{obra.codigo_inventario || `OBR-${obra.id_obra}`}</td>
                        <td className="py-3.5 font-medium truncate max-w-[150px]">{obra.titulo || "Sin Título"}</td>
                        <td className="py-3.5 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            isRestauracion ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20' :
                            isExcelente ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:border-green-500/20' :
                            'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20'
                          }`}>{obra.EstadoObra?.nombre_estado || "Bueno"}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 dark:text-white text-lg">Últimos Libros Registrados</h3>
              <Link to="/biblioteca" className="text-sm text-brand-500 hover:text-brand-600 font-medium">Ir a Biblioteca</Link>
            </div>
            <div className="p-5 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-3 font-medium uppercase">Código</th>
                    <th className="pb-3 font-medium uppercase">Título</th>
                    <th className="pb-3 font-medium uppercase text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-100 dark:divide-gray-800">
                  {isLoading ? (
                    [1, 2, 3].map(i => (
                      <tr key={i}>
                        <td className="py-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="py-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="py-4"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></td>
                      </tr>
                    ))
                  ) : stats?.ultimosLibros?.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-gray-500">
                        <p className="text-sm">No hay libros registrados en Biblioteca.</p>
                      </td>
                    </tr>
                  ) : stats?.ultimosLibros?.map((libro: any) => {
                    const isBueno = libro.estado === 'Bueno';
                    const isRegular = libro.estado === 'Regular';
                    return (
                      <tr key={libro.id_libro} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3.5 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{libro.unidad || `LIB-${libro.id_libro}`}</td>
                        <td className="py-3.5 font-medium truncate max-w-[150px]">{libro.titulo || "Sin Título"}</td>
                        <td className="py-3.5 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            isBueno ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:border-green-500/20' :
                            isRegular ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20' :
                            'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:border-red-500/20'
                          }`}>{libro.estado || "Bueno"}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm animate-fadeIn" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white text-lg">Flujo de Visitantes del Mes</h3>
              <p className="text-xs text-gray-500">Actividad registrada en {currentMonthName.toUpperCase()}</p>
            </div>
            <span className="inline-flex items-center self-start sm:self-auto gap-1 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-500/20">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              +20% vs semestre anterior
            </span>
          </div>
          <div className="h-64 w-full">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisitantes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(4px)' }} itemStyle={{ color: '#111827', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="visitantes" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitantes)" activeDot={{ r: 6, strokeWidth: 0, fill: '#f59e0b' }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
