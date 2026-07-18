import { useState, useMemo } from "react";
import { Modal } from "../../../components/ui/modal";
import { ResumenSemanalTrabajador, DiaResumen, TipoJustificacion } from "../../../types";
import toast from "react-hot-toast";

const TIPOS_JUSTIFICACION: { value: TipoJustificacion; label: string; color: string }[] = [
  { value: "medica", label: "Médica", color: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400" },
  { value: "personal", label: "Personal", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400" },
  { value: "permiso", label: "Permiso", color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400" },
  { value: "lottt", label: "LOTTT / Festivo", color: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400" },
  { value: "otro", label: "Otro", color: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400" },
];

const TIPO_LABEL: Record<TipoJustificacion, string> = {
  medica: "Médica",
  personal: "Personal",
  permiso: "Permiso",
  lottt: "LOTTT / Festivo",
  otro: "Otro",
};

interface DiaEdit {
  id: string;
  fecha: string;
  entrada: string | null;
  salida: string | null;
  horasReales: number | null;
  horasJustificadas: number | null;
  tipo: TipoJustificacion | null;
  observaciones: string;
  habilitado: boolean;
}

interface Props {
  trabajador: ResumenSemanalTrabajador | null;
  onClose: () => void;
  onSave: (id: string, observaciones: string, horas_justificadas: number, tipo_justificacion: TipoJustificacion) => Promise<void>;
}

export default function JustificacionModal({ trabajador: t, onClose, onSave }: Props) {
  const initialDias = useMemo(() => {
    if (!t) return [];
    return t.dias.map((d) => ({
      id: d.id,
      fecha: d.fecha,
      entrada: d.entrada,
      salida: d.salida,
      horasReales: d.horas,
      horasJustificadas: d.horas_justificadas,
      tipo: d.tipo_justificacion || null,
      observaciones: d.observaciones || "",
      habilitado: false,
    }));
  }, [t]);

  const [dias, setDias] = useState<DiaEdit[]>(initialDias);
  const [guardando, setGuardando] = useState(false);

  if (!t) return null;

  const horasReales = dias.reduce((sum, d) => sum + (d.horasReales || 0), 0);
  const horasJustif = dias.reduce((sum, d) => sum + (d.horasJustificadas || 0), 0);
  const totalAcumulado = horasReales + horasJustif;
  const restantes = Math.max(0, t.horas_semanales - totalAcumulado);
  const cumplio = restantes <= 0;

  const toggleDia = (idx: number) => {
    setDias((prev) => {
      const next = [...prev];
      const d = { ...next[idx] };
      if (!d.habilitado) {
        d.habilitado = true;
        d.tipo = "personal";
        d.horasJustificadas = t.horas_semanales / 5;
        d.observaciones = "";
      } else {
        d.habilitado = false;
        d.tipo = null;
        d.horasJustificadas = null;
        d.observaciones = "";
      }
      next[idx] = d;
      return next;
    });
  };

  const updateDia = (idx: number, upd: Partial<DiaEdit>) => {
    setDias((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...upd };
      return next;
    });
  };

  const handleGuardar = async () => {
    const selected = dias.filter((d) => d.habilitado);
    if (selected.length === 0) {
      toast.error("Seleccione al menos un día para justificar");
      return;
    }

    for (const d of selected) {
      if (!d.observaciones.trim()) {
        toast.error(`El día ${new Date(d.fecha + "T12:00:00").toLocaleDateString("es-VE", { day: "numeric", month: "short" })} necesita una descripción`);
        return;
      }
      if (!d.horasJustificadas || d.horasJustificadas <= 0) {
        toast.error(`Indique las horas a justificar para el día seleccionado`);
        return;
      }
    }

    setGuardando(true);
    try {
      for (const d of selected) {
        await onSave(d.id, d.observaciones.trim(), d.horasJustificadas!, d.tipo || "otro");
      }
      toast.success(`${selected.length} día(s) justificado(s) correctamente`);
      onClose();
    } catch {
      toast.error("Error al guardar justificaciones");
    } finally {
      setGuardando(false);
    }
  };

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha + "T12:00:00");
    return {
      diaSemana: d.toLocaleDateString("es-VE", { weekday: "long" }),
      fechaStr: d.toLocaleDateString("es-VE", { day: "numeric", month: "short" }),
    };
  };

  const getStatusBadge = (d: DiaEdit) => {
    if (d.horasJustificadas && d.tipo) {
      const tipo = TIPOS_JUSTIFICACION.find((t) => t.value === d.tipo);
      return (
        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tipo?.color || ""}`}>
          {TIPO_LABEL[d.tipo]}
        </span>
      );
    }
    if (d.horasReales && d.horasReales > 0) {
      return (
        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400">
          Asistió
        </span>
      );
    }
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400">
        Ausente
      </span>
    );
  };

  const horasPorDia = t.horas_semanales / 5;

  return (
    <Modal isOpen={t !== null} onClose={onClose} showCloseButton={false} className="max-w-3xl p-0 overflow-hidden">
      <div className="bg-white dark:bg-gray-900 max-h-[90vh] flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Justificar Inasistencia</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {t.nombres} {t.apellidos} · {t.cedula} · {t.cargo || "Sin cargo"}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-5 overflow-y-auto flex-1">
          <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Requiere:</span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{t.horas_semanales}h</span>
            </div>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Asistidas:</span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{Math.round(horasReales * 100) / 100}h</span>
            </div>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Justificadas:</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{Math.round(horasJustif * 100) / 100}h</span>
            </div>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Restantes:</span>
              <span className={`text-sm font-bold ${cumplio ? "text-green-600" : "text-amber-600 dark:text-amber-400"}`}>{Math.round(restantes * 100) / 100}h</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Días de la semana</h3>
            {dias.map((d, idx) => {
              const { diaSemana, fechaStr } = formatFecha(d.fecha);
              const editable = !d.horasReales || d.horasReales < horasPorDia;
              return (
                <div key={d.id} className={`rounded-xl border transition-colors ${
                  d.habilitado
                    ? "border-brand-300 dark:border-brand-700 bg-brand-50/50 dark:bg-brand-950/20"
                    : "border-gray-200 dark:border-gray-700"
                }`}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={d.habilitado}
                      onChange={() => toggleDia(idx)}
                      disabled={!editable && !d.habilitado}
                      className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/30 disabled:opacity-40"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize">{diaSemana}</span>
                        <span className="text-xs text-gray-400">{fechaStr}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {getStatusBadge(d)}
                        {d.horasReales && (
                          <span className="text-[10px] text-gray-500">{d.horasReales}h trabajadas</span>
                        )}
                        {d.horasJustificadas && d.habilitado && (
                          <span className="text-[10px] text-blue-600 dark:text-blue-400">{d.horasJustificadas}h justificadas</span>
                        )}
                      </div>
                    </div>
                    {d.entrada && (
                      <div className="text-[10px] text-gray-400 text-right leading-tight">
                        <div>Ent: {new Date(d.entrada).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}</div>
                        <div>Sal: {d.salida ? new Date(d.salida).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" }) : "—"}</div>
                      </div>
                    )}
                  </div>

                  {d.habilitado && (
                    <div className="px-4 pb-4 space-y-3 border-t border-brand-200 dark:border-brand-800 pt-3 mt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Tipo</label>
                          <select
                            value={d.tipo || ""}
                            onChange={(e) => updateDia(idx, { tipo: e.target.value as TipoJustificacion })}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                          >
                            {TIPOS_JUSTIFICACION.map((t) => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Horas a justificar</label>
                          <input
                            type="number"
                            min={0.25}
                            max={horasPorDia}
                            step={0.25}
                            value={d.horasJustificadas || ""}
                            onChange={(e) => updateDia(idx, { horasJustificadas: parseFloat(e.target.value) || 0 })}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Horas requeridas</label>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">{horasPorDia}h por día</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Descripción</label>
                        <textarea
                          value={d.observaciones}
                          onChange={(e) => updateDia(idx, { observaciones: e.target.value })}
                          rows={2}
                          placeholder="Describa el motivo de la justificación..."
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 flex justify-end gap-2.5">
          <button onClick={onClose} className="px-5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
          <button onClick={handleGuardar} disabled={guardando}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-brand-500 rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-60">
            {guardando ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              `Guardar (${dias.filter((d) => d.habilitado).length} día${dias.filter((d) => d.habilitado).length !== 1 ? "s" : ""})`
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
