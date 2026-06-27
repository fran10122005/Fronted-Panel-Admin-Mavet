import { useState, useEffect, useRef } from "react";
import { Modal } from "./ui/modal";
import { mavetApi } from "../services/api";
import { limitNumericInput } from "../utils/validation";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

type TipoMovimiento = "Entrada Mañana" | "Salida Mañana" | "Entrada Tarde" | "Salida Tarde";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AsistenciaModal({ isOpen, onClose }: Props) {
  const [cedula, setCedula] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeButton, setActiveButton] = useState<TipoMovimiento | null>(null);
  const [mode, setMode] = useState<"manual" | "qr">("qr");
  const [scannedUuid, setScannedUuid] = useState<string | null>(null);
  const [alertInfo, setAlertInfo] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: "", type: "success" });
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
      return;
    }

    if (mode === "qr" && !scannedUuid) {
      // Delay initialization slightly to ensure modal is rendered
      const timeout = setTimeout(() => {
        scannerRef.current = new Html5QrcodeScanner(
          "qr-reader-modal",
          { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] },
          false
        );
        scannerRef.current.render(
          (decodedText) => {
            setScannedUuid(decodedText);
            if (scannerRef.current) {
              scannerRef.current.clear().catch(console.error);
            }
          },
          (_error) => { /* Ignorar errores de no-detección */ }
        );
      }, 100);

      return () => {
        clearTimeout(timeout);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
      };
    }
  }, [mode, scannedUuid, isOpen]);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setCedula("");
      setMode("qr");
      setScannedUuid(null);
      setAlertInfo({ show: false, message: "", type: "success" });
    }
  }, [isOpen]);

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => setAlertInfo({ show: false, message: "", type: "success" }), 4000);
  };

  const handleRegistro = async (tipoMovimiento: TipoMovimiento) => {
    if (mode === "manual" && !cedula.trim()) {
      showAlert("Por favor, ingrese su número de cédula.", "error");
      return;
    }
    if (mode === "qr" && !scannedUuid) {
      showAlert("Por favor, escanee su carnet primero.", "error");
      return;
    }

    setIsSubmitting(true);
    setActiveButton(tipoMovimiento);

    try {
      const payload: any = { tipoMovimiento };
      if (mode === "manual") payload.cedulaTrabajador = cedula;
      else payload.qr_uuid = scannedUuid;

      const response = await mavetApi.registrarAsistencia(payload);
      showAlert(response.message, "success");
      
      // Auto close after success
      setTimeout(() => onClose(), 1500);
      
    } catch (error: any) {
      showAlert(error.message || "Error al registrar asistencia.", "error");
      setScannedUuid(null);
    } finally {
      setIsSubmitting(false);
      setActiveButton(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-2">
        <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Registro de Asistencia</h2>
            <p className="text-sm text-gray-500">Personal del Museo MAVET</p>
          </div>
        </div>

        {alertInfo.show && (
          <div className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm animate-fade-in ${
            alertInfo.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}>
            <span>{alertInfo.type === 'success' ? '✅' : '⚠️'}</span>
            <span className="font-semibold text-sm">{alertInfo.message}</span>
          </div>
        )}

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => { setMode("qr"); setCedula(""); }}
            className={`px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm ${mode === "qr" ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            Escanear QR
          </button>
          <button
            onClick={() => { setMode("manual"); setScannedUuid(null); }}
            className={`px-5 py-2 rounded-lg font-bold transition-colors text-sm ${mode === "manual" ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"}`}
          >
            Ingreso Manual
          </button>
        </div>

        <div className="mb-8">
          {mode === "manual" ? (
            <div className="animate-fade-in max-w-md mx-auto">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Número de Cédula</label>
              <input
                type="text" autoFocus value={cedula} onChange={(e) => setCedula(e.target.value)} onKeyDown={limitNumericInput} disabled={isSubmitting}
                className="w-full px-4 py-3 text-lg font-bold text-center border-2 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:border-brand-500 focus:ring-0 outline-none"
                placeholder="Ej. V-12345678"
              />
            </div>
          ) : (
            <div className="animate-fade-in flex flex-col items-center justify-center">
              {!scannedUuid ? (
                <div className="w-full max-w-sm rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div id="qr-reader-modal" className="w-full dark:[&_video]:invert-[0.1]" style={{ border: 'none' }}></div>
                </div>
              ) : (
                <div className="w-full text-center bg-green-50 dark:bg-green-900/20 border-2 border-green-500 p-6 rounded-xl">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="text-lg font-bold text-green-900 dark:text-green-300 mb-1">Carnet Escaneado</h3>
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">Seleccione su movimiento para confirmar.</p>
                  <button onClick={() => setScannedUuid(null)} className="mt-3 text-xs text-brand-600 dark:text-brand-400 hover:underline">Volver a escanear</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`grid grid-cols-2 gap-4 transition-all duration-300 ${mode === "qr" && !scannedUuid ? "opacity-50 pointer-events-none grayscale" : ""}`}>
          <button onClick={() => handleRegistro("Entrada Mañana")} disabled={isSubmitting} className="flex flex-col items-center justify-center p-4 border-2 border-green-500 bg-green-50 dark:bg-green-900/10 hover:bg-green-500 hover:text-white group rounded-xl transition-all">
            {isSubmitting && activeButton === "Entrada Mañana" ? <div className="w-6 h-6 border-2 border-t-green-500 rounded-full animate-spin"></div> : <><span className="font-bold text-green-800 dark:text-green-400 group-hover:text-white">Entrada</span></>}
          </button>
          <button onClick={() => handleRegistro("Salida Tarde")} disabled={isSubmitting} className="flex flex-col items-center justify-center p-4 border-2 border-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-500 hover:text-white group rounded-xl transition-all">
            {isSubmitting && activeButton === "Salida Tarde" ? <div className="w-6 h-6 border-2 border-t-red-500 rounded-full animate-spin"></div> : <><span className="font-bold text-red-800 dark:text-red-400 group-hover:text-white">Salida</span></>}
          </button>
        </div>
      </div>
    </Modal>
  );
}
