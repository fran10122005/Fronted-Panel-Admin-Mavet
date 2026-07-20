import { useRef, useState } from "react";
import { Modal } from "../../../components/ui/modal";
import { mavetApi } from "../../../services/api";
import toast from "react-hot-toast";
import { loadModels, getDetectionWithQuality, serializeDescriptor } from "../../../services/face.service";

interface FacialEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  trabajadorId: string;
  trabajadorNombre: string;
  onSuccess?: () => void;
}

export default function FacialEnrollModal({
  isOpen, onClose, trabajadorId, trabajadorNombre, onSuccess,
}: FacialEnrollModalProps) {
  const [status, setStatus] = useState<"idle" | "camera" | "capturing" | "done" | "error">("idle");
  const [captureStep, setCaptureStep] = useState(1);
  const [descs, setDescs] = useState<string[]>([]);
  const [qualityMsg, setQualityMsg] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleClose = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setStatus("idle");
    setCaptureStep(1);
    setDescs([]);
    setQualityMsg("");
    onClose();
  };

  const handleStartCamera = async () => {
    setStatus("camera");
    setCaptureStep(1);
    setDescs([]);
    try {
      await loadModels();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      toast.error("No se pudo acceder a la cámara");
      setStatus("idle");
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;
    setStatus("capturing");
    setQualityMsg("");
    try {
      const { detection, quality } = await getDetectionWithQuality(videoRef.current);
      if (!detection) {
        setQualityMsg("No se detecta rostro. Asegúrese de estar frente a la cámara.");
        setStatus("camera");
        return;
      }
      if (!quality.ok) {
        setQualityMsg(quality.reason || "Ajuste su posición e iluminación.");
        setStatus("camera");
        return;
      }
      const serialized = serializeDescriptor(detection.descriptor);
      const newDescs = [...descs, serialized];
      setDescs(newDescs);

      if (captureStep < 3) {
        setCaptureStep(captureStep + 1);
        setStatus("camera");
      } else {
        await mavetApi.actualizarTrabajadorFacial(trabajadorId, {
          descriptores_faciales: newDescs,
          usarFacial: true,
          consentimientoFacial: true,
          fechaConsentimiento: new Date().toISOString().split("T")[0],
        });
        setStatus("done");
        toast.success("Rostro enrolado exitosamente (3 capturas)");
        onSuccess?.();
      }
    } catch (err: any) {
      toast.error(err.message || "Error al enrolar rostro");
      setStatus("error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
      <div className="p-4 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-theme-purple-500/10 dark:bg-theme-purple-500/5 flex items-center justify-center">
          <svg className="w-7 h-7 text-theme-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9h.01M9 9h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 15h6" />
          </svg>
        </div>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Enrolar Reconocimiento Facial</p>
        <p className="text-sm text-gray-500">{trabajadorNombre}</p>

        {status === "idle" && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Se tomarán <strong>3 fotos</strong> en diferentes condiciones para mejorar el reconocimiento.<br />
              La imagen no se almacena, solo vectores numéricos.
            </p>
            <button onClick={handleStartCamera} className="w-full p-3 bg-theme-purple-500 text-white rounded-xl font-bold hover:bg-theme-purple-500/90 transition">
              Iniciar Cámara
            </button>
          </div>
        )}

        {(status === "camera" || status === "capturing") && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((step) => (
                <div key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    step === captureStep
                      ? "bg-theme-purple-500 text-white border-theme-purple-500"
                      : step < captureStep
                      ? "bg-success-500 text-white border-success-500"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-400 border-gray-300 dark:border-gray-600"
                  }`}>
                  {step < captureStep ? "✓" : step}
                </div>
              ))}
            </div>
            <p className="text-xs font-semibold text-theme-purple-500">
              {captureStep === 1 && "Foto 1: Mire de frente, con buena iluminación"}
              {captureStep === 2 && "Foto 2: Gire ligeramente el rostro (o colóquese gafas si aplica)"}
              {captureStep === 3 && "Foto 3: Cambie el ángulo de luz o sonría ligeramente"}
            </p>

            <div className="relative mx-auto w-64 h-48 rounded-xl overflow-hidden bg-gray-900 border-2 border-theme-purple-500">
              <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {qualityMsg && <p className="text-xs text-amber-600">{qualityMsg}</p>}

            <button onClick={handleCapture} disabled={status === "capturing"}
              className="w-full p-3 bg-success-500 text-white rounded-xl font-bold hover:bg-success-600 transition disabled:opacity-60">
              {status === "capturing" ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : captureStep < 3 ? (
                `Capturar Foto ${captureStep}/3`
              ) : (
                "Capturar y Guardar (3/3)"
              )}
            </button>
          </div>
        )}

        {status === "done" && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">Rostro enrolado correctamente (3 capturas)</p>
              <p className="text-xs text-green-600 dark:text-green-300 mt-1">El trabajador podrá usar verificación facial en el kiosko.</p>
            </div>
            <button onClick={handleClose} className="w-full p-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition">
              Cerrar
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <p className="text-sm text-red-600">Error al enrolar. Intente nuevamente.</p>
            <button onClick={() => { setStatus("idle"); setCaptureStep(1); setDescs([]); }}
              className="w-full p-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition">
              Reintentar
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
