import { useState, useEffect } from "react";

export default function UserMetaCard({ profile }: { profile: any }) {
  const trabajador = profile?.Trabajador || {};
  const nombreCompleto = trabajador.nombres ? `${trabajador.nombres} ${trabajador.apellidos}` : "Usuario MAVET";
  const fotoUrl = profile?.foto_url || trabajador.foto_url || null;
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [fotoUrl]);
  const inicial = (trabajador.nombres || "U")[0]?.toUpperCase() || "U";

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 flex items-center justify-center bg-brand-100 text-brand-600 shrink-0">
            {fotoUrl && !imgError ? (
              <img src={fotoUrl} alt="Avatar" className="w-full h-full object-cover" onError={() => setImgError(true)} />
            ) : (
              <span className="text-2xl font-bold text-brand-700 dark:text-brand-400">{inicial}</span>
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
    </div>
  );
}
