import React, { useState, useEffect } from "react";
import { mavetApi } from "../../services/api";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import { limitNumericInput } from "../../utils/validation";

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
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke py-2 px-6.5 dark:border-strokedark flex justify-between items-center">
        <h3 className="font-medium text-black dark:text-white">
          Registro de Ingresos - MAVET
        </h3>
        {pestanaActiva === "visitantes" && (
          <button onClick={cargarEstadisticas} className="text-sm text-primary hover:underline">
            Actualizar Datos
          </button>
        )}
      </div>

      {/* Controles de Pestañas */}
      <div className="flex border-b border-stroke dark:border-strokedark">
        <button
          className={`w-1/2 py-2 font-medium ${
            pestanaActiva === "visitantes"
              ? "text-primary border-b-2 border-primary"
              : "text-bodydark hover:text-black dark:hover:text-white"
          }`}
          onClick={() => setPestanaActiva("visitantes")}
        >
          📊 Dashboard Visitantes
        </button>
        <button
          className={`w-1/2 py-2 font-medium ${
            pestanaActiva === "trabajadores"
              ? "text-primary border-b-2 border-primary"
              : "text-bodydark hover:text-black dark:hover:text-white"
          }`}
          onClick={() => setPestanaActiva("trabajadores")}
        >
          💼 Reloj de Trabajadores
        </button>
      </div>

      {/* Área del Formulario / Dashboard */}
      <div className="p-6.5">
        {pestanaActiva === "visitantes" ? (
          // Dashboard para Visitantes
          <div>
            {isLoading ? (
              <div className="flex justify-center items-center">
                <LoadingSkeleton variant="table" rows={8} cols={6} />
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cards de Resumen */}
                <div className="rounded border border-stroke p-5 bg-gray-50 dark:border-strokedark dark:bg-meta-4">
                  <h4 className="text-sm font-medium text-bodydark2 mb-1">Visitas de Hoy</h4>
                  <p className="text-3xl font-bold text-black dark:text-white">{stats.visitasHoy}</p>
                </div>
                
                <div className="rounded border border-stroke p-5 bg-gray-50 dark:border-strokedark dark:bg-meta-4">
                  <h4 className="text-sm font-medium text-bodydark2 mb-1">Visitantes Únicos (Histórico)</h4>
                  <p className="text-3xl font-bold text-black dark:text-white">{stats.totalVisitantesUnicos}</p>
                </div>

                <div className="rounded border border-stroke p-5 bg-gray-50 dark:border-strokedark dark:bg-meta-4">
                  <h4 className="text-sm font-medium text-bodydark2 mb-1">Total Visitas (Histórico)</h4>
                  <p className="text-3xl font-bold text-black dark:text-white">{stats.totalVisitasHistoricas}</p>
                </div>

                {/* Gráfico/Lista por Motivo */}
                <div className="col-span-1 md:col-span-3 mt-4">
                  <h4 className="font-semibold text-black dark:text-white mb-4">Ingresos por Motivo</h4>
                  <div className="rounded border border-stroke dark:border-strokedark overflow-x-auto">
                    {stats.porMotivo.length > 0 ? (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-2 text-left dark:bg-meta-4">
                            <th className="py-2 px-4 font-medium text-black dark:text-white">Motivo</th>
                            <th className="py-2 px-4 font-medium text-black dark:text-white w-32">Cantidad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.porMotivo.map((item: any, idx: number) => (
                            <tr key={idx} className="border-t border-stroke dark:border-strokedark">
                              <td className="py-2 px-4">{item.motivo}</td>
                              <td className="py-2 px-4 font-semibold text-primary">{item.cantidad}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-6 text-center text-bodydark2">No hay registros suficientes.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-danger">Error al cargar estadísticas</div>
            )}
          </div>
        ) : (
          // Formulario para Trabajadores
          <div className="flex flex-col gap-4 max-w-lg mx-auto">
            <div>
              <label className="mb-2.5 block text-black dark:text-white">Cédula del Trabajador</label>
              <input type="text" placeholder="Ingrese número de cédula" onKeyDown={limitNumericInput} className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
            </div>
            <div className="flex gap-4 mt-2">
              <button className="flex w-1/2 justify-center rounded bg-success p-3 font-medium text-white hover:bg-opacity-90 transition">
                Marcar Entrada
              </button>
              <button className="flex w-1/2 justify-center rounded bg-danger p-3 font-medium text-white hover:bg-opacity-90 transition">
                Marcar Salida
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ingresos;
