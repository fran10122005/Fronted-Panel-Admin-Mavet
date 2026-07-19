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

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
      <div className="p-2 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-lg shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{value}</p>
      </div>
    </div>
  );
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
        className="max-w-2xl p-0 overflow-hidden"
      >
      {t && (
        <div className="flex flex-col">
          <div className="relative bg-gradient-to-br from-brand-900 via-brand-950 to-brand-950 px-6 pt-6 pb-16">
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '16px 16px'
            }} />
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white bg-black/20 hover:bg-black/40 rounded-lg transition-colors z-10" title="Cerrar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex items-center gap-5 relative z-[1]">
              <div className="relative group">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-white/20 bg-white/5 overflow-hidden shadow-lg">
                  {fotoUrl ? (
                    <img src={fotoUrl} alt="Foto" className="w-full h-full object-cover cursor-pointer" onClick={() => setViewingImage(true)} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center cursor-pointer text-white text-[10px] font-bold uppercase tracking-wider transition-all">
                    Cambiar
                    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-white leading-tight truncate">
                  {t.nombre} {t.apellido}
                </h2>
                <p className="text-sm text-white/70 font-medium mt-0.5">{t.cedula}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs font-semibold text-brand-300 bg-white/10 px-2.5 py-0.5 rounded-full">{t.cargo}</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    t.estado === 'Activo'
                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                      : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${t.estado === 'Activo' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                    {t.estado}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 -mt-8 relative z-[2]">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                  label="Teléfono"
                  value={t.telefono || '—'}
                />
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                  label="Correo"
                  value={t.correo || '—'}
                />
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                  label="Dirección"
                  value={t.direccion || '—'}
                />
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                  label="Fecha de Nacimiento"
                  value={t.fecha_nacimiento || '—'}
                />
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                  label="Fecha de Ingreso"
                  value={t.fecha_ingreso || '—'}
                />
                <InfoRow
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                  label="PIN"
                  value={(t as any).pin_hash ? "Configurado" : "No configurado"}
                />
              </div>

              {(t as any).usarFacial && (
                <div className="mt-3 p-3 bg-theme-purple-500/10 dark:bg-theme-purple-500/5 border border-theme-purple-500/20 rounded-xl flex items-center gap-2.5">
                  <svg className="w-5 h-5 text-theme-purple-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9h.01M9 9h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 15h6" /></svg>
                  <p className="text-xs font-medium text-theme-purple-500">Reconocimiento facial habilitado</p>
                </div>
              )}
            </div>
          </div>
 
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 mt-5">
            <div className="flex gap-2">
              <button onClick={async () => {
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
              }} disabled={isResettingPin} className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm disabled:opacity-60">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-3.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                {isResettingPin ? "Restableciendo..." : "Restablecer PIN"}
              </button>
              <button onClick={() => setIsFacialEnrollOpen(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-theme-purple-500 hover:bg-theme-purple-500/90 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9h.01M9 9h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 15h6" /></svg>
                Enrolar Facial
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cerrar
              </button>
              <button onClick={() => { onEdit(t); onClose(); }} className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Editar
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>

    <Modal isOpen={viewingImage} onClose={() => setViewingImage(false)} showCloseButton={true} className="max-w-2xl bg-black/95 p-2 rounded-lg">
      {fotoUrl && <img src={fotoUrl} alt="Foto del trabajador" className="w-full h-auto max-h-[85vh] object-contain rounded-md" />}
    </Modal>

    <Modal isOpen={!!pinResetResult} onClose={() => setPinResetResult(null)} className="max-w-md">
      {pinResetResult && (
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-3.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">PIN Restablecido</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">El PIN temporal para <strong>{t?.nombre} {t?.apellido}</strong> es:</p>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border-2 border-dashed border-amber-300 dark:border-amber-700">
            <p className="text-4xl font-black tracking-widest text-amber-700 dark:text-amber-400">{pinResetResult.pinTemporal}</p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Entregue este PIN al trabajador. Deberá cambiarlo en su primer ingreso.</p>
          <button onClick={() => setPinResetResult(null)} className="w-full p-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition">Cerrar</button>
        </div>
      )}
    </Modal>

    {t && (
      <FacialEnrollModal
        isOpen={isFacialEnrollOpen}
        onClose={() => setIsFacialEnrollOpen(false)}
        trabajadorId={t.id?.toString() || ""}
        trabajadorNombre={`${t.nombre} ${t.apellido}`}
        onSuccess={() => onRefresh?.()}
      />
    )}
    </>
  );
}
