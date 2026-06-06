import PageMeta from "../../components/common/PageMeta";
import { useState, useEffect } from "react";
import { mavetApi } from "../../services/api";
import { Link } from "react-router";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mavetApi.getDashboardStats().then(data => {
      if (data) setStats(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <>
      <PageMeta
        title="Dashboard MAVET | Panel Principal"
        description="Panel de administración y estadísticas del Museo MAVET"
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panel Principal del MAVET</h1>
          <p className="text-sm text-gray-500">Resumen general del estado de la institución.</p>
        </div>

        {/* --- TARJETAS DE MÉTRICAS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Obra Metric */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-brand-50 rounded-xl dark:bg-brand-500/10">
                <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full dark:bg-green-500/10 dark:text-green-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                5.2%
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Obras en Bóveda</span>
              <h4 className="mt-1 font-bold text-gray-900 text-2xl dark:text-white">
                {isLoading ? "..." : stats?.totalObras || 0}
              </h4>
            </div>
          </div>

          {/* Libros Metric */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl dark:bg-blue-500/10">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full dark:bg-green-500/10 dark:text-green-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                1.1%
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Títulos en Biblioteca</span>
              <h4 className="mt-1 font-bold text-gray-900 text-2xl dark:text-white">
                {isLoading ? "..." : stats?.totalLibros || 0}
              </h4>
            </div>
          </div>

          {/* Visitas Metric */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-50 rounded-xl dark:bg-orange-500/10">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full dark:bg-green-500/10 dark:text-green-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                12.5%
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Visitantes este Mes</span>
              <h4 className="mt-1 font-bold text-gray-900 text-2xl dark:text-white">
                {isLoading ? "..." : stats?.visitantesMes || 0}
              </h4>
            </div>
          </div>

          {/* Eventos Metric */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-50 rounded-xl dark:bg-purple-500/10">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Eventos Programados</span>
              <h4 className="mt-1 font-bold text-gray-900 text-2xl dark:text-white">
                {isLoading ? "..." : stats?.totalEventosActivos || 0}
              </h4>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          {/* Actividades Recientes */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 dark:text-white text-lg">Próximos Eventos</h3>
              <Link to="/auditorio" className="text-sm text-brand-500 hover:text-brand-600 font-medium">Ver Auditorio</Link>
            </div>
            <div className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <div className="p-5 text-center text-gray-500">Cargando eventos...</div>
              ) : stats?.proximosEventos?.length === 0 ? (
                <div className="p-5 text-center text-gray-500">No hay eventos programados.</div>
              ) : stats?.proximosEventos?.map((evento: any) => {
                const dateObj = new Date(evento.fecha_solicitada);
                const month = dateObj.toLocaleString('es-ES', { month: 'short' }).toUpperCase();
                const day = dateObj.getDate().toString().padStart(2, '0');
                
                return (
                  <div key={evento.id_solicitud} className="p-5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{month}</span>
                      <span className="text-lg font-black text-brand-700 dark:text-brand-300">{day}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-base truncate">{evento.motivo_uso || "Evento MAVET"}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">Auditorio • {evento.hora_inicio || "Por definir"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Obras Recientes */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm flex flex-col">
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
                    <tr><td colSpan={3} className="py-4 text-center text-gray-500">Cargando obras...</td></tr>
                  ) : stats?.ultimasObras?.length === 0 ? (
                    <tr><td colSpan={3} className="py-4 text-center text-gray-500">No hay obras registradas.</td></tr>
                  ) : stats?.ultimasObras?.map((obra: any) => {
                    const isRestauracion = obra.EstadoObra?.nombre_estado === 'Restauración';
                    const isExcelente = obra.EstadoObra?.nombre_estado === 'Excelente';
                    
                    return (
                      <tr key={obra.id_obra}>
                        <td className="py-4 font-mono text-xs text-brand-600 dark:text-brand-400">{obra.codigo_inventario || `OBR-${obra.id_obra}`}</td>
                        <td className="py-4 font-medium truncate max-w-[150px]">{obra.titulo || "Sin Título"}</td>
                        <td className="py-4 text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${
                            isRestauracion ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                            isExcelente ? 'bg-green-50 text-green-700 border-green-200' : 
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {obra.EstadoObra?.nombre_estado || "Bueno"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
