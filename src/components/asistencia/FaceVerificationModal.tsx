import { useRef, useState, useEffect, useCallback } from "react";
import { Modal } from "../ui/modal";
import { mavetApi } from "../../services/api";
import type { DetectionQuality } from "../../services/face.service";

let faceServiceCache: Promise<typeof import("../../services/face.service")> | null = null;
function getFaceService() {
  if (!faceServiceCache) faceServiceCache = import("../../services/face.service");
  return faceServiceCache;
}
function resetFaceServiceCache() {
  faceServiceCache = null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  trabajador: { id: string; nombres: string; apellidos: string; cedula: string };
  descriptorFacial: string;
  descriptoresFaciales?: string[];
  onSuccess: (token: string, data: any) => void;
  onFallbackToPin: () => void;
}

type Status = "initializing" | "ready" | "capturing" | "verifying" | "success" | "error";

const MAX_ATTEMPTS = Number(import.meta.env.VITE_FACIAL_MAX_ATTEMPTS) || 5;

export default function FaceVerificationModal({
  isOpen,
  onClose,
  trabajador,
  descriptorFacial,
  descriptoresFaciales,
  onSuccess,
  onFallbackToPin,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const qualityOkStartRef = useRef<number | null>(null);
  const [status, setStatus] = useState<Status>("initializing");
  const [attempts, setAttempts] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [quality, setQuality] = useState<DetectionQuality | null>(null);
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const mounted = useRef(true);
  const wasOpenRef = useRef(false);
  const faceRef = useRef<typeof import("../../services/face.service") | null>(null);

  const fallbackRef = useRef(onFallbackToPin);
  const successRef = useRef(onSuccess);

  useEffect(() => {
    fallbackRef.current = onFallbackToPin;
    successRef.current = onSuccess;
  }, [onFallbackToPin, onSuccess]);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const drawOverlay = useCallback((det: { x: number; y: number; w: number; h: number } | null, qualityOk: boolean) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const rect = video.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!det) return;

    const scaleX = rect.width / video.videoWidth;
    const scaleY = rect.height / video.videoHeight;

    const x = det.x * scaleX;
    const y = det.y * scaleY;
    const w = det.w * scaleX;
    const h = det.h * scaleY;

    ctx.strokeStyle = qualityOk ? "#22c55e" : "#ef4444";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
  }, []);

  const qualityLoopRef = useRef<(() => Promise<void>) | null>(null);

  const startQualityLoop = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const face = faceRef.current || await getFaceService();

    const loop = async () => {
      if (!mounted.current || status !== "ready") return;

      const { detection, quality: q } = await face.getDetectionWithQuality(video);

      if (detection) {
        const b = detection.detection.box;
        setBox({ x: b.x, y: b.y, w: b.width, h: b.height });
        drawOverlay({ x: b.x, y: b.y, w: b.width, h: b.height }, q.ok);
      } else {
        setBox(null);
        drawOverlay(null, false);
      }

      setQuality(q);

      if (q.ok) {
        if (qualityOkStartRef.current === null) {
          qualityOkStartRef.current = Date.now();
        } else if (Date.now() - qualityOkStartRef.current >= 2000) {
          qualityOkStartRef.current = null;
          handleCapture();
          return;
        }
      } else {
        qualityOkStartRef.current = null;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    qualityLoopRef.current = loop;
    animFrameRef.current = requestAnimationFrame(loop);
  }, [status, drawOverlay]);

  const handleCapture = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    setStatus("capturing");
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    try {
      const face = await getFaceService();
      const capturedDescs = await face.captureMultipleDescriptors(video);

      if (capturedDescs.length === 0) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= MAX_ATTEMPTS) {
          stopCamera();
          setStatus("error");
          setErrorMsg("No se pudo capturar el rostro de forma clara. Usará PIN.");
          try { await mavetApi.registrarFacialFallido({ cedulaTrabajador: trabajador.cedula, motivo: "Sin rostro detectado en captura múltiple" }); } catch {}
          setTimeout(() => fallbackRef.current(), 1500);
        } else {
          setErrorMsg(`No se detectó rostro. Intento ${newAttempts}/${MAX_ATTEMPTS}`);
          setStatus("ready");
          setTimeout(() => startQualityLoop(), 300);
        }
        return;
      }

      setStatus("verifying");

      const storedDescs: Float32Array[] = [];
      if (descriptoresFaciales && descriptoresFaciales.length > 0) {
        storedDescs.push(...face.parseDescriptorArray(descriptoresFaciales));
      } else if (descriptorFacial) {
        storedDescs.push(face.parseDescriptor(descriptorFacial));
      }

      if (storedDescs.length === 0) {
        stopCamera();
        setStatus("error");
        setErrorMsg("No hay datos faciales de referencia. Usará PIN.");
        setTimeout(() => fallbackRef.current(), 1500);
        return;
      }

      const result = face.findBestMatch(capturedDescs, storedDescs);

      if (result.match) {
        setStatus("success");
        stopCamera();
        try {
          const data = await mavetApi.verificarFacial({
            cedulaTrabajador: trabajador.cedula,
            intento: attempts + 1,
            total_intentos: MAX_ATTEMPTS,
          });
          if (mounted.current) {
            successRef.current(data.token, data);
          }
        } catch {
          stopCamera();
          setErrorMsg("Error al confirmar identidad facial. Usará PIN.");
          setTimeout(() => fallbackRef.current(), 1500);
        }
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        try {
          await mavetApi.registrarFacialFallido({
            cedulaTrabajador: trabajador.cedula,
            motivo: `No coincide - distancia mínima: ${result.minDistance.toFixed(3)}`,
          });
        } catch {}

        if (newAttempts >= MAX_ATTEMPTS) {
          stopCamera();
          setStatus("error");
          setErrorMsg("No fue posible reconocerte. Por favor, usa tu PIN.");
          setTimeout(() => fallbackRef.current(), 1500);
        } else {
          setErrorMsg(`No te reconocimos. Intenta de nuevo (intento ${newAttempts}/${MAX_ATTEMPTS})`);
          setStatus("ready");
          setTimeout(() => startQualityLoop(), 500);
        }
      }
    } catch (err) {
      console.error("FaceVerificationModal capture error:", err);
      stopCamera();
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      try { await mavetApi.registrarFacialFallido({ cedulaTrabajador: trabajador.cedula, motivo: `Error de procesamiento: ${err instanceof Error ? err.message : 'desconocido'}` }); } catch {}
      if (newAttempts >= MAX_ATTEMPTS) {
        setStatus("error");
        setErrorMsg("Error al procesar el rostro. Usará PIN.");
        setTimeout(() => fallbackRef.current(), 1500);
      } else {
        setErrorMsg(`Error de procesamiento. Intento ${newAttempts}/${MAX_ATTEMPTS}`);
        setStatus("ready");
        setTimeout(() => startQualityLoop(), 500);
      }
    }
  }, [attempts, descriptorFacial, descriptoresFaciales, trabajador.cedula, startQualityLoop]);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      wasOpenRef.current = false;
      return;
    }

    const isFirstOpen = !wasOpenRef.current;
    wasOpenRef.current = true;
    mounted.current = true;

    if (isFirstOpen) {
      setAttempts(0);
    }
    setStatus("initializing");
    setErrorMsg("");
    setQuality(null);
    setBox(null);
    qualityOkStartRef.current = null;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (!mounted.current) { stream.getTracks().forEach((t) => t.stop()); return; }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        let face;
        try {
          face = await getFaceService();
          faceRef.current = face;
        } catch (err) {
          console.error("FaceVerificationModal: error cargando servicio facial:", err);
          resetFaceServiceCache();
          setStatus("error");
          setErrorMsg("Error al cargar el servicio facial. Pulse Reintentar.");
          return;
        }

        try {
          await face.loadModels();
        } catch (err) {
          console.error("FaceVerificationModal: error cargando modelos:", err);
          resetFaceServiceCache();
          setStatus("error");
          setErrorMsg("Error al cargar modelos faciales. Verifique su conexión y pulse Reintentar.");
          return;
        }

        if (!mounted.current) return;
        await new Promise((r) => setTimeout(r, 300));
        setStatus("ready");
      } catch (err) {
        if (!mounted.current) return;
        console.error("FaceVerificationModal: error accediendo a la cámara:", err);
        stopCamera();
        setStatus("error");
        setErrorMsg("No se pudo acceder a la cámara. Verifique permisos y pulse Reintentar.");
      }
    };
    init();

    return () => {
      mounted.current = false;
      stopCamera();
    };
  }, [isOpen, stopCamera, retryKey]);

  useEffect(() => {
    if (status === "ready") {
      qualityOkStartRef.current = null;
      startQualityLoop();
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [status, startQualityLoop]);

  const qualityText = quality && !quality.ok ? quality.reason : null;
  const borderColor = quality?.ok ? "border-green-500" : box ? "border-red-500" : "border-brand-500";

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

        <div className={`relative mx-auto w-64 h-48 rounded-xl overflow-hidden bg-gray-900 border-2 ${borderColor} transition-colors`}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
          {status === "initializing" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
          {status === "error" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          )}
          {(status === "capturing" || status === "verifying") && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="text-white text-sm font-semibold">Verificando...</div>
            </div>
          )}
          {status === "success" && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500/30">
              <span className="text-4xl text-white">✓</span>
            </div>
          )}
        </div>

        {qualityText && status === "ready" && (
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{qualityText}</p>
        )}

        {errorMsg && (
          <p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
        )}

        {status === "ready" && quality?.ok && (
          <p className="text-xs text-green-600 dark:text-green-400 animate-pulse">
            Rostro detectado. Espere un momento...
          </p>
        )}

        {status === "error" ? (
          <div className="flex gap-3">
            <button
              onClick={() => { setErrorMsg(""); setStatus("initializing"); setRetryKey((k) => k + 1); }}
              className="flex-1 p-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 transition text-sm"
            >
              Reintentar
            </button>
            <button
              onClick={() => { stopCamera(); onClose(); }}
              className="flex-1 p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="w-full p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
          >
            Cancelar
          </button>
        )}
      </div>
    </Modal>
  );
}
