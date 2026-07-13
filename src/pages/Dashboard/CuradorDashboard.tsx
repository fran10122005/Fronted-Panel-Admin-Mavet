import { useState, useEffect } from "react";
import { mavetApi } from "../../services/api";
import { Link } from "react-router";
import Skeleton from "../../components/ui/Skeleton";
import PageMeta from "../../components/common/PageMeta";

export default function CuradorDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mavetApi.getDashboardStats().then((data: any) => {
      if (data) setStats(data);
      setIsLoading(false);
    });
  }, []);

  const estadoCounts = stats?.ultimasObras?.reduce((acc: Record<string, number>, obra: any) => {
    const estado = obra.EstadoObra?.nombre_estado || "Bueno";
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <PageMeta title="Dashboard MAVET | Bóveda" description="Panel de inventario y conservación de obras del MAVET" />
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panel de Bóveda</h1>
          <p className="text-sm text-gray-500">Inventario de obras, conservación y estado de la colección.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25 group">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl dark:from-brand-500/10 dark:to-brand-500/5 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-brand-100/50 dark:border-brand-500/10">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-500/10 px-2.5 py-1 rounded-md border border-green-200/50 dark:border-green-500/20">Total</span>
            </div>
            <div>
              <span className="text-[11px] md:text-sm font-semibold text-gray-500 dark:text-gray-400">Obras en Bóveda</span>
              <h4 className="mt-0.5 md:mt-1 font-extrabold text-gray-900 text-lg md:text-3xl dark:text-white tracking-tight drop-shadow-sm">
                {isLoading ? <Skeleton className="h-5 md:h-9 w-10 md:w-16" /> : stats?.totalObras || 0}
              </h4>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25 group">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl dark:from-amber-500/10 dark:to-amber-500/5 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-amber-100/50 dark:border-amber-500/10">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-200/50 dark:border-amber-500/20">Requiere atención</span>
            </div>
            <div>
              <span className="text-[11px] md:text-sm font-semibold text-gray-500 dark:text-gray-400">En Restauración</span>
              <h4 className="mt-0.5 md:mt-1 font-extrabold text-gray-900 text-lg md:text-3xl dark:text-white tracking-tight drop-shadow-sm">
                {isLoading ? <Skeleton className="h-5 md:h-9 w-10 md:w-16" /> : (estadoCounts?.Restauración || 0)}
              </h4>
            </div>
          </div>

          <Link to="/inventario-obras" className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm flex flex-col justify-center items-center gap-2 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25 group cursor-pointer">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl dark:from-brand-500/10 dark:to-brand-500/5 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-brand-100/50 dark:border-brand-500/10">
              <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ir a Bóveda</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-brand-500/25">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 dark:text-white text-lg">Últimas Obras Registradas</h3>
            <Link to="/inventario-obras" className="text-sm text-brand-500 hover:text-brand-600 font-medium">Ver todas</Link>
          </div>
          <div className="p-5 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 font-medium uppercase">Código</th>
                  <th className="pb-3 font-medium uppercase">Título</th>
                  <th className="pb-3 font-medium uppercase">Técnica</th>
                  <th className="pb-3 font-medium uppercase text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i}>
                      <td className="py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="py-4"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></td>
                    </tr>
                  ))
                ) : stats?.ultimasObras?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      <p className="text-sm">No hay obras registradas en Bóveda.</p>
                    </td>
                  </tr>
                ) : stats?.ultimasObras?.map((obra: any) => (
                  <tr key={obra.id_obra} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3.5 font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold">{obra.codigo_inventario || `OBR-${obra.id_obra}`}</td>
                    <td className="py-3.5 font-medium truncate max-w-[150px]">{obra.titulo || "Sin Título"}</td>
                    <td className="py-3.5 text-gray-500 dark:text-gray-400">{obra.TecnicaObra?.nombre_tecnica || "—"}</td>
                    <td className="py-3.5 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        obra.EstadoObra?.nombre_estado === 'Restauración' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20' :
                        obra.EstadoObra?.nombre_estado === 'Excelente' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:border-green-500/20' :
                        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20'
                      }`}>{obra.EstadoObra?.nombre_estado || "Bueno"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
