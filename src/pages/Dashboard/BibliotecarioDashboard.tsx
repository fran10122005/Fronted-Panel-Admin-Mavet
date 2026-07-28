import { useState, useEffect } from "react";
import { mavetApi } from "../../services/api";
import { Link } from "react-router";
import Skeleton from "../../components/ui/Skeleton";
import PageMeta from "../../components/common/PageMeta";

export default function BibliotecarioDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [bibliotecaStats, setBibliotecaStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      mavetApi.getDashboardStats(),
      mavetApi.getEstadisticasBiblioteca(5)
    ]).then(([data, biblio]: any) => {
      if (data) setStats(data);
      if (biblio) setBibliotecaStats(biblio);
      setIsLoading(false);
    });
  }, []);

  return (
    <>
      <PageMeta title="Dashboard MAVET | Biblioteca" description="Panel de gestión de biblioteca del MAVET" />
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 data-tour="page-heading" className="text-2xl font-bold text-gray-900 dark:text-white">Panel de Biblioteca</h1>
          <p className="text-sm text-gray-500">Gestión de títulos, consultas y estadísticas de la biblioteca.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25 group">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl dark:from-indigo-500/10 dark:to-indigo-500/5 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-indigo-100/50 dark:border-indigo-500/10">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-indigo-700 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-200/50 dark:border-indigo-500/20">Catálogo</span>
            </div>
            <div>
              <span className="text-[11px] md:text-sm font-semibold text-gray-500 dark:text-gray-400">Títulos Registrados</span>
              <h4 className="mt-0.5 md:mt-1 font-extrabold text-gray-900 text-lg md:text-3xl dark:text-white tracking-tight drop-shadow-sm">
                {isLoading ? <Skeleton className="h-5 md:h-9 w-10 md:w-16" /> : stats?.totalLibros || 0}
              </h4>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25 group">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-green-50 to-green-100 rounded-xl dark:from-green-500/10 dark:to-green-500/5 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-green-100/50 dark:border-green-500/10">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-500/10 px-2.5 py-1 rounded-md border border-green-200/50 dark:border-green-500/20">Activas</span>
            </div>
            <div>
              <span className="text-[11px] md:text-sm font-semibold text-gray-500 dark:text-gray-400">Consultas en Sala</span>
              <h4 className="mt-0.5 md:mt-1 font-extrabold text-gray-900 text-lg md:text-3xl dark:text-white tracking-tight drop-shadow-sm">
                {isLoading ? <Skeleton className="h-5 md:h-9 w-10 md:w-16" /> : (bibliotecaStats?.totales?.activas ?? stats?.consultasActivas ?? 0)}
              </h4>
            </div>
          </div>

          <Link to="/biblioteca" className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-center items-center gap-2 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25 group cursor-pointer">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl dark:from-brand-500/10 dark:to-brand-500/5 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-brand-100/50 dark:border-brand-500/10">
              <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ir a Biblioteca</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 dark:text-white text-lg">Últimos Libros Registrados</h3>
              <Link to="/biblioteca" className="text-sm text-brand-500 hover:text-brand-600 font-medium">Ver todos</Link>
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
                        <p className="text-sm">No hay libros registrados.</p>
                      </td>
                    </tr>
                  ) : stats?.ultimosLibros?.map((libro: any) => (
                    <tr key={libro.id_libro} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-3.5 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{libro.unidad || `LIB-${libro.id_libro}`}</td>
                      <td className="py-3.5 font-medium truncate max-w-[150px]">{libro.titulo || "Sin Título"}</td>
                      <td className="py-3.5 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          libro.estado === 'Bueno' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:border-green-500/20' :
                          libro.estado === 'Regular' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20' :
                          'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:border-red-500/20'
                        }`}>{libro.estado || "Bueno"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 dark:text-white text-lg">Libros Más Consultados</h3>
              <span className="text-xs text-gray-400 font-medium">Top 5</span>
            </div>
            <div className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <div className="p-5 space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                      <Skeleton className="w-10 h-8 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : !bibliotecaStats?.topLibros?.length ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sin consultas registradas aún.</p>
                </div>
              ) : bibliotecaStats.topLibros.map((libro: any, idx: number) => (
                <div key={libro.id_libro || idx} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-500/10 dark:to-indigo-500/5 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                    <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{libro.titulo || "Sin título"}</p>
                  </div>
                  <div className="text-right shrink-0 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                    <p className="font-bold text-indigo-700 dark:text-indigo-400 text-base leading-none">{libro.total_consultas}</p>
                    <p className="text-[9px] text-indigo-500 dark:text-indigo-400 font-medium uppercase tracking-wider mt-1">consultas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
