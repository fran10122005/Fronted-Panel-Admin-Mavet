import { useState, useEffect, useRef, useCallback } from "react";
import { Modal } from "./ui/modal";
import { mavetApi } from "../services/api";
import { limitNumericInput } from "../utils/validation";
import { Html5Qrcode } from "html5-qrcode";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type TipoMovimiento = "Entrada" | "Salida";

interface EstadoAsistencia {
  trabajador: { nombres: string; apellidos: string; cedula: string };
  siguienteMovimiento: string | null;
  entradaActual: string | null;
  horasTranscurridas: number | null;
  asistencia: {
    entrada_manana: string | null;
    salida_manana: string | null;
    horas_cumplidas_dia: number | null;
  } | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Constantes de UI ─────────────────────────────────────────────────────────

const ETIQUETA: Record<string, { label: string; color: "green" | "red" }> = {
  "Entrada": { label: "Entrada", color: "green" },
  "Salida":  { label: "Salida",  color: "red"   },
};

const BTN_COLOR: Record<string, string> = {
  green:  "border-green-500 bg-green-50 dark:bg-green-900/10 hover:bg-green-500 hover:text-white text-green-800 dark:text-green-400",
  red:    "border-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-500 hover:text-white text-red-800 dark:text-red-400",
};

const CAMPO_LABELS: Record<string, string> = {
  entrada_manana: "Entrada",
  salida_manana:  "Salida",
};

const CAMPO_COLORS: Record<string, string> = {
  entrada_manana: "text-green-700 dark:text-green-400",
  salida_manana:  "text-red-600 dark:text-red-400",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatHoras(h: number): string {
  const totalMinutos = Math.floor(h * 60);
  const hrs = Math.floor(totalMinutos / 60);
  const min = totalMinutos % 60;
  if (hrs === 0) return `${min} min`;
  if (min === 0) return `${hrs}h`;
  return `${hrs}h ${min}min`;
}

// ─── Sub-componente escáner ───────────────────────────────────────────────────
// Se monta con un id único cada vez para evitar que Html5Qrcode reutilice
// un elemento DOM corrupto de una sesión anterior.

interface QRScannerProps {
  onScan: (text: string) => void;
}

function QRScannerPane({ onScan }: QRScannerProps) {
  const elementId = useRef(`qr-${Math.random().toString(36).slice(2)}`).current;
  const scanner = useRef<Html5Qrcode | null>(null);
  const started = useRef(false);

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        const html5QrCode = new Html5Qrcode(elementId);
        scanner.current = html5QrCode;

        const cameras = await Html5Qrcode.getCameras();
        if (!mounted || cameras.length === 0) return;

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 230, height: 230 } },
          (decodedText) => {
            if (mounted) onScan(decodedText);
          },
          () => { /* frame errors are normal */ }
        );
        started.current = true;
      } catch (err) {
        console.error("QR scanner error:", err);
      }
    };

    // Pequeño delay para que el DOM esté disponible
    const t = setTimeout(start, 150);

    return () => {
      mounted = false;
      clearTimeout(t);
      if (scanner.current && started.current) {
        scanner.current.stop().catch(() => {}).finally(() => {
          scanner.current?.clear().catch(() => {});
          scanner.current = null;
          started.current = false;
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-sm rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div id={elementId} className="w-full" />
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AsistenciaModal({ isOpen, onClose }: Props) {
  const [cedula, setCedula]           = useState("");
  const [mode, setMode]               = useState<"manual" | "qr">("qr");
  const [scanKey, setScanKey]         = useState(0);          // fuerza remontado del escáner
  const [scanned, setScanned]         = useState<string | null>(null);
  const [estado, setEstado]           = useState<EstadoAsistencia | null>(null);
  const [isConsultando, setIsConsultando] = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [alert, setAlert]             = useState<{ msg: string; ok: boolean } | null>(null);

  // Reset completo al abrir/cerrar
  useEffect(() => {
    if (!isOpen) {
      setCedula("");
      setMode("qr");
      setScanned(null);
      setEstado(null);
      setAlert(null);
      setScanKey((k) => k + 1); // garantiza que el escáner siguiente sea fresco
    }
  }, [isOpen]);

  const showAlert = useCallback((msg: string, ok: boolean) => {
    setAlert({ msg, ok });
    setTimeout(() => setAlert(null), 5000);
  }, []);

  const consultarEstado = useCallback(async (params: { qr_uuid?: string; cedulaTrabajador?: string }) => {
    setIsConsultando(true);
    setEstado(null);
    try {
      const data = await mavetApi.getEstadoAsistencia(params);
      setEstado(data);
    } catch (err: any) {
      showAlert(err.message || "Trabajador no encontrado.", false);
      setScanned(null);
    } finally {
      setIsConsultando(false);
    }
  }, [showAlert]);

  // Cuando se escanea el QR, consultar estado automáticamente
  const handleScan = useCallback((text: string) => {
    setScanned(text);
    consultarEstado({ qr_uuid: text });
  }, [consultarEstado]);

  const handleConsultarManual = useCallback(() => {
    if (!cedula.trim()) { showAlert("Ingrese su número de cédula.", false); return; }
    consultarEstado({ cedulaTrabajador: cedula.trim() });
  }, [cedula, consultarEstado, showAlert]);

  const handleRegistro = useCallback(async () => {
    if (!estado?.siguienteMovimiento) return;
    setIsSubmitting(true);
    try {
      const payload: any = { tipoMovimiento: estado.siguienteMovimiento };
      if (mode === "manual") payload.cedulaTrabajador = cedula;
      else payload.qr_uuid = scanned;

      await mavetApi.registrarAsistencia(payload);
      const etiqueta = ETIQUETA[estado.siguienteMovimiento]?.label ?? estado.siguienteMovimiento;
      showAlert(`${etiqueta} registrada para ${estado.trabajador.nombres} ${estado.trabajador.apellidos}.`, true);
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      showAlert(err.message || "Error al registrar asistencia.", false);
      setScanned(null);
      setEstado(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [estado, mode, cedula, scanned, showAlert, onClose]);

  const resetScan = useCallback(() => {
    setScanned(null);
    setEstado(null);
    setScanKey((k) => k + 1); // remonta el escáner limpio
  }, []);

  // Derivados de UI
  const siguiente = estado?.siguienteMovimiento ?? null;
  const meta      = siguiente ? ETIQUETA[siguiente] : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className="p-2">
        {/* ── Header ── */}
        <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Registro de Asistencia</h2>
            <p className="text-sm text-gray-500">Personal del Museo MAVET</p>
          </div>
        </div>

        {/* ── Alerta ── */}
        {alert && (
          <div className={`mb-5 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm animate-fade-in ${
            alert.ok
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
          }`}>
            <span>{alert.ok ? "✅" : "⚠️"}</span>
            <span className="font-semibold text-sm">{alert.msg}</span>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => { setMode("qr"); setCedula(""); resetScan(); }}
            className={`px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm ${
              mode === "qr" ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Escanear QR
          </button>
          <button
            onClick={() => { setMode("manual"); resetScan(); }}
            className={`px-5 py-2 rounded-lg font-bold transition-colors text-sm ${
              mode === "manual" ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            Ingreso Manual
          </button>
        </div>

        {/* ── Zona de escaneo / manual ── */}
        <div className="mb-6">
          {/* MODO QR */}
          {mode === "qr" && (
            <div className="flex flex-col items-center justify-center animate-fade-in">
              {isConsultando ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Consultando trabajador...</p>
                </div>
              ) : !scanned ? (
                // key={scanKey} garantiza que el DOM del escáner siempre esté limpio
                <QRScannerPane key={scanKey} onScan={handleScan} />
              ) : null}
            </div>
          )}

          {/* MODO MANUAL */}
          {mode === "manual" && !estado && !isConsultando && (
            <div className="animate-fade-in max-w-md mx-auto">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Número de Cédula
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  onKeyDown={(e) => { limitNumericInput(e); if (e.key === "Enter") handleConsultarManual(); }}
                  className="flex-1 px-4 py-3 text-lg font-bold text-center border-2 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:border-brand-500 focus:ring-0 outline-none"
                  placeholder="Ej. V-12345678"
                />
                <button
                  onClick={handleConsultarManual}
                  className="px-4 py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition"
                >
                  Buscar
                </button>
              </div>
            </div>
          )}

          {mode === "manual" && isConsultando && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Consultando...</p>
            </div>
          )}
        </div>

        {/* ── Panel del trabajador ── */}
        {estado && (
          <div className="animate-fade-in space-y-4">
            {/* Info trabajador */}
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white truncate">
                  {estado.trabajador.nombres} {estado.trabajador.apellidos}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{estado.trabajador.cedula}</p>
              </div>
              <button
                onClick={resetScan}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline shrink-0"
              >
                {mode === "qr" ? "Volver a escanear" : "Cambiar cédula"}
              </button>
            </div>

            {/* Tiempo en jornada */}
            {estado.horasTranscurridas !== null && estado.entradaActual && (
              <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
                <span className="text-amber-500 text-xl">⏱️</span>
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Tiempo en jornada:{" "}
                    <span className="text-lg font-bold">{formatHoras(estado.horasTranscurridas)}</span>
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Desde las{" "}
                    {new Date(estado.entradaActual).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            )}

            {/* Botón de acción */}
            {siguiente && meta ? (
              <button
                onClick={handleRegistro}
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-3 p-5 border-2 rounded-xl transition-all font-bold text-lg ${BTN_COLOR[meta.color]} disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {meta.color === "green" || meta.color === "blue" ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    )}
                    Registrar {meta.label}
                  </>
                )}
              </button>
            ) : (
              <div className="w-full text-center bg-gray-100 dark:bg-gray-800 rounded-xl p-5 border-2 border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-gray-500 dark:text-gray-400 font-semibold">✅ Jornada completa registrada</p>
                <p className="text-sm text-gray-400 mt-1">No hay más movimientos pendientes por hoy.</p>
              </div>
            )}

            {/* Resumen de movimientos del día */}
            {estado.asistencia && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(["entrada_manana", "salida_manana"] as const).map((campo) => {
                  const valor = (estado.asistencia as any)?.[campo];
                  return (
                    <div
                      key={campo}
                      className={`rounded-lg px-3 py-2 flex items-center gap-2 ${
                        valor
                          ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                          : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <span>{valor ? "✅" : "⬜"}</span>
                      <div>
                        <p className={`font-semibold ${valor ? CAMPO_COLORS[campo] : "text-gray-400"}`}>
                          {CAMPO_LABELS[campo]}
                        </p>
                        {valor && (
                          <p className="text-gray-500 dark:text-gray-400">
                            {new Date(valor).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
