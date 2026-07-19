import { useState } from "react";
import { Modal } from "../../../components/ui/modal";
import { FileText, X, Download, Calendar, Info } from "lucide-react";

interface ExportarAsistenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (params: { rango: "mes" | "custom", fechaInicio?: string, fechaFin?: string }) => void;
}

const baseInputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all";

export default function ExportarAsistenciaModal({
  isOpen, onClose, onExport,
}: ExportarAsistenciaModalProps) {
  const [rango, setRango] = useState<"mes" | "custom">("mes");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const handleExport = () => {
    if (rango === "custom" && (!fechaInicio || !fechaFin)) return;
    onExport({ rango, fechaInicio, fechaFin });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-0">
      <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10">
              <FileText className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exportar Asistencia</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Generar reporte PDF de asistencias</p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 space-y-4 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            Rango de Fechas
          </div>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input type="radio" name="rango" value="mes" checked={rango === "mes"}
                onChange={() => setRango("mes")}
                className="w-4 h-4 text-brand-500 focus:ring-brand-500/30" />
              <div>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Mes actual completo</span>
                <p className="text-xs text-gray-500">Todo el mes en curso</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input type="radio" name="rango" value="custom" checked={rango === "custom"}
                onChange={() => setRango("custom")}
                className="w-4 h-4 text-brand-500 focus:ring-brand-500/30" />
              <div>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Rango personalizado</span>
                <p className="text-xs text-gray-500">Seleccione fechas específicas</p>
              </div>
            </label>
          </div>

          {rango === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}
                  className={baseInputCls + " pl-10"} />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
                  className={baseInputCls + " pl-10"} />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">El documento PDF se generará agrupando las asistencias por semanas e incluyendo el cargo de cada trabajador.</p>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 flex justify-end gap-3">
        <button onClick={onClose}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <X className="w-4 h-4" />
          Cancelar
        </button>
        <button onClick={handleExport}
          disabled={rango === "custom" && (!fechaInicio || !fechaFin)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <Download className="w-4 h-4" />
          Generar PDF
        </button>
      </div>
    </Modal>
  );
}
