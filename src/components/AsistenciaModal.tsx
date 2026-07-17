import { useState, useEffect, useRef, useCallback } from "react";
import { Modal } from "./ui/modal";
import { mavetApi } from "../services/api";
import { formatHoras, normalizeCedula } from "../utils/formatters";
import { limitNumericInput } from "../utils/validation";
import { Html5Qrcode } from "html5-qrcode";
import PinDisplay from "./pin/PinDisplay";
import PinKeypad from "./pin/PinKeypad";
import ConfirmacionScreen from "./pin/ConfirmacionScreen";
import FaceVerificationModal from "./asistencia/FaceVerificationModal";
import type { PinVerificarResponse } from "../types";

interface EstadoAsistencia {
  trabajador: { nombres: string; apellidos: string; cedula: string; id: string };
  siguienteMovimiento: string | null;
  entradaActual: string | null;
  horasTranscurridas: number | null;
  tienePin: boolean;
  usarFacial: boolean;
  descriptorFacial?: string | null;
  asistencia: {
    entrada_manana: string | null;
    salida_manana: string | null;
    horas_cumplidas_dia: number | null;
  } | null;
}

type Step = "scan" | "pin" | "confirm" | "cambiar-pin";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PIN_MIN = 4;
const PIN_MAX = 6;

const CAMPO_LABELS: Record<string, string> = {
  entrada_manana: "Entrada",
  salida_manana: "Salida",
};

const CAMPO_COLORS: Record<string, string> = {
  entrada_manana: "text-green-700 dark:text-green-400",
  salida_manana: "text-red-600 dark:text-red-400",
};

function parsearQRData(text: string): { cedula: string } | null {
  const partes = text.split("|");
  if (partes.length >= 2 && partes[0] === "MAVET") {
    return { cedula: partes[1] };
  }
  return null;
}

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
          () => {}
        );
        started.current = true;
      } catch (err) {
        console.error("QR scanner error:", err);
      }
    };
    const t = setTimeout(start, 150);
    return () => {
      mounted = false;
      clearTimeout(t);
      if (scanner.current && started.current) {
        scanner.current.stop().catch(() => {}).finally(() => {
          const s = scanner.current;
          scanner.current = null;
          started.current = false;
          if (s) s.clear().catch(() => {});
        });
      }
    };
  }, [elementId, onScan]);

  return (
    <div className="w-full max-w-sm rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div id={elementId} className="w-full" />
    </div>
  );
}

