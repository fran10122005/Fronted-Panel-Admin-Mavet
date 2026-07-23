import { useState, useEffect } from "react";
import { mavetApi } from "../../services/api";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import { limitNumericInput } from "../../utils/validation";
import PageHeader from "../../components/common/PageHeader";
import Tabs from "../../components/ui/Tabs";

const Ingresos: React.FC = () => {
  const [pestanaActiva, setPestanaActiva] = useState<"visitantes" | "trabajadores">("visitantes");
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (pestanaActiva === "visitantes") {
      cargarEstadisticas();
    }
  }, [pestanaActiva]);

  const cargarEstadisticas = async () => {
    setIsLoading(true);
    try {
      const data = await mavetApi.getIngresosStats();
      setStats(data);
    } catch (error) {
      console.error("Error cargando estadísticas", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registro de Ingresos"
        subtitle="Control de visitas y registro de entrada/salida del personal."
        actions={
          pestanaActiva === "visitantes" && (
            <button onClick={cargarEstadisticas} className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium hover:underline">
              Actualizar Datos
            </button>
          )
        }
      />

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        <Tabs
          variant="underline"
          fullWidth
          tabs={[
            { id: "visitantes", label: "Dashboard Visitantes" },
            { id: "trabajadores", label: "Reloj de Trabajadores" },
          ]}
          activeTab={pestanaActiva}
          onChange={(id) => setPestanaActiva(id as "visitantes" | "trabajadores")}
        />

        <div className="p-5">
          {pestanaActiva === "visitantes" ? (
            <div>
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <LoadingSkeleton variant="table" rows={4} cols={3} />
                </div>
              ) : stats ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-5 bg-gray-50 dark:bg-gray-800/50">
                      <h4 className="text-[10px] sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Visitas de Hoy</h4>
                      <p className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.visitasHoy}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-5 bg-gray-50 dark:bg-gray-800/50">
                      <h4 className="text-[10px] sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Visitantes Únicos</h4>
                      <p className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalVisitantesUnicos}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-5 bg-gray-50 dark:bg-gray-800/50 col-span-2 sm:col-span-1">
                      <h4 className="text-[10px] sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Total Visitas</h4>
                      <p className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalVisitasHistoricas}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Ingresos por Motivo</h4>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-x-auto">
                      {stats.porMotivo.length > 0 ? (
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50">
                              <th className="py-2.5 px-4 font-medium text-sm text-gray-700 dark:text-gray-300">Motivo</th>
                              <th className="py-2.5 px-4 font-medium text-sm text-gray-700 dark:text-gray-300 w-32">Cantidad</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {stats.porMotivo.map((item: any, idx: number) => (
                              <tr key={idx} className="text-sm text-gray-800 dark:text-gray-200">
                                <td className="py-2.5 px-4">{item.motivo}</td>
                                <td className="py-2.5 px-4 font-semibold text-brand-600 dark:text-brand-400">{item.cantidad}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-6 text-center text-gray-500 text-sm">No hay registros suficientes.</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-red-500">Error al cargar estadísticas</div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-w-lg mx-auto">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Cédula del Trabajador</label>
                <input type="text" placeholder="Ingrese número de cédula" onKeyDown={limitNumericInput}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white/90" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 py-3 font-medium text-white transition-colors text-sm">
                  Marcar Entrada
                </button>
                <button className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 py-3 font-medium text-white transition-colors text-sm">
                  Marcar Salida
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ingresos;
