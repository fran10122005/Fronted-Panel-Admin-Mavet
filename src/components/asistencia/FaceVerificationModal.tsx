import { useRef, useState, useEffect, useCallback } from "react";
import { Modal } from "../ui/modal";
import { loadModels, extractDescriptor, compareDescriptors, parseDescriptor } from "../../services/face.service";
import { mavetApi } from "../../services/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  trabajador: { id: string; nombres: string; apellidos: string; cedula: string };
  descriptorFacial: string;
  onSuccess: (token: string, data: any) => void;
  onFallbackToPin: () => void;
}

type Status = "initializing" | "ready" | "verifying" | "success" | "error" | "no-face";

export default function FaceVerificationModal({
  isOpen,
  onClose,
  trabajador,
  descriptorFacial,
  onSuccess,
  onFallbackToPin,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>("initializing");
  const [attempts, setAttempts] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const mounted = useRef(true);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }
    mounted.current = true;
    setStatus("initializing");
    setAttempts(0);
    setErrorMsg("");

    const init = async () => {
      try {
        await loadModels();
        if (!mounted.current) return;

        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (!mounted.current) { stream.getTracks().forEach((t) => t.stop()); return; }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("ready");
      } catch (err: any) {
        if (!mounted.current) return;
        setErrorMsg("No se pudo acceder a la cámara. Usará PIN.");
        onFallbackToPin();
      }
    };
    init();

    return () => {
      mounted.current = false;
      stopCamera();
    };
  }, [isOpen, onFallbackToPin, stopCamera]);

  const handleVerify = useCallback(async () => {
    if (!videoRef.current || status !== "ready") return;
    setStatus("verifying");
    try {
      const desc = await extractDescriptor(videoRef.current);
      if (!desc) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 2) {
          setStatus("error");
          setErrorMsg("No se detectó rostro después de 2 intentos. Usará PIN.");
          setTimeout(() => onFallbackToPin(), 1000);
        } else {
          setStatus("no-face");
          setTimeout(() => setStatus("ready"), 1500);
        }
        return;
      }

      const refDesc = parseDescriptor(descriptorFacial);
      const match = compareDescriptors(desc, refDesc);

      if (match) {
        setStatus("success");
        try {
          const data = await mavetApi.verificarFacial({
            cedulaTrabajador: trabajador.cedula,
          });
          if (mounted.current) {
            onSuccess(data.token, data);
          }
        } catch {
          setErrorMsg("Error al confirmar identidad facial. Usará PIN.");
          setTimeout(() => onFallbackToPin(), 1000);
        }
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 2) {
          setStatus("error");
          setErrorMsg("El rostro no coincide después de 2 intentos. Usará PIN.");
          setTimeout(() => onFallbackToPin(), 1000);
        } else {
          setErrorMsg("El rostro no coincide. Intente nuevamente.");
          setTimeout(() => {
            setStatus("ready");
            setErrorMsg("");
          }, 1500);
        }
      }
    } catch {
      setStatus("error");
      setErrorMsg("Error al procesar el rostro. Usará PIN.");
      setTimeout(() => onFallbackToPin(), 1000);
    }
  }, [status, attempts, descriptorFacial, trabajador.cedula, onSuccess, onFallbackToPin]);

  useEffect(() => {
    if (status === "ready") {
      const timer = setTimeout(() => handleVerify(), 500);
      return () => clearTimeout(timer);
    }
  }, [status, handleVerify]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-4 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
          <svg className="w-7 h-7 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9h.01M9 9h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 15h6" />
          </svg>
        </div>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Verificación Facial</p>
        <p className="text-sm text-gray-500">
          {trabajador.nombres} {trabajador.apellidos}
        </p>

        <div className="relative mx-auto w-64 h-48 rounded-xl overflow-hidden bg-gray-900 border-2 border-brand-500">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          />
          {status === "initializing" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
          {status === "verifying" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="text-white text-sm font-semibold">Verificando...</div>
            </div>
          )}
          {status === "success" && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500/30">
              <span className="text-4xl">✓</span>
            </div>
          )}
          {status === "no-face" && (
            <div className="absolute inset-0 flex items-center justify-center bg-amber-500/30">
              <span className="text-white text-sm font-semibold">Rostro no detectado</span>
            </div>
          )}
        </div>

        {errorMsg && (
          <p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => { stopCamera(); onFallbackToPin(); }}
            className="flex-1 p-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm"
          >
            Usar PIN
          </button>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="flex-1 p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}
