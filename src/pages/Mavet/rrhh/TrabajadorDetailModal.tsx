import { useRef, useState } from "react";
import { Modal } from "../../../components/ui/modal";
import { Trabajador } from "../../../types";
import { mavetApi } from "../../../services/api";
import toast from "react-hot-toast";
import FacialEnrollModal from "./FacialEnrollModal";

interface Props {
  trabajador: Trabajador | null;
  onClose: () => void;
  onEdit: (t: Trabajador) => void;
  onRefresh?: () => void;
}

export default function TrabajadorDetailModal({ trabajador: t, onClose, onEdit, onRefresh }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localFotoUrl, setLocalFotoUrl] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState(false);
  const [isResettingPin, setIsResettingPin] = useState(false);
  const [pinResetResult, setPinResetResult] = useState<{ pinTemporal: string; message: string } | null>(null);
  const [isFacialEnrollOpen, setIsFacialEnrollOpen] = useState(false);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !t?.id) return;
    try {
      toast.loading("Subiendo foto...", { id: "detail-photo" });
      const url = await mavetApi.subirFotoTrabajador(t.id, file);
      setLocalFotoUrl(url);
      toast.success("Foto actualizada", { id: "detail-photo" });
      onRefresh?.();
    } catch (err: any) {
      toast.error(err.message || "Error al subir la foto", { id: "detail-photo" });
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const fotoUrl = localFotoUrl || t?.foto_url;

  return (
    <>
      <Modal
        isOpen={t !== null && !viewingImage}
        onClose={onClose}
        showCloseButton={false}
        className="max-w-5xl p-0 overflow-hidden"
      >
      {t && (
        <div className="flex flex-col md:flex-row md:min-h-[420px]">
          <div
            className="md:w-[260px] w-full bg-brand-950 p-4 md:p-5 flex flex-col items-center justify-center md:justify-between relative text-white"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), 
                linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          >


            <div className="w-24 h-32 md:w-28 md:h-36 my-3 md:my-6 border border-brand-800/60 bg-brand-950/40 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center relative p-2 group overflow-hidden">
              <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t border-l border-brand-400"></div>
              <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t border-r border-brand-400"></div>
              <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b border-l border-brand-400"></div>
              <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b border-r border-brand-400"></div>

              {fotoUrl && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setViewingImage(true); }}
                  className="absolute top-1 right-1 md:top-2 md:right-2 bg-black/60 hover:bg-black/80 text-white rounded-md p-1 md:p-1.5 z-10 opacity-70 group-hover:opacity-100 transition-opacity"
                  title="Ver foto en grande"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </button>
              )}

              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt="Foto del trabajador"
                  className="w-full h-full object-cover rounded-md cursor-pointer"
                  onClick={() => setViewingImage(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-brand-400/80 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-semibold text-[10px] md:text-[11px] tracking-wider text-brand-100 uppercase text-center leading-tight">Ficha de<br/>Personal</span>
                </div>
              )}

              <label className="absolute inset-0 bg-black/60 hidden group-hover:flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-bold uppercase text-center transition-all">
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Cambiar<br/>Foto</span>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>

            <div className="text-center hidden md:block">
              <p className="text-xs font-semibold tracking-widest text-brand-300">MAVET</p>
              <p className="text-[9px] text-brand-400/60 mt-0.5">Museo de Artes Visuales y del Espacio</p>
            </div>
          </div>

          <div className="flex-1 p-6 bg-[#fcfafa] dark:bg-gray-900 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white leading-tight">
                    {t.nombre} {t.apellido}
                  </h2>
                  <p className="text-[13px] font-bold tracking-wide text-gray-600 dark:text-gray-400 mt-1">
                    {t.cedula}
                  </p>
                  <p className="text-brand-500 dark:text-brand-400 font-semibold text-xs mt-0.5">
                    • {t.cargo}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Cerrar"
                >
                  <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm my-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-xl">
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016a11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Estado Laboral</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Condición Actual</span>
                  </div>
                </div>
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                  t.estado === 'Activo' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/40' :
                  'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                  {t.estado}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.378 0 2.483.964 2.483 2.15H5C5 16.114 6.105 15.15 7.483 15.15z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Cédula</span>
                    <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{t.cedula}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Cargo</span>
                    <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{t.cargo}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">PIN de Asistencia</span>
                    <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">
                      {(t as any).pin_hash ? "Configurado" : "No configurado"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Teléfono de Contacto</span>
                    <span className="text-xs font-semibold text-gray-855 dark:text-gray-200">{t.telefono || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Correo Electrónico</span>
                    <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{t.correo || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Horas Semanales Requeridas</span>
                    <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{t.horas_semanales || '0'} horas</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 text-brand-600 dark:text-brand-400 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Estatus Laboral</span>
                    <span className="text-xs font-semibold text-gray-850 dark:text-gray-205">{t.estado}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
              <button
                onClick={async () => {
                  if (!t?.id) return;
                  setIsResettingPin(true);
                  try {
                    const result = await mavetApi.resetPinTrabajador(t.id.toString());
                    setPinResetResult(result);
                  } catch (err: any) {
                    toast.error(err.message || "Error al restablecer PIN");
                  } finally {
                    setIsResettingPin(false);
                  }
                }}
                disabled={isResettingPin}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm disabled:opacity-60"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-3.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                {isResettingPin ? "Restableciendo..." : "Restablecer PIN"}
              </button>
              <button
                onClick={() => setIsFacialEnrollOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9h.01M9 9h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 15h6" />
                </svg>
                Enrolar Facial
              </button>
              <div className="flex gap-2.5">
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-semibold text-gray-655 dark:text-gray-450 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => { onEdit(t); onClose(); }}
                  className="flex items-center gap-1.5 px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Editar Trabajador
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>

    <Modal
      isOpen={viewingImage}
      onClose={() => setViewingImage(false)}
      showCloseButton={true}
      className="max-w-2xl bg-black/95 p-2 rounded-lg"
    >
      {fotoUrl && (
        <img
          src={fotoUrl}
          alt="Foto del trabajador"
          className="w-full h-auto max-h-[85vh] object-contain rounded-md"
        />
      )}
    </Modal>

    <Modal
      isOpen={!!pinResetResult}
      onClose={() => setPinResetResult(null)}
      className="max-w-md"
    >
      {pinResetResult && (
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-3.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">PIN Restablecido</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            El PIN temporal para <strong>{t?.nombre} {t?.apellido}</strong> es:
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border-2 border-dashed border-amber-300 dark:border-amber-700">
            <p className="text-4xl font-black tracking-widest text-amber-700 dark:text-amber-400">
              {pinResetResult.pinTemporal}
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Entregue este PIN al trabajador. Deberá cambiarlo en su primer ingreso.
          </p>
          <button
            onClick={() => setPinResetResult(null)}
            className="w-full p-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition"
          >
            Cerrar
          </button>
        </div>
      )}
    </Modal>

    {t && (
      <FacialEnrollModal
        isOpen={isFacialEnrollOpen}
        onClose={() => setIsFacialEnrollOpen(false)}
        trabajadorId={t.id.toString()}
        trabajadorNombre={`${t.nombre} ${t.apellido}`}
        onSuccess={() => onRefresh?.()}
      />
    )}
    </>
  );
}
