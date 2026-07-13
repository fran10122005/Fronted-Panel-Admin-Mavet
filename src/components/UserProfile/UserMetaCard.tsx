import { useState, useRef } from "react";
import { mavetApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import ConfirmDialog from "../ui/ConfirmDialog";

export default function UserMetaCard({ profile, onRefresh }: { profile: any; onRefresh?: () => void }) {
  const trabajador = profile?.Trabajador || {};
  const nombreCompleto = trabajador.nombres ? `${trabajador.nombres} ${trabajador.apellidos}` : "Usuario MAVET";
  const fotoUrl = profile?.foto_url;
  const inputRef = useRef<HTMLInputElement>(null);

  const getInitials = () => {
    if (trabajador?.nombres && trabajador?.apellidos) {
      return `${trabajador.nombres.charAt(0)}${trabajador.apellidos.charAt(0)}`.toUpperCase();
    }
    return "UM";
  };
  const [uploading, setUploading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { updateUser } = useAuth();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      toast.loading("Subiendo foto...", { id: "profile-photo" });
      const result = await mavetApi.subirFotoPerfil(file);
      if (result.url) {
        const updated = { ...profile, foto_url: result.url };
        updateUser(updated);
        onRefresh?.();
        toast.success("Foto de perfil actualizada", { id: "profile-photo" });
      }
    } catch (err: any) {
      toast.error(err.message || "Error al subir la foto", { id: "profile-photo" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    setConfirmOpen(false);
    try {
      toast.loading("Eliminando foto...", { id: "profile-photo" });
      await mavetApi.eliminarFotoPerfil();
      const updated = { ...profile, foto_url: null };
      updateUser(updated);
      onRefresh?.();
      toast.success("Foto eliminada correctamente", { id: "profile-photo" });
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar la foto", { id: "profile-photo" });
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 flex items-center justify-center bg-gray-100 dark:bg-gray-800 shrink-0 group">
              {fotoUrl ? (
                <img src={fotoUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-600 font-bold text-3xl font-serif">
                  {getInitials()}
                </div>
              )}
              <label className="absolute inset-0 bg-black/50 hidden group-hover:flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-bold uppercase text-center transition-all">
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Cambiar<br/>Foto</span>
                  </>
                )}
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={uploading} />
              </label>
            </div>
            {profile?.foto_url && (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="text-[11px] text-red-600 hover:text-red-700 dark:text-red-400 font-medium transition-colors"
              >
                Eliminar foto
              </button>
            )}
          </div>
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {nombreCompleto}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {profile?.Role?.nombre_rol || "Administrador"}
              </p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                MAVET, Venezuela
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar foto de perfil"
        message="¿Estás seguro de eliminar tu foto de perfil? Esta acción no se puede deshacer."
        variant="danger"
        confirmLabel="Eliminar"
        onConfirm={handleRemovePhoto}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
