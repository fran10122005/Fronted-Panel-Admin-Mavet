import { useState } from "react";
import { Modal } from "../../../components/ui/modal";
import { ResumenSemanalTrabajador } from "../../../types";
import toast from "react-hot-toast";

interface Props {
  trabajador: ResumenSemanalTrabajador | null;
  onClose: () => void;
  onSave: (idDia: string, texto: string) => Promise<void>;
}

export default function JustificacionModal({ trabajador: t, onClose, onSave }: Props) {
  const [texto, setTexto] = useState(t?.observaciones ?? "");
  const [guardando, setGuardando] = useState(false);

  if (!t) return null;

  const handleGuardar = async () => {
    if (!texto.trim()) {
      toast.error("Escribe una justificación antes de guardar");
      return;
    }
    setGuardando(true);
    try {
      for (const dia of t.dias) {
        if (dia.observaciones !== texto.trim()) {
          await onSave(dia.id, texto.trim());
        }
      }
      toast.success("Justificación guardada para todos los días de la semana");
      onClose();
    } catch {
      toast.error("Error al guardar justificación");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      isOpen={t !== null}
      onClose={onClose}
      showCloseButton={false}
      className="max-w-2xl p-0 overflow-hidden"
    >
      <div className="bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Justificar Horas
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {t.nombres} {t.apellidos} · {t.cedula} · {t.cargo || "Sin cargo"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Tabla de días */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Registro Semanal
            </h3>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 uppercase text-[11px] font-bold">
                    <th className="px-3 py-2">Fecha</th>
                    <th className="px-3 py-2 text-center">Entrada</th>
                    <th className="px-3 py-2 text-center">Salida</th>
                    <th className="px-3 py-2 text-center">Horas</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-100 dark:divide-gray-800">
                  {t.dias.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-gray-400 text-xs">
                        Sin registros esta semana
                      </td>
                    </tr>
                  ) : (
                    t.dias.map((d) => {
                      const entrada = d.entrada
                        ? new Date(d.entrada).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })
                        : "—";
                      const salida = d.salida
                        ? new Date(d.salida).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })
                        : "—";
                      return (
                        <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-3 py-2 font-mono text-xs text-gray-500">
                            {new Date(d.fecha + "T12:00:00").toLocaleDateString("es-VE", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </td>
                          <td className="px-3 py-2 text-center font-mono text-xs">
                            <span className={entrada !== "—" ? "text-green-700 dark:text-green-400 font-semibold" : "text-gray-300 dark:text-gray-600"}>
                              {entrada}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center font-mono text-xs">
                            <span className={salida !== "—" ? "text-red-600 dark:text-red-400 font-semibold" : "text-gray-300 dark:text-gray-600"}>
                              {salida}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center font-semibold text-xs">
                            {d.horas != null ? `${d.horas}h` : "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumen de horas */}
          <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Requiere:</span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{t.horas_semanales}h</span>
            </div>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Acumulado:</span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{t.horas_acumuladas}h</span>
            </div>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Faltan:</span>
              <span className={`text-sm font-bold ${t.horas_restantes > 0 ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"}`}>
                {t.horas_restantes}h
              </span>
            </div>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Estado:</span>
              {t.cumplio ? (
                <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">Completo</span>
              ) : (
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">Incompleto</span>
              )}
            </div>
          </div>

          {/* Textarea de justificación */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Justificación
            </label>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none resize-none"
              placeholder="Describe el motivo por el cual el trabajador no completó sus horas semanales..."
            />
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">
              Esta justificación se aplicará a todos los días de la semana del trabajador.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="px-5 py-2 text-xs font-semibold text-white bg-brand-500 rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {guardando ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando...
              </>
            ) : (
              "Guardar Justificación"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