export default function AsistenciaModal({ isOpen, onClose }: Props) {
  const [cedula, setCedula] = useState("");
  const [mode, setMode] = useState<"manual" | "qr">("qr");
  const [scanKey, setScanKey] = useState(0);
  const [scanned, setScanned] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoAsistencia | null>(null);
  const [isConsultando, setIsConsultando] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ msg: string; ok: boolean } | null>(null);

  const [step, setStep] = useState<Step>("scan");
  const [pinValue, setPinValue] = useState("");
  const [pinIntentos, setPinIntentos] = useState(0);
  const [pinBloqueado, setPinBloqueado] = useState(false);
  const [pinToken, setPinToken] = useState<string | null>(null);
  const [pinData, setPinData] = useState<PinVerificarResponse | null>(null);

  const [pinActualInput, setPinActualInput] = useState("");
  const [pinNuevoInput, setPinNuevoInput] = useState("");
  const [pinConfirmInput, setPinConfirmInput] = useState("");
  const [pinCambioStep, setPinCambioStep] = useState<"actual" | "nuevo" | "confirmar">("actual");

  const [isFacialOpen, setIsFacialOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      resetAll();
    }
  }, [isOpen]);

  const resetAll = useCallback(() => {
    setCedula("");
    setMode("qr");
    setScanned(null);
    setEstado(null);
    setAlert(null);
    setScanKey((k) => k + 1);
    setStep("scan");
    setPinValue("");
    setPinIntentos(0);
    setPinBloqueado(false);
    setPinToken(null);
    setPinData(null);
    setPinActualInput("");
    setPinNuevoInput("");
    setPinConfirmInput("");
    setPinCambioStep("actual");
    setIsFacialOpen(false);
    setIsConsultando(false);
    setIsSubmitting(false);
  }, []);

  const showAlert = useCallback((msg: string, ok: boolean) => {
    setAlert({ msg, ok });
    setTimeout(() => setAlert(null), 6000);
  }, []);

  const consultarEstado = useCallback(async (params: { qr_uuid?: string; cedulaTrabajador?: string }) => {
    setIsConsultando(true);
    setEstado(null);
    try {
      const data = await mavetApi.getEstadoAsistencia(params);
      setEstado(data);
      if (!data.tienePin) {
        showAlert("PIN no configurado. Contacte al departamento de RRHH.", false);
      } else {
        const facialProb = parseFloat(import.meta.env.VITE_FACIAL_PROBABILITY || "0");
        if (data.usarFacial && data.trabajador && facialProb > 0 && Math.random() < facialProb) {
          setIsFacialOpen(true);
        } else {
          setStep("pin");
          setPinValue("");
          setPinIntentos(0);
          setPinBloqueado(false);
        }
      }
    } catch (err: any) {
      showAlert(err.message || "Trabajador no encontrado.", false);
      setScanned(null);
    } finally {
      setIsConsultando(false);
    }
  }, [showAlert]);

  const handleScan = useCallback((text: string) => {
    setScanned(text);
    const parsed = parsearQRData(text);
    if (parsed) {
      consultarEstado({ cedulaTrabajador: parsed.cedula });
    } else {
      consultarEstado({ qr_uuid: text });
    }
  }, [consultarEstado]);

  const handleConsultarManual = useCallback(() => {
    if (!cedula.trim()) { showAlert("Ingrese su número de cédula.", false); return; }
    consultarEstado({ cedulaTrabajador: normalizeCedula(cedula) });
  }, [cedula, consultarEstado, showAlert]);

  const handleFacialSuccess = useCallback((token: string, data: any) => {
    setIsFacialOpen(false);
    setPinToken(token);
    setPinData(data);
    setStep("confirm");
  }, []);

  const handleFacialFallback = useCallback(() => {
    setIsFacialOpen(false);
    if (estado?.tienePin) {
      setStep("pin");
      setPinValue("");
      setPinIntentos(0);
      setPinBloqueado(false);
    }
  }, [estado]);

  const handlePinDigit = useCallback((d: string) => {
    setPinValue((prev) => {
      if (prev.length >= PIN_MAX) return prev;
      return prev + d;
    });
  }, []);

  const handlePinDelete = useCallback(() => {
    setPinValue((prev) => prev.slice(0, -1));
  }, []);

  const handlePinClear = useCallback(() => {
    setPinValue("");
  }, []);

  const handlePinSubmit = useCallback(async () => {
    if (pinValue.length < PIN_MIN) {
      showAlert(`El PIN debe tener entre ${PIN_MIN} y ${PIN_MAX} dígitos.`, false);
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = { pin: pinValue };
      if (scanned) {
        const parsed = parsearQRData(scanned);
        if (parsed) {
          payload.cedulaTrabajador = parsed.cedula;
        } else {
          payload.qr_uuid = scanned;
        }
      } else {
        payload.cedulaTrabajador = normalizeCedula(cedula);
      }

      const data = await mavetApi.verificarPin(payload);
      setPinToken(data.token);
      setPinData(data);
      setPinIntentos(0);
      setStep("confirm");
    } catch (err: any) {
      const msg = err.message || "PIN incorrecto.";
      const newIntentos = pinIntentos + 1;
      setPinIntentos(newIntentos);

      if (msg.includes("bloqueado") || msg.includes("bloqueado")) {
        setPinBloqueado(true);
        showAlert(msg, false);
      } else if (newIntentos >= 3) {
        setPinBloqueado(true);
        showAlert("PIN bloqueado temporalmente por 5 minutos. Espere e intente nuevamente.", false);
      } else {
        showAlert(`${msg} (Intento ${newIntentos}/3)`, false);
        setPinValue("");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [pinValue, scanned, cedula, showAlert, pinIntentos]);

  const handleConfirmar = useCallback(async () => {
    if (!pinToken) return;
    setIsSubmitting(true);
    try {
      const dispositivo = `Kiosko-${navigator.platform || "desconocido"}`;
      await mavetApi.confirmarAsistenciaConPin({
        tokenConfirmacion: pinToken,
        dispositivo,
      });
      const mov = pinData?.siguienteMovimiento || "";
      showAlert(`${mov} registrada correctamente.`, true);
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      if (err.message?.includes("expirado")) {
        showAlert("El tiempo de confirmación expiró. Inicie el proceso nuevamente.", false);
        setTimeout(() => resetAll(), 1500);
      } else {
        showAlert(err.message || "Error al registrar asistencia.", false);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [pinToken, pinData, showAlert, onClose, resetAll]);

  const handleCancelar = useCallback(() => {
    showAlert("Registro cancelado por el trabajador.", false);
    setStep("scan");
    setScanned(null);
    setEstado(null);
    setPinValue("");
    setPinToken(null);
    setPinData(null);
    setScanKey((k) => k + 1);
  }, [showAlert]);

  const resetScan = useCallback(() => {
    setScanned(null);
    setEstado(null);
    setStep("scan");
    setPinValue("");
    setPinToken(null);
    setPinData(null);
    setScanKey((k) => k + 1);
  }, []);

  const handleIniciarCambioPin = useCallback(() => {
    setStep("cambiar-pin");
    setPinCambioStep("actual");
    setPinActualInput("");
    setPinNuevoInput("");
    setPinConfirmInput("");
  }, []);

  const handleCambioPinDigit = useCallback((d: string) => {
    if (pinCambioStep === "actual") {
      setPinActualInput((prev) => (prev.length >= PIN_MAX ? prev : prev + d));
    } else if (pinCambioStep === "nuevo") {
      setPinNuevoInput((prev) => (prev.length >= PIN_MAX ? prev : prev + d));
    } else {
      setPinConfirmInput((prev) => (prev.length >= PIN_MAX ? prev : prev + d));
    }
  }, [pinCambioStep]);

  const handleCambioPinDelete = useCallback(() => {
    if (pinCambioStep === "actual") {
      setPinActualInput((prev) => prev.slice(0, -1));
    } else if (pinCambioStep === "nuevo") {
      setPinNuevoInput((prev) => prev.slice(0, -1));
    } else {
      setPinConfirmInput((prev) => prev.slice(0, -1));
    }
  }, [pinCambioStep]);

  const handleCambioPinNext = useCallback(async () => {
    if (pinCambioStep === "actual") {
      if (pinActualInput.length < PIN_MIN) {
        showAlert(`Ingrese el PIN actual (${PIN_MIN}-${PIN_MAX} dígitos).`, false);
        return;
      }
      setPinCambioStep("nuevo");
    } else if (pinCambioStep === "nuevo") {
      if (pinNuevoInput.length < PIN_MIN) {
        showAlert(`El nuevo PIN debe tener entre ${PIN_MIN} y ${PIN_MAX} dígitos.`, false);
        return;
      }
      setPinCambioStep("confirmar");
    } else {
      if (pinNuevoInput !== pinConfirmInput) {
        showAlert("Los PIN nuevos no coinciden.", false);
        setPinConfirmInput("");
        return;
      }
      setIsSubmitting(true);
      try {
        const payload: any = {
          pin_actual: pinActualInput,
          pin_nuevo: pinNuevoInput,
        };
        if (scanned) {
          const parsed = parsearQRData(scanned);
          if (parsed) {
            payload.cedulaTrabajador = parsed.cedula;
          } else {
            payload.qr_uuid = scanned;
          }
        } else if (estado?.trabajador?.cedula) {
          payload.cedulaTrabajador = estado.trabajador.cedula;
        } else {
          payload.cedulaTrabajador = normalizeCedula(cedula);
        }

        await mavetApi.cambiarPinPropio(payload);
        showAlert("PIN cambiado exitosamente.", true);
        setTimeout(() => resetAll(), 1500);
      } catch (err: any) {
        showAlert(err.message || "Error al cambiar PIN.", false);
        setPinCambioStep("actual");
        setPinActualInput("");
        setPinNuevoInput("");
        setPinConfirmInput("");
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [pinCambioStep, pinActualInput, pinNuevoInput, pinConfirmInput, scanned, estado, cedula, showAlert, resetAll]);

  const siguiente = estado?.siguienteMovimiento ?? null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className="p-2">
        <div className="flex justify-between items-center mb-4 border-b pb-3 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Registro de Asistencia</h2>
            <p className="text-sm text-gray-500">Personal del Museo MAVET</p>
          </div>
          {(step === "pin" || step === "confirm") && (
            <button
              onClick={resetScan}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
            >
              Volver
            </button>
          )}
        </div>

        {alert && (
          <div className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm animate-fade-in ${
            alert.ok
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
          }`}>
            <span className="font-semibold text-sm">{alert.msg}</span>
          </div>
        )}

        {step === "scan" && (
          <>
            <div className="flex justify-center gap-4 mb-5">
              <button
                onClick={() => { setMode("qr"); setCedula(""); resetScan(); }}
                className={`px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm ${
                  mode === "qr" ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
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

            {mode === "qr" && (
              <div className="flex flex-col items-center justify-center animate-fade-in">
                {isConsultando ? (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Consultando trabajador...</p>
                  </div>
                ) : !scanned ? (
                  <QRScannerPane key={scanKey} onScan={handleScan} />
                ) : null}
              </div>
            )}

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

            {estado && step === "scan" && (
              <div className="animate-fade-in space-y-4 mt-4">
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">
                      {estado.trabajador.nombres} {estado.trabajador.apellidos}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{estado.trabajador.cedula}</p>
                  </div>
                  <button onClick={resetScan} className="text-xs text-brand-600 dark:text-brand-400 hover:underline shrink-0">
                    {mode === "qr" ? "Volver a escanear" : "Cambiar cédula"}
                  </button>
                </div>

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

                {siguiente ? (
                  <button
                    onClick={() => { setStep("pin"); setPinValue(""); }}
                    className="w-full flex items-center justify-center gap-3 p-5 border-2 rounded-xl transition-all font-bold text-lg border-brand-500 bg-brand-50 dark:bg-brand-900/10 hover:bg-brand-500 hover:text-white text-brand-800 dark:text-brand-400"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Ingresar PIN para {siguiente}
                  </button>
                ) : (
                  <div className="w-full text-center bg-gray-100 dark:bg-gray-800 rounded-xl p-5 border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <p className="text-gray-500 dark:text-gray-400 font-semibold">✅ Jornada completa registrada</p>
                    <p className="text-sm text-gray-400 mt-1">No hay más movimientos pendientes por hoy.</p>
                  </div>
                )}

                {estado.asistencia && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(["entrada_manana", "salida_manana"] as const).map((campo) => {
                      const valor = (estado.asistencia as any)?.[campo];
                      return (
                        <div key={campo} className={`rounded-lg px-3 py-2 flex items-center gap-2 ${valor ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800" : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"}`}>
                          <span>{valor ? "✅" : "⬜"}</span>
                          <div>
                            <p className={`font-semibold ${valor ? CAMPO_COLORS[campo] : "text-gray-400"}`}>{CAMPO_LABELS[campo]}</p>
                            {valor && <p className="text-gray-500 dark:text-gray-400">{new Date(valor).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {step === "pin" && estado && (
          <div className="animate-fade-in text-center">
            <div className="mb-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mb-2">
                <svg className="w-7 h-7 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {estado.trabajador.nombres} {estado.trabajador.apellidos}
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                Ingrese su PIN
              </p>
              {pinBloqueado ? (
                <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">PIN bloqueado temporalmente</p>
                  <p className="text-xs text-red-600 dark:text-red-300 mt-1">Demasiados intentos fallidos. Espere 5 minutos.</p>
                </div>
              ) : (
                <>
                  <PinDisplay length={pinValue.length} maxLength={PIN_MAX} />
                  <PinKeypad
                    onDigit={handlePinDigit}
                    onDelete={handlePinDelete}
                    onClear={handlePinClear}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={handlePinSubmit}
                    disabled={pinValue.length < PIN_MIN || isSubmitting}
                    className="mt-4 w-full max-w-xs mx-auto p-4 bg-brand-500 text-white rounded-xl font-bold text-lg hover:bg-brand-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                    ) : (
                      "Validar PIN"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleIniciarCambioPin}
                    className="mt-3 text-xs text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    ¿Olvidó su PIN? Cámbielo aquí
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {step === "confirm" && pinData && (
          <ConfirmacionScreen
            trabajador={pinData.trabajador}
            serverTime={pinData.serverTime}
            tipoMovimiento={pinData.siguienteMovimiento || ""}
            isSubmitting={isSubmitting}
            onConfirmar={handleConfirmar}
            onCancelar={handleCancelar}
          />
        )}

        {step === "cambiar-pin" && (
          <div className="animate-fade-in text-center">
            <div className="mb-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-2">
                <svg className="w-7 h-7 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-3.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {pinCambioStep === "actual" && "Ingrese su PIN actual"}
                {pinCambioStep === "nuevo" && "Ingrese el nuevo PIN"}
                {pinCambioStep === "confirmar" && "Confirme el nuevo PIN"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {pinCambioStep === "actual" && "Para verificar su identidad"}
                {pinCambioStep === "nuevo" && `${PIN_MIN}-${PIN_MAX} dígitos numéricos`}
                {pinCambioStep === "confirmar" && "Escriba el mismo PIN nuevamente"}
              </p>
            </div>
            <PinDisplay
              length={
                pinCambioStep === "actual" ? pinActualInput.length :
                pinCambioStep === "nuevo" ? pinNuevoInput.length :
                pinConfirmInput.length
              }
              maxLength={PIN_MAX}
            />
            <PinKeypad
              onDigit={handleCambioPinDigit}
              onDelete={handleCambioPinDelete}
              onClear={() => {
                if (pinCambioStep === "actual") setPinActualInput("");
                else if (pinCambioStep === "nuevo") setPinNuevoInput("");
                else setPinConfirmInput("");
              }}
              disabled={isSubmitting}
            />
            <div className="flex gap-3 mt-4 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => {
                  if (pinCambioStep === "actual") { setStep("pin"); }
                  else if (pinCambioStep === "nuevo") { setPinCambioStep("actual"); setPinNuevoInput(""); }
                  else { setPinCambioStep("nuevo"); setPinConfirmInput(""); }
                }}
                disabled={isSubmitting}
                className="flex-1 p-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={handleCambioPinNext}
                disabled={isSubmitting}
                className="flex-1 p-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : pinCambioStep === "confirmar" ? (
                  "Cambiar PIN"
                ) : (
                  "Siguiente"
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {estado && estado.trabajador && (
        <FaceVerificationModal
          isOpen={isFacialOpen}
          onClose={() => setIsFacialOpen(false)}
          trabajador={estado.trabajador}
          descriptorFacial={estado.descriptorFacial || ""}
          onSuccess={handleFacialSuccess}
          onFallbackToPin={handleFacialFallback}
        />
      )}
    </Modal>
  );
}
