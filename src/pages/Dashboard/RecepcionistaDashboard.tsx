import { useState, useEffect } from "react";
import { mavetApi } from "../../services/api";
import { Link } from "react-router";
import Skeleton from "../../components/ui/Skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import PageMeta from "../../components/common/PageMeta";

export default function RecepcionistaDashboard() {
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
      setTopVisitantes((top || []).slice(0, 5));
      setIsLoading(false);
    });
  }, []);

  const currentMonthName = new Date().toLocaleString('es-ES', { month: 'long' });
  const chartData = stats?.visitantesDiarios || [];

  return (
    <>
      <PageMeta title="Dashboard MAVET | Recepción" description="Panel de recepción y visitantes del MAVET" />
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panel de Recepción</h1>
          <p className="text-sm text-gray-500">Control de visitantes y registro de ingresos.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25 group">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl dark:from-amber-500/10 dark:to-amber-500/5 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-amber-100/50 dark:border-amber-500/10">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-200/50 dark:border-amber-500/20">Este mes</span>
            </div>
            <div>
              <span className="text-[11px] md:text-sm font-semibold text-gray-500 dark:text-gray-400">Visitantes Registrados</span>
              <h4 className="mt-0.5 md:mt-1 font-extrabold text-gray-900 text-lg md:text-3xl dark:text-white tracking-tight drop-shadow-sm">
                {isLoading ? <Skeleton className="h-5 md:h-9 w-10 md:w-16" /> : stats?.visitantesMes || 0}
              </h4>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25 group">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-green-50 to-green-100 rounded-xl dark:from-green-500/10 dark:to-green-500/5 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-green-100/50 dark:border-green-500/10">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-500/10 px-2.5 py-1 rounded-md border border-green-200/50 dark:border-green-500/20">Top</span>
            </div>
            <div>
              <span className="text-[11px] md:text-sm font-semibold text-gray-500 dark:text-gray-400">Visitantes Frecuentes</span>
              <h4 className="mt-0.5 md:mt-1 font-extrabold text-gray-900 text-lg md:text-3xl dark:text-white tracking-tight drop-shadow-sm">
                {isLoading ? <Skeleton className="h-5 md:h-9 w-10 md:w-16" /> : topVisitantes.length}
              </h4>
            </div>
          </div>

          <Link to="/recepcion" className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-center items-center gap-2 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25 group cursor-pointer">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl dark:from-brand-500/10 dark:to-brand-500/5 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-brand-100/50 dark:border-brand-500/10">
              <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Registrar Ingreso</span>
          </Link>

          <Link to="/ingresos" className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-center items-center gap-2 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25 group cursor-pointer">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl dark:from-blue-500/10 dark:to-blue-500/5 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-blue-100/50 dark:border-blue-500/10">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ver Ingresos</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 dark:text-white text-lg">Visitantes Frecuentes</h3>
              <span className="text-xs text-gray-400 font-medium">Top 5 del mes</span>
            </div>
            <div className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <div className="p-5 space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
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
                  <Link to="/recepcion" className="mt-2 text-sm text-brand-600 hover:underline">Registrar primera visita</Link>
                </div>
              ) : topVisitantes.map((v: any, idx: number) => (
                <div key={v.cedula || idx} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 ${
                    idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 ring-2 ring-amber-300/50' :
                    idx === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300 ring-2 ring-gray-300/50' :
                    idx === 2 ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 ring-2 ring-orange-200/50' :
                    'bg-gray-50 text-gray-500 dark:bg-gray-700/30 dark:text-gray-400 ring-2 ring-gray-200/50 dark:ring-gray-600/30'
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

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg">Flujo de Visitantes del Mes</h3>
                <p className="text-xs text-gray-500">Actividad registrada en {currentMonthName.toUpperCase()}</p>
              </div>
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
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(4px)' }} itemStyle={{ color: '#111827', fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="visitantes" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitantes)" activeDot={{ r: 6, strokeWidth: 0, fill: '#f59e0b' }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
